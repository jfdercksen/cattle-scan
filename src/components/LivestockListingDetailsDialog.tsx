
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LivestockOfferForm } from './LivestockOfferForm';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

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
  const { t } = useTranslation();

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

  const formatListingStatus = (status: string) => {
    switch (status) {
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
            {t('adminListings', 'dialogTitle')}
            <Badge 
              variant="secondary" 
              className={getStatusBadgeColor(listing.status)}
            >
              {formatListingStatus(listing.status)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Responsible Person Information */}
          {(listing.responsible_person_name || listing.responsible_person_designation) && (
            <div>
              <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'responsibleSectionTitle')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                {listing.responsible_person_name && (
                  <div>
                    <span className="font-medium">{t('adminListings', 'responsibleNameLabel')}:</span> {listing.responsible_person_name}
                  </div>
                )}
                {listing.responsible_person_designation && (
                  <div>
                    <span className="font-medium">{t('adminListings', 'responsibleDesignationLabel')}:</span> {listing.responsible_person_designation}
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'basicSectionTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('adminListings', 'ownerNameLabel')}:</span> {listing.owner_name}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'bredOrBoughtLabel')}:</span> {listing.bred_or_bought}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'locationLabel')}:</span> {listing.location}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'weighingLocationLabel')}:</span> {listing.weighing_location}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'breedLabel')}:</span> {listing.breed}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'totalLivestockOfferedLabel')}:</span> {listing.total_livestock_offered}
              </div>
            </div>
          </div>

          {/* Supplier Identity & Location */}
          {(listing.breeder_name || listing.farm_birth_address || listing.farm_loading_address) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'supplierSectionTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.breeder_name && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'breederNameLabel')}:</span> {listing.breeder_name}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{t('adminListings', 'isBreederSellerLabel')}:</span> {listing.is_breeder_seller ? t('common', 'yes') : t('common', 'no')}
                  </div>
                  {listing.farm_birth_address && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'farmBirthAddressLabel')}:</span> {listing.farm_birth_address}
                    </div>
                  )}
                  {listing.farm_loading_address && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'farmLoadingAddressLabel')}:</span> {listing.farm_loading_address}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{t('adminListings', 'livestockMovedLabel')}:</span> {listing.livestock_moved_out_of_boundaries ? t('common', 'yes') : t('common', 'no')}
                  </div>
                  {listing.livestock_moved_location && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'livestockMovedFromLabel')}:</span> {listing.livestock_moved_location}
                    </div>
                  )}
                  {listing.livestock_moved_location_to && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'livestockMovedToLabel')}:</span> {listing.livestock_moved_location_to}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Loading Points */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'loadingPointsSectionTitle')}</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((point) => {
                const loadingPoint = listing[`loading_points_${point}` as keyof LivestockListing] as number;
                const livestockAtPoint = listing[`livestock_at_loading_point_${point}` as keyof LivestockListing] as number;
                
                return (
                  <div key={point} className="p-3 border rounded-lg">
                    <div className="font-medium">{t('adminListings', 'loadingPointLabel').replace('{index}', String(point))}</div>
                    <div className="text-sm text-gray-600">
                      {t('adminListings', 'loadingAmountLabel')}: {loadingPoint ?? t('common', 'notAvailable')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {t('adminListings', 'loadingLivestockLabel')}: {livestockAtPoint ?? t('common', 'notAvailable')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Livestock Details */}
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'livestockDetailsSectionTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('adminListings', 'numberOfHeifersLabel')}:</span> {listing.number_of_heifers ?? t('common', 'notAvailable')}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'malesCastratedLabel')}:</span> {listing.males_castrated ? t('common', 'yes') : t('common', 'no')}
              </div>
              {listing.mothers_status && (
                <div>
                  <span className="font-medium">{t('adminListings', 'mothersStatusLabel')}:</span> {listing.mothers_status}
                </div>
              )}
              {listing.weaned_duration && (
                <div>
                  <span className="font-medium">{t('adminListings', 'weanedDurationLabel')}:</span> {listing.weaned_duration}
                </div>
              )}
              <div>
                <span className="font-medium">{t('adminListings', 'grazingGreenFeedLabel')}:</span> {listing.grazing_green_feed ? t('common', 'yes') : t('common', 'no')}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'growthImplantLabel')}:</span> {listing.growth_implant ? t('common', 'yes') : t('common', 'no')}
              </div>
              {listing.growth_implant_type && (
                <div>
                  <span className="font-medium">{t('adminListings', 'growthImplantTypeLabel')}:</span> {listing.growth_implant_type}
                </div>
              )}
              {listing.estimated_average_weight && (
                <div>
                  <span className="font-medium">{t('adminListings', 'estimatedAverageWeightLabel')}:</span> {listing.estimated_average_weight} kg
                </div>
              )}
            </div>
          </div>

          {/* Biosecurity Declarations */}
          <Separator />
          <div>
            <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'biosecuritySectionTitle')}</h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_cloven_hooved_animals ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_cloven_hooved_animals ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityNoClovenLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_livestock_kept_away ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_livestock_kept_away ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityKeptAwayLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_animal_origin_feed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_animal_origin_feed ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityNoAnimalFeedLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_veterinary_products_registered ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_veterinary_products_registered ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityRegisteredProductsLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_foot_mouth_disease ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_foot_mouth_disease ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityNoFmdPropertyLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_foot_mouth_disease_farm ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_foot_mouth_disease_farm ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityNoFmdFarmLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_livestock_south_africa ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_livestock_south_africa ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecuritySouthAfricaLabel')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded-full ${listing.declaration_no_gene_editing ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <span className={`text-sm ${listing.declaration_no_gene_editing ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                  {t('adminListings', 'biosecurityNoGeneEditingLabel')}
                </span>
              </div>
            </div>
          </div>

          {/* Livestock Loading Details */}
          {(listing.number_cattle_loaded || listing.number_sheep_loaded || listing.truck_registration_number) && (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'loadingDetailsSectionTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="font-medium">{t('adminListings', 'numberCattleLoadedLabel')}:</span> {listing.number_cattle_loaded ?? 0}
                  </div>
                  <div>
                    <span className="font-medium">{t('adminListings', 'numberSheepLoadedLabel')}:</span> {listing.number_sheep_loaded ?? 0}
                  </div>
                  {listing.truck_registration_number && (
                    <div>
                      <span className="font-medium">{t('adminListings', 'truckRegistrationLabel')}:</span> {listing.truck_registration_number}
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
                <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'digitalSignatureSectionTitle')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="p-4 border rounded-lg bg-white">
                      <img 
                        src={listing.signature_data} 
                        alt={t('adminListings', 'digitalSignatureAlt')} 
                        className="max-w-full max-h-32 object-contain"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {listing.signature_date && (
                      <div>
                        <span className="font-medium">{t('adminListings', 'signedDateLabel')}:</span> {new Date(listing.signature_date).toLocaleString()}
                      </div>
                    )}
                    {listing.signed_location && (
                      <div>
                        <span className="font-medium">{t('adminListings', 'signedLocationLabel')}:</span> {listing.signed_location}
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
            <h3 className="text-lg font-semibold mb-3">{t('adminListings', 'timelineSectionTitle')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-medium">{t('adminListings', 'createdLabel')}:</span> {new Date(listing.created_at).toLocaleString()}
              </div>
              <div>
                <span className="font-medium">{t('adminListings', 'updatedLabel')}:</span> {new Date(listing.updated_at).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('adminListings', 'closeButton')}
            </Button>
            {listing.status === 'pending' && (
              <Button onClick={handleCreateOffer}>
                {t('adminListings', 'createOfferButton')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
