import { supabase } from '@/integrations/supabase/client';
import { CompanyService } from './companyService';
import type { Tables, Database } from '@/integrations/supabase/types';

export type ListingInvitation = Tables<'listing_invitations'>;
export type Profile = Tables<'profiles'>;

export interface InvitationData {
  seller_email: string;
  company_id: string;
  invited_by: string;
  reference_id: string;
  listing_id: string; // Reference to the livestock listing
}

export interface UserExistenceCheck {
  exists: boolean;
  user: Profile | null;
  needsRegistration: boolean;
  needsCompanyRelationship: boolean;
}

export class InvitationManager {
  /**
   * Check if user exists and determine invitation type needed
   */
  static async checkUserExists(email: string, companyId: string): Promise<UserExistenceCheck> {
    try {
      // Check if user exists in profiles
      const { exists, user, error: userError } = await CompanyService.checkUserExists(email);
      
      if (userError) {
        throw userError;
      }

      if (!exists || !user) {
        return {
          exists: false,
          user: null,
          needsRegistration: true,
          needsCompanyRelationship: false
        };
      }

      // User exists, check if they have relationship with this company
      const { data: relationships, error: relError } = await supabase
        .from('company_user_relationships')
        .select('*')
        .eq('user_id', user.id)
        .eq('company_id', companyId)
        .eq('status', 'active');

      if (relError) {
        throw relError;
      }

      const hasActiveRelationship = relationships && relationships.length > 0;

      return {
        exists: true,
        user,
        needsRegistration: false,
        needsCompanyRelationship: !hasActiveRelationship
      };
    } catch (error) {
      console.error('Error checking user existence:', error);
      throw error;
    }
  }

  /**
   * Create listing invitation with appropriate user handling
   */
  static async createInvitation(data: InvitationData): Promise<{ data: ListingInvitation | null; error: any }> {
    try {
      // Check user existence and company relationship
      const userCheck = await this.checkUserExists(data.seller_email, data.company_id);

      let sellerId: string | null = null;

      if (userCheck.exists && userCheck.user) {
        sellerId = userCheck.user.id;

        // If user exists but needs company relationship, create it
        if (userCheck.needsCompanyRelationship) {
          const { error: relationshipError } = await CompanyService.createCompanyUserRelationship({
            company_id: data.company_id,
            user_id: userCheck.user.id,
            relationship_type: 'seller',
            invited_by: data.invited_by,
            status: 'pending'
          });

          if (relationshipError) {
            throw relationshipError;
          }
        }
      }

      // Create the listing invitation
      const { data: invitation, error } = await supabase
        .from('listing_invitations')
        .insert({
          seller_email: data.seller_email,
          seller_id: sellerId,
          company_id: data.company_id,
          created_by: data.invited_by,
          reference_id: data.reference_id,
          listing_id: data.listing_id, // Link to the livestock listing
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      // Send appropriate email based on user status
      await this.sendInvitationEmail(invitation, userCheck);

      return { data: invitation, error: null };
    } catch (error) {
      console.error('Error creating invitation:', error);
      return { data: null, error };
    }
  }

  /**
   * Send invitation email based on user status
   */
  private static async sendInvitationEmail(
    invitation: ListingInvitation, 
    userCheck: UserExistenceCheck
  ): Promise<void> {
    try {
      // Get company details for email context
      const { data: company } = await CompanyService.getCompanyById(invitation.company_id);
      
      if (!company) {
        throw new Error('Company not found');
      }

      const emailData = {
        to: invitation.seller_email,
        company_name: company.name,
        reference_id: invitation.reference_id
      };

      if (userCheck.needsRegistration) {
        // Send registration invitation email for new users
        await this.sendNewUserInvitationEmail(emailData);
      } else {
        // Send company relationship notification for existing users
        await this.sendExistingUserNotificationEmail(emailData, userCheck.needsCompanyRelationship);
      }
    } catch (error) {
      console.error('Error sending invitation email:', error);
      // Don't throw here as invitation was created successfully
    }
  }

  /**
   * Send invitation email for new users who need to register
   */
  private static async sendNewUserInvitationEmail(emailData: any): Promise<void> {
    // This would integrate with your email service (e.g., Supabase Edge Functions, SendGrid, etc.)
    console.log('Sending new user invitation email:', emailData);
    
    // Example implementation - replace with actual email service
    // await supabase.functions.invoke('send-invitation-email', {
    //   body: {
    //     type: 'new_user_invitation',
    //     ...emailData
    //   }
    // });
  }

  /**
   * Send notification email for existing users about new company relationship
   */
  private static async sendExistingUserNotificationEmail(
    emailData: any, 
    needsCompanyRelationship: boolean
  ): Promise<void> {
    console.log('Sending existing user notification email:', emailData);
    
    // Example implementation - replace with actual email service
    // await supabase.functions.invoke('send-invitation-email', {
    //   body: {
    //     type: needsCompanyRelationship ? 'new_company_relationship' : 'existing_company_invitation',
    //     ...emailData
    //   }
    // });
  }

  /**
   * Accept invitation and activate company relationship if needed
   */
  static async acceptInvitation(invitationId: string, userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Get invitation details
      const { data: invitation, error: invError } = await supabase
        .from('listing_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invError || !invitation) {
        throw invError || new Error('Invitation not found');
      }

      // Update invitation status
      const { error: updateError } = await supabase
        .from('listing_invitations')
        .update({ 
          status: 'accepted',
          seller_id: userId
        })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      // Activate company relationship if it exists and is pending
      const { data: relationships } = await supabase
        .from('company_user_relationships')
        .select('*')
        .eq('user_id', userId)
        .eq('company_id', invitation.company_id)
        .eq('status', 'pending');

      if (relationships && relationships.length > 0) {
        await CompanyService.updateRelationshipStatus(relationships[0].id, 'active');
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      return { success: false, error };
    }
  }

  /**
   * Get invitations for a specific company
   */
  static async getCompanyInvitations(companyId: string): Promise<{ data: ListingInvitation[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_invitations')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      console.error('Error fetching company invitations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get invitations for a specific user across all their companies
   */
  static async getUserInvitations(userId: string): Promise<{ data: (ListingInvitation & { companies: any })[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_invitations')
        .select(`
          *,
          companies (name)
        `)
        .eq('seller_id', userId)
        .order('created_at', { ascending: false });

      return { data: data as any, error };
    } catch (error) {
      console.error('Error fetching user invitations:', error);
      return { data: null, error };
    }
  }

  /**
   * Get pending invitations by email (for users who haven't registered yet)
   */
  static async getPendingInvitationsByEmail(email: string): Promise<{ data: (ListingInvitation & { companies: any })[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('listing_invitations')
        .select(`
          *,
          companies (name)
        `)
        .eq('seller_email', email)
        .is('seller_id', null)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      return { data: data as any, error };
    } catch (error) {
      console.error('Error fetching pending invitations by email:', error);
      return { data: null, error };
    }
  }

  /**
   * Update listing invitations with seller_id after user registration
   * This links email-based invitations to the newly registered user
   */
  static async updateListingInvitationsAfterRegistration(email: string, userId: string): Promise<{ success: boolean; error: any }> {
    try {
      // Update all pending listing invitations for this email to include the new user ID
      const { data, error } = await supabase
        .from('listing_invitations')
        .update({ seller_id: userId })
        .eq('seller_email', email)
        .is('seller_id', null)
        .eq('status', 'pending')
        .select();

      if (error) throw error;

      console.log(`Updated ${data?.length || 0} listing invitations for user ${email}`);
      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating listing invitations after registration:', error);
      return { success: false, error };
    }
  }
}
