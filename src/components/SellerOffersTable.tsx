
import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'> & {
    listing_invitations: {
      reference_id: string;
    } | null;
  };
};

interface SellerOffersTableProps {
  onViewOffer: (offer: LivestockOffer) => void;
}

export const SellerOffersTable = ({ onViewOffer }: SellerOffersTableProps) => {
  const [offers, setOffers] = useState<LivestockOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('livestock_offers')
        .select(`
          *,
          livestock_listings (
            *,
            listing_invitations!livestock_listings_invitation_id_fkey ( reference_id )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: "Error",
        description: "Failed to load offers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading offers...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livestock Offers</CardTitle>
        <CardDescription>
          Review and respond to offers for your livestock listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No offers found
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                                <TableHead>Reference ID</TableHead>
                <TableHead>Listing</TableHead>
                <TableHead>Offer Amount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                                    <TableCell className="font-mono">
                    {offer.livestock_listings.listing_invitations?.reference_id || 'N/A'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {offer.livestock_listings.owner_name} - {offer.livestock_listings.breed}
                  </TableCell>
                  <TableCell>R{offer.chalmar_beef_offer}/KG</TableCell>
                  <TableCell>
                    {new Date(offer.offer_valid_until_date).toLocaleDateString()} {offer.offer_valid_until_time}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeColor(offer.status)}
                    >
                      {offer.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(offer.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewOffer(offer)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
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
