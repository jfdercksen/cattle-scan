import { useEffect, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LivestockCalculations } from '@/lib/calculationEngine';

type LivestockListing = Tables<'livestock_listings'> & {
  companies?: {
    name: string;
  } | null;
};

interface Address {
  farm_name: string;
  district: string;
  province: string;
}

const formatStatus = (status: string) => {
  if (!status) return '';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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

export const ViewListingPage = () => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;

      try {
        // Fetch listing data
        const { data: listingData, error: listingError } = await supabase
          .from('livestock_listings')
          .select('*')
          .eq('id', listingId)
          .single();

        if (listingError) throw listingError;

        // Fetch company info using security definer function
        const { data: companyData, error: companyError } = await supabase
          .rpc('get_company_for_listing', { listing_id: listingId });

        if (companyError) {
          console.warn('Could not fetch company info:', companyError);
        }

        // Combine the data
        const combinedData = {
          ...listingData,
          companies: companyData?.[0] ? { name: companyData[0].company_name } : null
        };

        setListing(combinedData);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

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
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>
                Reference ID: {listing.reference_id}
                {(listing as any).companies && (
                  <><br />Company: {(listing as any).companies?.name || 'Unknown Company'}</>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant={listing.status === 'completed' ? 'default' : 'secondary'}>
                    {formatStatus(listing.status ?? '')}
                </Badge>
                <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
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
                    {listing.livestock_moved_out_of_boundaries && <DetailItem label="Moved Location" value={<AddressDisplay address={listing.livestock_moved_location} />} />}
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

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
