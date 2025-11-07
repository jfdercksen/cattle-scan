
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

interface OfferDetailsDialogProps {
  offer: LivestockOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOfferUpdated: () => void;
}

export const OfferDetailsDialog = ({ offer, open, onOpenChange, onOfferUpdated }: OfferDetailsDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [sellerNotes, setSellerNotes] = useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  if (!offer) return null;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('offerDetailsDialog', 'statusPending');
      case 'accepted':
        return t('offerDetailsDialog', 'statusAccepted');
      case 'declined':
        return t('offerDetailsDialog', 'statusDeclined');
      default:
        return t('offerDetailsDialog', 'statusUnknown');
    }
  };

  const handleResponse = async (status: 'accepted' | 'declined') => {
    setIsUpdating(true);

    try {
      const { error } = await supabase
        .from('livestock_offers')
        .update({
          status,
          seller_response_date: new Date().toISOString(),
          seller_notes: sellerNotes || null,
        })
        .eq('id', offer.id);

      if (error) throw error;

      const statusText = getStatusLabel(status).toLowerCase();
      toast({
        title: t('offerDetailsDialog', 'toastSuccessTitle'),
        description: t('offerDetailsDialog', 'toastSuccessDescription').replace('{status}', statusText),
      });

      onOfferUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating offer:', error);
      toast({
        title: t('offerDetailsDialog', 'toastErrorTitle'),
        description: t('offerDetailsDialog', 'toastErrorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {t('offerDetailsDialog', 'title')}
            <Badge 
              variant="secondary" 
              className={getStatusBadgeColor(offer.status)}
            >
              {getStatusLabel(offer.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('offerDetailsDialog', 'listingSectionTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'listingOwnerLabel')}:</span> {offer.livestock_listings.owner_name}
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'listingLocationLabel')}:</span> {offer.livestock_listings.location}
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'listingBreedLabel')}:</span> {offer.livestock_listings.breed}
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'listingTotalLivestockLabel')}:</span> {offer.livestock_listings.total_livestock_offered}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('offerDetailsDialog', 'termsSectionTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'chalmarOfferLabel')}:</span> R{offer.chalmar_beef_offer}/KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'toWeightLabel')}:</span> {offer.to_weight} KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'thenPenalizationLabel')}:</span> {offer.then_penilazation_of}c/KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'andFromLabel')}:</span> {offer.and_from} KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'penalizationLabel')}:</span> {offer.penilazation_of}c/KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'percentHeifersAllowedLabel')}:</span> {offer.percent_heifers_allowed}%
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'additionalHeifersPenaltyLabel')}:</span> {offer.penilazation_for_additional_heifers}c/KG
              </div>
              <div>
                <span className="font-medium">{t('offerDetailsDialog', 'validUntilLabel')}:</span> {new Date(offer.offer_valid_until_date).toLocaleDateString()} {offer.offer_valid_until_time}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {offer.additional_r25_per_calf && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('offerDetailsDialog', 'additionalR25Text')}
                </div>
              )}
              {offer.affidavit_required && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  {t('offerDetailsDialog', 'affidavitRequiredText')}
                </div>
              )}
            </div>
          </div>

          {offer.status === 'pending' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="seller-notes">{t('offerDetailsDialog', 'responseNotesLabel')}</Label>
                <Textarea
                  id="seller-notes"
                  placeholder={t('offerDetailsDialog', 'responseNotesPlaceholder')}
                  value={sellerNotes}
                  onChange={(e) => setSellerNotes(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleResponse('declined')}
                  disabled={isUpdating}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {t('offerDetailsDialog', 'declineButton')}
                </Button>
                <Button
                  onClick={() => handleResponse('accepted')}
                  disabled={isUpdating}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('offerDetailsDialog', 'acceptButton')}
                </Button>
              </div>
            </div>
          )}

          {offer.status !== 'pending' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('offerDetailsDialog', 'responseDetailsTitle')}</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">{t('offerDetailsDialog', 'responseDateLabel')}:</span> {
                    offer.seller_response_date 
                      ? new Date(offer.seller_response_date).toLocaleString()
                      : t('common', 'notAvailable')
                  }
                </div>
                {offer.seller_notes && (
                  <div>
                    <span className="font-medium">{t('offerDetailsDialog', 'notesLabel')}:</span>
                    <p className="mt-1 text-gray-700">{offer.seller_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>{t('offerDetailsDialog', 'noteHeading')}</strong> {t('offerDetailsDialog', 'noteDescription')}
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('offerDetailsDialog', 'closeButton')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
