
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

// Extended type that includes the invitation_id field and joined invitation data
type LivestockListingWithInvitation = Tables<'livestock_listings'> & {
  invitation_id?: string | null;
  listing_invitations?: {
    reference_id: string;
  } | null;
};

type LivestockListing = LivestockListingWithInvitation;

interface LivestockListingsTableProps {
  onViewListing: (listing: LivestockListing) => void;
}

export const LivestockListingsTable = ({ onViewListing }: LivestockListingsTableProps) => {
  const [listings, setListings] = useState<LivestockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchListings = useCallback(async () => {
    try {
      // First, fetch all livestock listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('livestock_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsError) throw listingsError;

      // Then, fetch invitation data separately to avoid complex join issues
      const listingsWithInvitations: LivestockListing[] = [];
      
      for (const listing of listingsData || []) {
        let invitationData = null;
        
        // Cast to our extended type to access invitation_id property
        const listingWithInvitation = listing as LivestockListingWithInvitation;
        
        if (listingWithInvitation.invitation_id) {
          const { data: invitation, error: invitationError } = await supabase
            .from('listing_invitations')
            .select('reference_id')
            .eq('id', listingWithInvitation.invitation_id)
            .single();
          
          if (!invitationError && invitation) {
            invitationData = invitation;
          }
        }
        
        listingsWithInvitations.push({
          ...listing,
          listing_invitations: invitationData
        });
      }

      setListings(listingsWithInvitations);
    } catch (error) {
      console.error('Error fetching livestock listings:', error);
      toast({
        title: t('adminListings', 'loadErrorTitle'),
        description: t('adminListings', 'loadErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatListingStatus = (status: string | null | undefined) => {
    if (!status) {
      return t('common', 'notAvailable');
    }

    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'pending':
        return t('adminListings', 'statusPending');
      case 'approved':
        return t('adminListings', 'statusApproved');
      case 'rejected':
        return t('adminListings', 'statusRejected');
      default:
        return status
          .replace(/_/g, ' ')
          .split(' ')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('adminListings', 'loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminListings', 'title')}</CardTitle>
        <CardDescription>
          {t('adminListings', 'description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('adminListings', 'empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminListings', 'tableReferenceId')}</TableHead>
                <TableHead>{t('adminListings', 'tableOwnerName')}</TableHead>
                <TableHead>{t('adminListings', 'tableLocation')}</TableHead>
                <TableHead>{t('adminListings', 'tableBreed')}</TableHead>
                <TableHead>{t('adminListings', 'tableTotalLivestock')}</TableHead>
                <TableHead>{t('adminListings', 'tableStatus')}</TableHead>
                <TableHead>{t('adminListings', 'tableCreated')}</TableHead>
                <TableHead>{t('adminListings', 'tableActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-mono">
                    {listing.listing_invitations?.reference_id || t('common', 'notAvailable')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {listing.owner_name}
                  </TableCell>
                  <TableCell>{listing.location}</TableCell>
                  <TableCell>{listing.breed}</TableCell>
                  <TableCell>{listing.total_livestock_offered}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeColor(listing.status)}
                    >
                      {formatListingStatus(listing.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewListing(listing)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      {t('adminListings', 'viewDetails')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
