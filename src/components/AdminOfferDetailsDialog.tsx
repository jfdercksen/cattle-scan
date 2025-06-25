
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

interface AdminOfferDetailsDialogProps {
  offer: LivestockOffer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminOfferDetailsDialog = ({ offer, open, onOpenChange }: AdminOfferDetailsDialogProps) => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Offer Details
            <Badge 
              variant="secondary" 
              className={getStatusBadgeColor(offer.status)}
            >
              {offer.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Listing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="font-medium">Owner:</span> {offer.livestock_listings.owner_name}
              </div>
              <div>
                <span className="font-medium">Location:</span> {offer.livestock_listings.location}
              </div>
              <div>
                <span className="font-medium">Breed:</span> {offer.livestock_listings.breed}
              </div>
              <div>
                <span className="font-medium">Total Livestock:</span> {offer.livestock_listings.total_livestock_offered}
              </div>
            </div>
          </div>

          {/* Offer Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Offer Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Chalmar Beef Offer:</span> R{offer.chalmar_beef_offer}/KG
              </div>
              <div>
                <span className="font-medium">To Weight:</span> {offer.to_weight} KG
              </div>
              <div>
                <span className="font-medium">Then Penilazation:</span> {offer.then_penilazation_of}c/KG
              </div>
              <div>
                <span className="font-medium">And From:</span> {offer.and_from} KG
              </div>
              <div>
                <span className="font-medium">Penilazation:</span> {offer.penilazation_of}c/KG
              </div>
              <div>
                <span className="font-medium">% Heifers Allowed:</span> {offer.percent_heifers_allowed}%
              </div>
              <div>
                <span className="font-medium">Additional Heifers Penalty:</span> {offer.penilazation_for_additional_heifers}c/KG
              </div>
              <div>
                <span className="font-medium">Valid Until:</span> {new Date(offer.offer_valid_until_date).toLocaleDateString()} {offer.offer_valid_until_time}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {offer.additional_r25_per_calf && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Additional R25 per calf payment for turnover of less than R10 million
                </div>
              )}
              {offer.affidavit_required && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Attached sworn affidavit must be completed and submitted
                </div>
              )}
            </div>
          </div>

          {offer.status !== 'pending' && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Seller Response</h3>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="mb-2">
                  <span className="font-medium">Response Date:</span> {
                    offer.seller_response_date 
                      ? new Date(offer.seller_response_date).toLocaleString()
                      : 'N/A'
                  }
                </div>
                {offer.seller_notes && (
                  <div>
                    <span className="font-medium">Seller Notes:</span>
                    <p className="mt-1 text-gray-700">{offer.seller_notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This offer is subject to biosecurity terms and evaluation of biosecurity and trace-ability 
              assessment as well as the veterinary declaration. If Chalmar Beef is placed under quarantine before the livestock 
              is offloaded, the offer is withdrawn.
            </p>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
