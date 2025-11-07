
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Beef } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

export type SellerLivestockTableListing = Tables<'livestock_listings'> & {
  listing_invitations: {
    reference_id: string;
  } | null;
};

interface SellerLivestockTableProps {
  onViewListing: (listing: SellerLivestockTableListing) => void;
  onEditListing: (listing: SellerLivestockTableListing) => void;
}

export const SellerLivestockTable = ({ onViewListing, onEditListing }: SellerLivestockTableProps) => {
  const [listings, setListings] = useState<SellerLivestockTableListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setListings([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('livestock_listings')
          .select('*, listing_invitations(reference_id)')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const normalizedListings = (data ?? []).map((listing) => {
          const { listing_invitations: rawInvitation, ...rest } = listing as Tables<'livestock_listings'> & {
            listing_invitations?: unknown;
          };

          let normalizedInvitation: { reference_id: string } | null = null;
          if (
            rawInvitation &&
            typeof rawInvitation === 'object' &&
            !Array.isArray(rawInvitation) &&
            'reference_id' in rawInvitation &&
            typeof (rawInvitation as { reference_id?: unknown }).reference_id === 'string'
          ) {
            normalizedInvitation = {
              reference_id: (rawInvitation as { reference_id: string }).reference_id,
            };
          }

          return {
            ...(rest as Tables<'livestock_listings'>),
            listing_invitations: normalizedInvitation,
          } satisfies SellerLivestockTableListing;
        });

        setListings(normalizedListings as SellerLivestockTableListing[]);
      } catch (error) {
        console.error('Error fetching livestock listings:', error);
        toast({
          title: t('sellerLivestockTable', 'toastErrorTitle'),
          description: t('sellerLivestockTable', 'toastErrorDescription'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('sellerLivestockTable', 'statusPending');
      case 'approved':
        return t('sellerLivestockTable', 'statusApproved');
      case 'rejected':
        return t('sellerLivestockTable', 'statusRejected');
      default:
        return t('sellerLivestockTable', 'statusDefault');
    }
  };

  const checkIfCanEdit = async (listing: LivestockListing) => {
    // Check if listing has any offers
    const { data: offers, error } = await supabase
      .from('livestock_offers')
      .select('id')
      .eq('listing_id', listing.id)
      .limit(1);

    if (error) {
      console.error('Error checking offers:', error);
      return false;
    }

    // Can edit if no offers exist
    return offers.length === 0;
  };

  const handleEdit = async (listing: LivestockListing) => {
    const canEdit = await checkIfCanEdit(listing);
    if (canEdit) {
      onEditListing(listing);
    } else {
      toast({
        title: t('sellerLivestockTable', 'toastCannotEditTitle'),
        description: t('sellerLivestockTable', 'toastCannotEditDescription'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('sellerLivestockTable', 'loadingMessage')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Beef className="w-5 h-5 mr-2" />
          {t('sellerLivestockTable', 'title')}
        </CardTitle>
        <CardDescription>
          {t('sellerLivestockTable', 'description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('sellerLivestockTable', 'emptyState')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('sellerLivestockTable', 'columnOwner')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnLocation')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnBreed')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnTotalLivestock')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnStatus')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnCreated')}</TableHead>
                <TableHead>{t('sellerLivestockTable', 'columnActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
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
                      {getStatusLabel(listing.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewListing(listing)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {t('sellerLivestockTable', 'viewButton')}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {t('sellerLivestockTable', 'editButton')}
                      </Button>
                    </div>
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
