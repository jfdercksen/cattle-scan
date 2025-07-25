import { supabase } from '@/integrations/supabase/client';
import { CompanyService } from './companyService';
import type { Tables, Database } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'>;
export type LivestockListing = Tables<'livestock_listings'>;
export type ListingInvitation = Tables<'listing_invitations'>;
export type LivestockOffer = Tables<'livestock_offers'>;
export type Company = Tables<'companies'>;

export interface DashboardData {
  companies: Company[];
  listings: LivestockListing[];
  invitations: ListingInvitation[];
  offers: LivestockOffer[];
  profiles: Profile[];
}

export interface CompanyContext {
  companyId: string;
  companyName: string;
  userRole: Database['public']['Enums']['user_role'];
}

export class MultiTenantDashboardController {
  /**
   * Get dashboard data based on user role and company context
   */
  static async getDashboardData(userId: string, userRole: string): Promise<{ data: DashboardData | null; error: any }> {
    try {
      let dashboardData: DashboardData = {
        companies: [],
        listings: [],
        invitations: [],
        offers: [],
        profiles: []
      };

      if (userRole === 'super_admin') {
        // Super admin sees everything across all companies
        dashboardData = await this.getSuperAdminData();
      } else {
        // Other users see only data from their associated companies
        dashboardData = await this.getUserCompanyData(userId, userRole);
      }

      return { data: dashboardData, error: null };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all data for super admin
   */
  private static async getSuperAdminData(): Promise<DashboardData> {
    const [companiesResult, listingsResult, invitationsResult, profilesResult] = await Promise.all([
      supabase.from('companies').select('*').order('created_at', { ascending: false }),
      supabase.from('livestock_listings').select('*').order('created_at', { ascending: false }),
      supabase.from('listing_invitations').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false })
    ]);

    return {
      companies: companiesResult.data || [],
      listings: listingsResult.data || [],
      invitations: invitationsResult.data || [],
      offers: [], // livestock_offers table is no longer used
      profiles: profilesResult.data || []
    };
  }

  /**
   * Get data for users based on their company associations
   */
  private static async getUserCompanyData(userId: string, userRole: string): Promise<DashboardData> {
    // Get user's company associations
    const { data: userCompanies } = await CompanyService.getUserCompanies(userId);
    const companyIds = userCompanies?.map(c => c.id) || [];



    if (companyIds.length === 0) {
      console.log('DEBUG: No companies found for user, returning empty data');
      return {
        companies: [],
        listings: [],
        invitations: [],
        offers: [],
        profiles: []
      };
    }

    // Fetch data filtered by company associations
    const [companiesResult, listingsResult, invitationsResult, offersResult] = await Promise.all([
      supabase.from('companies').select('*').in('id', companyIds),
      this.getCompanyListings(companyIds, userId, userRole),
      this.getCompanyInvitations(companyIds, userId, userRole),
      this.getCompanyOffers(companyIds, userId, userRole)
    ]);

    // Get profiles based on role
    let profilesResult;
    if (userRole === 'admin') {
      // Admins see users from their companies
      profilesResult = await this.getCompanyProfiles(companyIds);
    } else {
      // Other roles see limited profile data
      profilesResult = { data: [] };
    }

    return {
      companies: companiesResult.data || [],
      listings: listingsResult.data || [],
      invitations: invitationsResult.data || [],
      offers: offersResult.data || [],
      profiles: profilesResult.data || []
    };
  }

  /**
   * Get listings based on company context and user role
   */
  private static async getCompanyListings(companyIds: string[], userId: string, userRole: string) {
    // Use explicit typing to avoid deep instantiation issues
    const baseQuery = supabase.from('livestock_listings').select('*');

    if (userRole === 'seller') {
      // Sellers see only their own listings
      const sellerQuery = baseQuery.eq('seller_id', userId);
      return sellerQuery.order('created_at', { ascending: false });
    } else if (userRole === 'vet') {
      // Vets see listings they're assigned to (regardless of company)
      const vetQuery = baseQuery.eq('assigned_vet_id', userId);
      return vetQuery.order('created_at', { ascending: false });
    } else {
      // Admins, agents, load masters see all company listings
      const adminQuery = baseQuery.in('company_id', companyIds);
      return adminQuery.order('created_at', { ascending: false });
    }
  }

  /**
   * Get invitations based on company context and user role
   */
  private static async getCompanyInvitations(companyIds: string[], userId: string, userRole: string) {
    // First, get the invitations
    let invitationsQuery = supabase.from('listing_invitations').select('*');
    
    if (userRole === 'seller') {
      // Sellers see only invitations sent to them
      invitationsQuery = invitationsQuery.eq('seller_id', userId);
    } else {
      // Other roles see company invitations
      invitationsQuery = invitationsQuery.in('company_id', companyIds);
    }

    const invitationsResult = await invitationsQuery.order('created_at', { ascending: false });
    
    if (!invitationsResult.data) {
      return invitationsResult;
    }
    
    // Get livestock listings by reference_id (this is the correct relationship)
    const referenceIds = invitationsResult.data.map(inv => inv.reference_id).filter(Boolean);
    let listingsData: Record<string, any> = {};
    
    if (referenceIds.length > 0) {
      const listingsResult = await supabase
        .from('livestock_listings')
        .select('id, reference_id, status')
        .in('reference_id', referenceIds);
      
      if (listingsResult.data) {
        // Create a lookup map by reference_id
        listingsData = listingsResult.data.reduce((acc: Record<string, any>, listing: any) => {
          acc[listing.reference_id] = listing;
          return acc;
        }, {});
      }
    }

    const result = { ...invitationsResult };
    
    // Transform the data to match the expected format for ListingInvitationsTable
    if (result.data) {
      // Get unique seller IDs from invitations to fetch their profiles
      const sellerIds = [...new Set(result.data.map((inv: any) => inv.seller_id).filter((id: any) => id !== null))] as string[];
      
      // Fetch seller information if we have seller IDs
      let sellerInfo: Record<string, any> = {};
      if (sellerIds.length > 0) {
        const sellersResult = await supabase
          .from('profiles')
          .select('id, email, seller_entity_name')
          .in('id', sellerIds);
        
        if (sellersResult.data) {
          // Create a lookup map for seller info
          sellerInfo = sellersResult.data.reduce((acc: Record<string, any>, seller: any) => {
            acc[seller.id] = seller;
            return acc;
          }, {});
        }
      }
      

      
      const transformedData = result.data.map((invitation: any) => {
        const seller = sellerInfo[invitation.seller_id];
        const listing = listingsData[invitation.reference_id]; // Get listing by reference_id
      
        const transformed = {
          ...invitation,
          // Use seller_entity_name as the company name (this is what we want to display)
          company_name: seller?.seller_entity_name || 'Unknown Seller',
          // Use seller email for contact info
          seller_profile_email: seller?.email || invitation.seller_email || null,
          // Include the livestock listing data if it exists
          livestock_listings: listing ? [listing] : null
        };

        return transformed;
      });
      
      return { ...result, data: transformedData };
    } 
    
    return result;
  }

  /**
   * Get offers based on company context and user role
   * Note: livestock_offers table is no longer used, returning empty data
   */
  private static async getCompanyOffers(companyIds: string[], userId: string, userRole: string) {
    // livestock_offers table is no longer used in the application
    // Return empty data to maintain compatibility
    return { data: [] };
  }

  /**
   * Get profiles from companies (for admins)
   */
  private static async getCompanyProfiles(companyIds: string[]) {
    const { data: relationships } = await supabase
      .from('company_user_relationships')
      .select(`
        profiles (*)
      `)
      .in('company_id', companyIds)
      .eq('status', 'active');

    const profiles = relationships?.map(rel => (rel as any).profiles).filter(Boolean) || [];
    return { data: profiles };
  }

  /**
   * Get user's company contexts (for users with multiple company relationships)
   */
  static async getUserCompanyContexts(userId: string): Promise<{ data: CompanyContext[] | null; error: any }> {
    try {
      // Use security definer function to avoid RLS recursion issues
      const { data: contexts, error } = await supabase
        .rpc('get_user_company_contexts', {
          user_id_param: userId
        });

      if (error) throw error;

      // Transform the data to match CompanyContext interface
      const formattedContexts = contexts?.map((ctx: any) => ({
        companyId: ctx.company_id,
        companyName: ctx.company_name,
        userRole: ctx.user_role
      })) || [];

      return { data: formattedContexts, error: null };
    } catch (error) {
      console.error('Error fetching user company contexts:', error);
      return { data: null, error };
    }
  }

  /**
   * Validate user access to specific company data
   */
  static async validateCompanyAccess(userId: string, companyId: string): Promise<{ hasAccess: boolean; role: string | null }> {
    try {
      // Check if user is super admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (profile?.role === 'super_admin') {
        return { hasAccess: true, role: 'super_admin' };
      }

      // Check company relationship
      const { data: relationship } = await supabase
        .from('company_user_relationships')
        .select('relationship_type')
        .eq('user_id', userId)
        .eq('company_id', companyId)
        .eq('status', 'active')
        .maybeSingle();

      if (relationship) {
        return { hasAccess: true, role: relationship.relationship_type };
      }

      // Check if user is company admin
      const { data: company } = await supabase
        .from('companies')
        .select('admin_user_id')
        .eq('id', companyId)
        .eq('admin_user_id', userId)
        .maybeSingle();

      if (company) {
        return { hasAccess: true, role: 'admin' };
      }

      return { hasAccess: false, role: null };
    } catch (error) {
      console.error('Error validating company access:', error);
      return { hasAccess: false, role: null };
    }
  }

  /**
   * Get filtered data for specific company context
   */
  static async getCompanySpecificData(userId: string, companyId: string): Promise<{ data: Partial<DashboardData> | null; error: any }> {
    try {
      // Validate access first
      const { hasAccess, role } = await this.validateCompanyAccess(userId, companyId);
      
      if (!hasAccess) {
        throw new Error('Access denied to company data');
      }

      // Get company-specific data
      const [listingsResult, invitationsResult, offersResult] = await Promise.all([
        this.getCompanyListings([companyId], userId, role || 'seller'),
        this.getCompanyInvitations([companyId], userId, role || 'seller'),
        this.getCompanyOffers([companyId], userId, role || 'seller')
      ]);

      return {
        data: {
          listings: listingsResult.data || [],
          invitations: invitationsResult.data || [],
          offers: offersResult.data || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching company-specific data:', error);
      return { data: null, error };
    }
  }

  /**
   * Check if user can edit specific listing based on company context and role
   */
  static async canEditListing(userId: string, listingId: string): Promise<boolean> {
    try {
      const { data: listing } = await supabase
        .from('livestock_listings')
        .select('seller_id, company_id')
        .eq('id', listingId)
        .single();

      if (!listing) return false;

      // Seller can edit their own listings
      if (listing.seller_id === userId) return true;

      // Check if user has admin access to the company
      const { hasAccess, role } = await this.validateCompanyAccess(userId, listing.company_id);
      
      return hasAccess && (role === 'admin' || role === 'super_admin');
    } catch (error) {
      console.error('Error checking listing edit permissions:', error);
      return false;
    }
  }
}
