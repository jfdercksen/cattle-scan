
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

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

interface AdminOffersTableProps {
  onViewOffer: (offer: LivestockOffer) => void;
}

export const AdminOffersTable = ({ onViewOffer }: AdminOffersTableProps) => {
  const [offers, setOffers] = useState<LivestockOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  const fetchOffers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('livestock_offers')
        .select(`
          *,
          livestock_listings (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('adminOffers', 'failedToLoad'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('adminOffers', 'statusPending');
      case 'accepted':
        return t('adminOffers', 'statusAccepted');
      case 'declined':
        return t('adminOffers', 'statusDeclined');
      default:
        return status;
    }
  };

  const formatCurrencyKg = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return t('common', 'notAvailable');
    }
    return `${t('adminOffers', 'currencyPrefix')}${value}${t('adminOffers', 'offerAmountSuffix')}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('adminOffers', 'loading')}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminOffers', 'title')}</CardTitle>
        <CardDescription>
          {t('adminOffers', 'description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t('adminOffers', 'empty')}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('adminOffers', 'listingColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'offerAmountColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'validUntilColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'statusColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'responseDateColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'createdColumn')}</TableHead>
                <TableHead>{t('adminOffers', 'actionsColumn')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">
                    {offer.livestock_listings.owner_name} - {offer.livestock_listings.breed}
                  </TableCell>
                  <TableCell>{formatCurrencyKg(offer.chalmar_beef_offer)}</TableCell>
                  <TableCell>
                    {new Date(offer.offer_valid_until_date).toLocaleDateString()} {offer.offer_valid_until_time}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeColor(offer.status)}
                    >
                      {getStatusLabel(offer.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {offer.seller_response_date 
                      ? new Date(offer.seller_response_date).toLocaleDateString()
                      : t('common', 'notAvailable')
                    }
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
                      {t('adminOffers', 'viewDetails')}
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
