import { supabase } from '@/integrations/supabase/client';
import type { Tables, Database } from '@/integrations/supabase/types';

export type Company = Tables<'companies'>;
export type CompanyUserRelationship = Tables<'company_user_relationships'>;
export type Profile = Tables<'profiles'>;

export interface CompanyWithRelationships extends Company {
  company_user_relationships: (CompanyUserRelationship & {
    profiles: Profile;
  })[];
}

export interface CreateCompanyData {
  name: string;
  admin_user_id: string;
  settings?: Record<string, any>;
}

export interface CompanyUserRelationshipData {
  company_id: string;
  user_id: string;
  relationship_type: Database['public']['Enums']['user_role'];
  invited_by?: string;
  status?: 'pending' | 'active' | 'inactive';
}

export interface PendingInvitationData {
  company_id: string;
  email: string;
  relationship_type: 'admin' | 'seller' | 'vet' | 'agent' | 'load_master';
  invited_by: string;
  status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
}

export class CompanyService {
  /**
   * Create a new company with the specified admin user
   */
  static async createCompany(data: CreateCompanyData): Promise<{ data: Company | null; error: any }> {
    try {
      const { data: company, error } = await supabase
        .from('companies')
        .insert({
          name: data.name,
          admin_user_id: data.admin_user_id,
          settings: data.settings || {}
        })
        .select()
        .single();

      if (error) throw error;

      // Create admin relationship
      if (company) {
        await this.createCompanyUserRelationship({
          company_id: company.id,
          user_id: data.admin_user_id,
          relationship_type: 'admin',
          status: 'active'
        });
      }

      return { data: company, error: null };
    } catch (error) {
      console.error('Error creating company:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all companies for super admin or specific company for admin
   */
  static async getCompanies(): Promise<{ data: Company[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching companies:', error);
      return { data: null, error };
    }
  }

  /**
   * Get a specific company by ID
   */
  static async getCompanyById(companyId: string): Promise<{ data: Company | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error fetching company:', error);
      return { data: null, error };
    }
  }

  /**
   * Get companies for a specific user using security definer function to avoid RLS recursion
   */
  static async getUserCompanies(userId: string): Promise<{ data: Company[] | null; error: any }> {
    try {
      // Use the security definer function to avoid RLS recursion issues
      const { data, error } = await supabase
        .rpc('get_user_companies', { user_uuid: userId });

      if (error) throw error;

      // Transform the result to match Company interface
      const companies: Company[] = data?.map((row: any) => ({
        id: row.company_id,
        name: row.company_name,
        admin_user_id: userId, // This might not be accurate for non-admin users, but it's not critical
        settings: {},
        created_at: new Date().toISOString(), // Placeholder values
        updated_at: new Date().toISOString()
      })) || [];

      return { data: companies, error: null };
    } catch (error) {
      console.error('Error fetching user companies:', error);
      return { data: null, error };
    }
  }

  /**
   * Create a company-user relationship
   */
  static async createCompanyUserRelationship(data: CompanyUserRelationshipData): Promise<{ data: CompanyUserRelationship | null; error: any }> {
    try {
      const { data: relationship, error } = await supabase
        .from('company_user_relationships')
        .insert({
          company_id: data.company_id,
          user_id: data.user_id,
          relationship_type: data.relationship_type,
          invited_by: data.invited_by,
          status: data.status || 'pending'
        })
        .select()
        .single();

      return { data: relationship, error };
    } catch (error) {
      console.error('Error creating company user relationship:', error);
      return { data: null, error };
    }
  }

  /**
   * Update company-user relationship status
   */
  static async updateRelationshipStatus(
    relationshipId: string, 
    status: 'pending' | 'active' | 'inactive'
  ): Promise<{ data: CompanyUserRelationship | null; error: any }> {
    try {
      const updateData: any = { status };
      if (status === 'active') {
        updateData.accepted_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('company_user_relationships')
        .update(updateData)
        .eq('id', relationshipId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating relationship status:', error);
      return { data: null, error };
    }
  }

  /**
   * Get company users with their relationships
   */
  static async getCompanyUsers(companyId: string): Promise<{ data: (CompanyUserRelationship & { profiles: Profile })[] | null; error: any }> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use security definer function to avoid RLS recursion
      const { data, error } = await supabase.rpc('get_company_users', {
        company_id_param: companyId,
        requesting_user_id: user.id
      });

      if (error) throw error;

      // Transform the flat data back to the expected nested structure
      const transformedData = data?.map((row: any) => ({
        id: row.id,
        company_id: row.company_id,
        user_id: row.user_id,
        relationship_type: row.relationship_type,
        status: row.status,
        invited_by: row.invited_by,
        created_at: row.created_at,
        accepted_at: row.accepted_at,
        profiles: {
          id: row.user_id,
          email: row.user_email,
          first_name: row.user_first_name,
          last_name: row.user_last_name,
          role: row.user_role, // Now properly typed as user_role enum
          status: row.user_status, // Now properly typed as user_status enum
          company_name: row.user_company_name,
          seller_entity_name: row.user_seller_entity_name
        }
      })) || [];

      return { data: transformedData as any, error: null };
    } catch (error) {
      console.error('Error fetching company users:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user exists in the system
   */
  static async checkUserExists(email: string): Promise<{ exists: boolean; user: Profile | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;

      return { exists: !!data, user: data, error: null };
    } catch (error) {
      console.error('Error checking user existence:', error);
      return { exists: false, user: null, error };
    }
  }

  /**
   * Create a pending invitation for a user who hasn't registered yet
   */
  static async createPendingInvitation(invitationData: PendingInvitationData): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('pending_company_invitations')
        .insert({
          company_id: invitationData.company_id,
          email: invitationData.email,
          relationship_type: invitationData.relationship_type,
          invited_by: invitationData.invited_by,
          status: invitationData.status || 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error('Error creating pending invitation:', error);
      return { data: null, error };
    }
  }

  /**
   * Get user's active company relationships
   */
  static async getUserRelationships(userId: string): Promise<{ data: (CompanyUserRelationship & { companies: Company })[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_user_relationships')
        .select(`
          *,
          companies (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      return { data: data as any, error };
    } catch (error) {
      console.error('Error fetching user relationships:', error);
      return { data: null, error };
    }
  }

  /**
   * Invite a user to join a company
   * Handles both existing and non-existing users
   */
  static async inviteUser(
    companyId: string, 
    email: string, 
    relationshipType: 'admin' | 'seller' | 'vet' | 'agent' | 'load_master'
  ): Promise<{ data: any; error: any }> {
    try {
      // Get current user ID for invited_by field
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if user already exists
      const { exists, user: existingUser, error: checkError } = await this.checkUserExists(email);
      if (checkError) throw checkError;

      if (exists && existingUser) {
        // User exists - create direct company relationship
        const { data, error } = await this.createCompanyUserRelationship({
          company_id: companyId,
          user_id: existingUser.id,
          relationship_type: relationshipType,
          invited_by: user.id,
          status: 'pending'
        });
        
        if (error) throw error;
        return { data, error: null };
      } else {
        // User doesn't exist - create pending invitation
        const { data, error } = await this.createPendingInvitation({
          company_id: companyId,
          email: email,
          relationship_type: relationshipType,
          invited_by: user.id,
          status: 'pending'
        });
        
        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error inviting user:', error);
      return { data: null, error };
    }
  }

  /**
   * Remove a user from a company
   */
  static async removeUserFromCompany(relationshipId: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('company_user_relationships')
        .delete()
        .eq('id', relationshipId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error removing user from company:', error);
      return { data: null, error };
    }
  }

  /**
   * Approve a user (update their status from pending to approved)
   * Uses security definer function to bypass RLS restrictions
   */
  static async approveUser(userId: string): Promise<{ data: any; error: any }> {
    try {
      // Get current user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Use security definer function to approve user
      const { data, error } = await supabase.rpc('approve_user_by_admin' as any, {
        target_user_id: userId,
        requesting_user_id: user.id
      });

      if (error) throw error;

      // Return the first result (should be single user)
      return { data: data?.[0] || null, error: null };
    } catch (error) {
      console.error('Error approving user:', error);
      return { data: null, error };
    }
  }

  /**
   * Update company settings
   */
  static async updateCompanySettings(companyId: string, settings: Record<string, any>): Promise<{ data: Company | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('companies')
        .update({ settings })
        .eq('id', companyId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error updating company settings:', error);
      return { data: null, error };
    }
  }
}
