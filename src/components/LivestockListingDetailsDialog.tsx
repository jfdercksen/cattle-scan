
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LivestockOfferForm } from './LivestockOfferForm';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'> & {
  listing_invitations: {
    reference_id: string;
  } | null;
};

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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
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
          {/* Responsible Person Information */}
          {(listing.responsible_person_name || listing.responsible_person_designation) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Responsible Person Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {listing.responsible_person_name && (
                  <div>
                    <span className="font-medium">Name:</span> {listing.responsible_person_name}
                  </div>
                )}
                {listing.responsible_person_designation && (
                  <div>
                    <span className="font-medium">Designation:</span> {listing.responsible_person_designation}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

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

          {/* Supplier Identity & Location */}
          {(listing.breeder_name || listing.farm_birth_address || listing.farm_loading_address) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Supplier Identity & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.breeder_name && (
                    <div>
                      <span className="font-medium">Breeder Name:</span> {listing.breeder_name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Is Breeder the Seller:</span> {listing.is_breeder_seller ? 'Yes' : 'No'}
                  </div>
                  {listing.farm_birth_address && (
                    <div>
                      <span className="font-medium">Farm Birth Address:</span> {listing.farm_birth_address}
                    </div>
                  )}
                  {listing.farm_loading_address && (
                    <div>
                      <span className="font-medium">Farm Loading Address:</span> {listing.farm_loading_address}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Livestock Moved Out of Boundaries:</span> {listing.livestock_moved_out_of_boundaries ? 'Yes' : 'No'}
                  </div>
                  {listing.livestock_moved_location && (
                    <div>
                      <span className="font-medium">Location Where Moved:</span> {listing.livestock_moved_location}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

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

          <Separator />

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

          {/* Biosecurity Declarations */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">Biosecurity Declarations</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_cloven_hooved_animals ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_cloven_hooved_animals ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  No cloven-hooved animals other than cattle on property (12 months)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_livestock_kept_away ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_livestock_kept_away ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  Livestock kept away from others (21 days)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_animal_origin_feed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_animal_origin_feed ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  No feed of animal origin used
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_veterinary_products_registered ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_veterinary_products_registered ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  Only registered veterinary products used (Act 36 of 1947)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_foot_mouth_disease ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_foot_mouth_disease ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  No foot-and-mouth disease on property (12 months)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_foot_mouth_disease_farm ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_foot_mouth_disease_farm ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  Farm outside foot-and-mouth disease control area
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_livestock_south_africa ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_livestock_south_africa ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  Livestock born and raised in South Africa
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_gene_editing ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_gene_editing ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  No gene editing or genetic modification performed
                </span>
              </div>
            </div>
          </div>

          {/* Livestock Loading Details */}
          {(listing.number_cattle_loaded || listing.number_sheep_loaded || listing.truck_registration_number) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Livestock Loading Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">Number of Cattle Loaded:</span> {listing.number_cattle_loaded || 0}
                  </div>
                  <div>
                    <span className="font-medium">Number of Sheep Loaded:</span> {listing.number_sheep_loaded || 0}
                  </div>
                  {listing.truck_registration_number && (
                    <div>
                      <span className="font-medium">Truck Registration:</span> {listing.truck_registration_number}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Digital Signature */}
          {listing.signature_data && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Digital Signature</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="p-4 border rounded-lg bg-white">
                      <img 
                        src={listing.signature_data} 
                        alt="Digital Signature" 
                        className="max-w-full max-h-32 object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {listing.signature_date && (
                      <div>
                        <span className="font-medium">Signed Date:</span> {new Date(listing.signature_date).toLocaleString()}
                      </div>
                    )}
                    {listing.signed_location && (
                      <div>
                        <span className="font-medium">Signed Location:</span> {listing.signed_location}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

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
