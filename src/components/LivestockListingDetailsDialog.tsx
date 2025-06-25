
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LivestockOfferForm } from './LivestockOfferForm';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

interface LivestockListingDetailsDialogProps {
  listing: LivestockListing | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LivestockListingDetailsDialog = ({ listing, open, onOpenChange }: LivestockListingDetailsDialogProps) => {
  const [showOfferForm, setShowOfferForm] = useState(false);

  if (!listing) return null;

  const handleCreateOffer = () => {
    setShowOfferForm(true);
  };

  const handleOfferSuccess = () => {
    setShowOfferForm(false);
    onOpenChange(false);
  };

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

  if (showOfferForm) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <LivestockOfferForm
            listing={listing}
            onClose={() => setShowOfferForm(false)}
            onSuccess={handleOfferSuccess}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Livestock Listing Details
            <Badge 
              variant="secondary" 
              className={getStatusBadgeColor(listing.status)}
            >
              {listing.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Owner Name:</span> {listing.owner_name}
              </div>
              <div>
                <span className="font-medium">Bred or Bought:</span> {listing.bred_or_bought}
              </div>
              <div>
                <span className="font-medium">Location:</span> {listing.location}
              </div>
              <div>
                <span className="font-medium">Weighing Location:</span> {listing.weighing_location}
              </div>
              <div>
                <span className="font-medium">Breed:</span> {listing.breed}
              </div>
              <div>
                <span className="font-medium">Total Livestock Offered:</span> {listing.total_livestock_offered}
              </div>
            </div>
          </div>

          {/* Loading Points */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Loading Points</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((point) => {
                const loadingPoint = listing[`loading_points_${point}` as keyof LivestockListing] as number;
                const livestockAtPoint = listing[`livestock_at_loading_point_${point}` as keyof LivestockListing] as number;
                
                return (
                  <div key={point} className="p-3 border rounded-lg">
                    <div className="font-medium">Point {point}</div>
                    <div className="text-sm text-gray-600">
                      Loading: {loadingPoint}
                    </div>
                    <div className="text-sm text-gray-600">
                      Livestock: {livestockAtPoint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Livestock Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Livestock Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Number of Heifers:</span> {listing.number_of_heifers}
              </div>
              <div>
                <span className="font-medium">Males Castrated:</span> {listing.males_castrated ? 'Yes' : 'No'}
              </div>
              {listing.mothers_status && (
                <div>
                  <span className="font-medium">Mothers Status:</span> {listing.mothers_status}
                </div>
              )}
              {listing.weaned_duration && (
                <div>
                  <span className="font-medium">Weaned Duration:</span> {listing.weaned_duration}
                </div>
              )}
              <div>
                <span className="font-medium">Grazing Green Feed:</span> {listing.grazing_green_feed ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">Growth Implant:</span> {listing.growth_implant ? 'Yes' : 'No'}
              </div>
              {listing.growth_implant_type && (
                <div>
                  <span className="font-medium">Growth Implant Type:</span> {listing.growth_implant_type}
                </div>
              )}
              {listing.estimated_average_weight && (
                <div>
                  <span className="font-medium">Estimated Average Weight:</span> {listing.estimated_average_weight} kg
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Created:</span> {new Date(listing.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Updated:</span> {new Date(listing.updated_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {listing.status === 'pending' && (
              <Button onClick={handleCreateOffer}>
                Create Offer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
