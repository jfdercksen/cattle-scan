import { useEffect, useState, useCallback, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LivestockCalculations } from '@/lib/calculationEngine';
import { LoadMasterAssignment } from '@/components/admin/LoadMasterAssignment';

type LivestockListing = Tables<'livestock_listings'> & {
  companies?: {
    name: string;
  } | null;
};
type VeterinaryDeclaration = Tables<'veterinary_declarations'>;

interface Address {
  farm_name: string;
  district: string;
  province: string;
}

const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-800 text-right">{value}</span>
  </div>
);

const BooleanDisplay = ({ value }: { value: boolean | null | undefined }) => (
  <span className={value ? 'text-green-600' : 'text-red-600'}>{value ? 'Yes' : 'No'}</span>
);

const AddressDisplay = ({ address }: { address: Json | null | undefined }) => {
  if (address && typeof address === 'object' && !Array.isArray(address)) {
    const { farm_name, district, province } = address;
    if (typeof farm_name === 'string' && typeof district === 'string' && typeof province === 'string') {
      return <>{`${farm_name}, ${district}, ${province}`}</>;
    }
  }
  return <>N/A</>;
};

const YesNoDisplay = ({ label, value }: { label: string; value: boolean | null | undefined }) => (
  <div className="flex justify-between items-center">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <Badge variant={value ? 'default' : 'destructive'}>{value ? 'Yes' : 'No'}</Badge>
  </div>
);

export const AdminViewListingPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [declaration, setDeclaration] = useState<VeterinaryDeclaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingAndDeclaration = useCallback(async () => {
    if (!listingId) return;

    setLoading(true);

    try {
      // Fetch listing data with company information
      const { data: listingData, error: listingError } = await supabase
        .from('livestock_listings')
        .select(`
          *,
          companies(name)
        `)
        .eq('id', listingId)
        .single();

      if (listingError) throw listingError;

      setListing(listingData);

      // Fetch veterinary declaration using the listing's reference_id, not the UUID
      if (listingData.reference_id) {
        const { data: declarationData, error: declarationError } = await supabase
          .from('veterinary_declarations')
          .select('*')
          .eq('reference_id', listingData.reference_id)
          .single();

        if (declarationError && declarationError.code !== 'PGRST116') { // Ignore 'single row not found' error
          console.error('Error fetching declaration:', declarationError);
        } else {
          setDeclaration(declarationData);
        }
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError('Failed to load listing details.');
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListingAndDeclaration();
  }, [listingId, fetchListingAndDeclaration]);

  if (loading) {
    return <div className="text-center p-4">Loading listing details...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center p-4">Listing not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Reference ID: {listing.reference_id}
                {listing.companies && (
                  <><br />Company: {listing.companies.name || 'Unknown Company'}</>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline">{formatStatus(listing.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>General Information</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Owner Name" value={listing.owner_name} />
                <DetailItem label="Livestock Type" value={listing.livestock_type} />
                <DetailItem label="Bred or Bought" value={listing.bred_or_bought} />
                <DetailItem label="Breeder Name" value={listing.breeder_name} />
                <DetailItem label="Is Breeder the Seller?" value={<BooleanDisplay value={listing.is_breeder_seller} />} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Livestock Details</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Total Livestock Offered" value={listing.total_livestock_offered} />
                <DetailItem label="Number of Heifers" value={listing.number_of_heifers} />
                <DetailItem label="Males Castrated" value={<BooleanDisplay value={listing.males_castrated} />} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Location & Loading Points</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Basic Location Information */}
                  <div className="space-y-2">
                    <DetailItem label="Location" value={listing.location} />
                    <DetailItem label="Livestock Moved Out of Boundaries" value={<BooleanDisplay value={listing.livestock_moved_out_of_boundaries} />} />
                    {listing.livestock_moved_out_of_boundaries && 
                        <>
                            <DetailItem label="Moved Location From" value={<AddressDisplay address={listing.livestock_moved_location} />} /> 
                            <DetailItem label="Moved Location To" value={<AddressDisplay address={listing.livestock_moved_location_to} />} />
                        </>
                    }
                  </div>

                  {/* Loading Summary */}
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h4 className="text-lg font-semibold mb-3">Livestock Loading Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Only show cattle count if > 0 */}
                      {(listing.number_cattle_loaded ?? 0) > 0 && (
                        <div>
                          <p><strong>Total Cattle:</strong> {listing.number_cattle_loaded}</p>
                        </div>
                      )}

                      {/* Only show sheep count if > 0 */}
                      {(listing.number_sheep_loaded ?? 0) > 0 && (
                        <div>
                          <p><strong>Total Sheep:</strong> {listing.number_sheep_loaded}</p>
                        </div>
                      )}

                      <div>
                        <Badge variant="outline">
                          {LivestockCalculations.determineLivestockType(
                            listing.number_cattle_loaded ?? 0,
                            listing.number_sheep_loaded ?? 0
                          ) || "No livestock"}
                        </Badge>
                      </div>
                    </div>

                    {/* Loading Points Information */}
                    {listing.loading_points && (() => {
                      try {
                        const loadingPoints = typeof listing.loading_points === 'string'
                          ? JSON.parse(listing.loading_points)
                          : listing.loading_points;

                        if (Array.isArray(loadingPoints) && loadingPoints.length > 0) {
                          return (
                            <div className="mt-4">
                              <h5 className="font-medium mb-3">Loading Points Breakdown</h5>
                              <div className="space-y-3">
                                {loadingPoints.map((point: any, index: number) => {
                                  const hasCattle = (point.number_of_cattle ?? 0) > 0;
                                  const hasSheep = (point.number_of_sheep ?? 0) > 0;

                                  if (!hasCattle && !hasSheep) return null;

                                  return (
                                    <div key={index} className="p-3 bg-white border rounded-md">
                                      <div className="flex justify-between items-start mb-2">
                                        <h6 className="font-medium text-sm">Loading Point {index + 1}</h6>
                                        <div className="flex gap-2">
                                          {hasCattle && (
                                            <Badge variant="secondary" className="text-xs">
                                              {point.number_of_cattle} Cattle
                                            </Badge>
                                          )}
                                          {hasSheep && (
                                            <Badge variant="secondary" className="text-xs">
                                              {point.number_of_sheep} Sheep
                                            </Badge>
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                        <div>
                                          <strong>Birth:</strong> {point.birth_address?.farm_name || 'N/A'}, {point.birth_address?.district || 'N/A'}, {point.birth_address?.province || 'N/A'}
                                        </div>
                                        <div>
                                          <strong>Current:</strong> {
                                            point.is_current_same_as_birth
                                              ? 'Same as birth address'
                                              : `${point.current_address?.farm_name || 'N/A'}, ${point.current_address?.district || 'N/A'}, ${point.current_address?.province || 'N/A'}`
                                          }
                                        </div>
                                        <div>
                                          <strong>Loading:</strong> {
                                            point.is_loading_same_as_current
                                              ? 'Same as current address'
                                              : `${point.loading_address?.farm_name || 'N/A'}, ${point.loading_address?.district || 'N/A'}, ${point.loading_address?.province || 'N/A'}`
                                          }
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        }
                      } catch (error) {
                        console.error('Error parsing loading_points:', error);
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Declarations</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="No other cloven-hooved animals on the truck" value={<BooleanDisplay value={listing.declaration_no_cloven_hooved_animals} />} />
                <DetailItem label="Livestock kept away from others" value={<BooleanDisplay value={listing.declaration_livestock_kept_away} />} />
                <DetailItem label="No animal origin feed" value={<BooleanDisplay value={listing.declaration_no_animal_origin_feed} />} />
                <DetailItem label="Veterinary products registered" value={<BooleanDisplay value={listing.declaration_veterinary_products_registered} />} />
                <DetailItem label="No Foot and Mouth Disease symptoms" value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease} />} />
                <DetailItem label="No Foot and Mouth Disease on farm" value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease_farm} />} />
                <DetailItem label="Livestock from South Africa" value={<BooleanDisplay value={listing.declaration_livestock_south_africa} />} />
                <DetailItem label="No gene editing or cloning" value={<BooleanDisplay value={listing.declaration_no_gene_editing} />} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>Loading Information</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Number of Cattle Loaded" value={listing.number_cattle_loaded} />
                <DetailItem label="Number of Sheep Loaded" value={listing.number_sheep_loaded} />
                <DetailItem label="Truck Registration Number" value={listing.truck_registration_number} />
                {listing.signature_data && (
                  <div className="py-2">
                    <span className="font-semibold text-gray-600">Signature</span>
                    <div className="mt-2 border rounded-md p-2 bg-gray-50">
                      <img src={listing.signature_data as string} alt="Signature" className="mx-auto" />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Veterinary Declaration Section */}
            <AccordionItem value="item-7">
              <AccordionTrigger>Veterinary Declaration</AccordionTrigger>
              <AccordionContent>
                {declaration ? (
                  <div className="space-y-4">
                    <DetailItem label="Veterinarian Name" value={declaration.veterinarian_name} />
                    <DetailItem label="Registration Number" value={declaration.veterinarian_registration_number} />
                    <Separator />
                    <DetailItem label="Cattle Visually Inspected" value={<BooleanDisplay value={declaration.cattle_visually_inspected} />} />
                    <DetailItem label="Cattle Mouthed" value={<BooleanDisplay value={declaration.cattle_mouthed} />} />
                    <DetailItem label="Sheep Visually Inspected" value={<BooleanDisplay value={declaration.sheep_visually_inspected} />} />
                    <DetailItem label="Sheep Mouthed" value={<BooleanDisplay value={declaration.sheep_mouthed} />} />
                    <Separator />
                    <DetailItem label="Foot and Mouth Symptoms" value={<BooleanDisplay value={declaration.foot_and_mouth_symptoms} />} />
                    <DetailItem label="Lumpy Skin Disease Symptoms" value={<BooleanDisplay value={declaration.lumpy_skin_disease_symptoms} />} />
                    <DetailItem label="No Foot and Mouth case in 10km" value={<BooleanDisplay value={declaration.foot_and_mouth_case_in_10km} />} />
                    <DetailItem label="No Rift Valley Fever case in 10km" value={<BooleanDisplay value={declaration.rift_valley_fever_case_in_10km} />} />
                  </div>
                ) : (
                  <p className="text-gray-500">No veterinary declaration has been submitted for this listing yet.</p>
                )}
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>

      {/* Load Master Assignment Section */}
      {listing.company_id && (
        <div className="mt-6">
          <LoadMasterAssignment
            listingId={listingId!}
            companyId={listing.company_id}
            currentStatus={listing.status || ''}
            assignedLoadMasterId={listing.assigned_load_master_id}
            onAssignmentComplete={() => {
              // Refresh the listing data
              fetchListingAndDeclaration();
            }}
          />
        </div>
      )}

    </div>
  );
};
