
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

interface AdminOfferDetailsDialogProps {
  offer: LivestockOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminOfferDetailsDialog = ({ offer, open, onOpenChange }: AdminOfferDetailsDialogProps) => {
  const { t } = useTranslation();

  if (!offer) return null;

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

  const formatOfferStatus = (status: string) => {
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

  const formatKg = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return t('common', 'notAvailable');
    }
    return `${value} ${t('adminOffers', 'kgUnit')}`;
  };

  const formatCents = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return t('common', 'notAvailable');
    }
    return `${value}${t('adminOffers', 'centSuffix')}${t('adminOffers', 'offerAmountSuffix')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('adminOffers', 'dialogTitle')}
            <Badge 
              variant="secondary" 
              className={getStatusBadgeColor(offer.status)}
            >
              {formatOfferStatus(offer.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminOffers', 'listingInfoHeading')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{t('adminOffers', 'listingOwnerLabel')}:</span> {offer.livestock_listings.owner_name}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'listingLocationLabel')}:</span> {offer.livestock_listings.location}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'listingBreedLabel')}:</span> {offer.livestock_listings.breed}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'listingTotalLivestockLabel')}:</span> {offer.livestock_listings.total_livestock_offered}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminOffers', 'offerTermsHeading')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('adminOffers', 'chalmarOfferLabel')}:</span> {formatCurrencyKg(offer.chalmar_beef_offer)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'toWeightLabel')}:</span> {formatKg(offer.to_weight)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'thenPenalizationLabel')}:</span> {formatCents(offer.then_penilazation_of)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'andFromLabel')}:</span> {formatKg(offer.and_from)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'penalizationLabel')}:</span> {formatCents(offer.penilazation_of)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'percentHeifersAllowedLabel')}:</span> {offer.percent_heifers_allowed}%
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'additionalHeifersPenaltyLabel')}:</span> {formatCents(offer.penilazation_for_additional_heifers)}
              </div>
              <div>
                <span className="font-medium">{t('adminOffers', 'validUntilLabel')}:</span> {new Date(offer.offer_valid_until_date).toLocaleDateString()} {offer.offer_valid_until_time}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {offer.additional_r25_per_calf && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('adminOffers', 'additionalPaymentNote')}
                </div>
              )}
              {offer.affidavit_required && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('adminOffers', 'affidavitNote')}
                </div>
              )}
            </div>
          </div>

          {offer.status !== 'pending' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('adminOffers', 'sellerResponseHeading')}</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">{t('adminOffers', 'responseDateLabel')}:</span> {
                    offer.seller_response_date 
                      ? new Date(offer.seller_response_date).toLocaleString()
                      : t('common', 'notAvailable')
                  }
                </div>
                {offer.seller_notes && (
                  <div>
                    <span className="font-medium">{t('adminOffers', 'sellerNotesLabel')}:</span>
                    <p className="mt-1 text-gray-700">{offer.seller_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('adminOffers', 'noteTitle')}:</strong> {t('adminOffers', 'noteDescription')}
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common', 'close')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
