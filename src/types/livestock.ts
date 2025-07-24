import type { Tables } from '@/integrations/supabase/types';
import type { HerdLocation, FarmAddress, MovementRecord } from './location';

export type ListingInvitation = Tables<'listing_invitations'>;

export type LivestockListing = Tables<'livestock_listings'>;

// Enhanced livestock listing with location management
export interface EnhancedLivestockListing extends Omit<LivestockListing, 'loading_points'> {
  loading_points: HerdLocation[];
}
