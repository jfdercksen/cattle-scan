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

// Minimal types for loading points used for derived fields (align with ViewListingPage)
type LoadingPointDetails = {
  livestock_type?: 'CATTLE' | 'SHEEP';
  bred_or_bought?: 'BRED' | 'BOUGHT IN';
  number_of_males?: number;
  number_of_females?: number;
  males_castrated?: boolean;
};
type LoadingPointBiosecurity = {
  breeder_name?: string;
  is_breeder_seller?: boolean;
};
type LoadingPoint = {
  details?: LoadingPointDetails;
  biosecurity?: LoadingPointBiosecurity;
};

type AddressLike = { farm_name?: string; district?: string; province?: string };
type DisplayPoint = LoadingPoint & {
  birth_address?: AddressLike;
  current_address?: AddressLike;
  loading_address?: AddressLike;
  is_current_same_as_birth?: boolean;
  is_loading_same_as_current?: boolean;
};

const parseLoadingPoints = (lp: Json | string | null | undefined): LoadingPoint[] => {
  if (!lp) return [];
  let raw: unknown = lp;
  if (typeof lp === 'string') {
    try { raw = JSON.parse(lp); } catch { return []; }
  }
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[]).map((p): LoadingPoint => {
    const obj = (p && typeof p === 'object') ? p as Record<string, unknown> : {};
    const details = (obj.details && typeof obj.details === 'object') ? obj.details as Record<string, unknown> : undefined;
    const biosecurity = (obj.biosecurity && typeof obj.biosecurity === 'object') ? obj.biosecurity as Record<string, unknown> : undefined;
    return {
      details: details ? {
        livestock_type: details.livestock_type === 'CATTLE' || details.livestock_type === 'SHEEP' ? details.livestock_type : undefined,
        bred_or_bought: details.bred_or_bought === 'BRED' || details.bred_or_bought === 'BOUGHT IN' ? details.bred_or_bought : undefined,
        number_of_males: typeof details.number_of_males === 'number' ? details.number_of_males : Number(details.number_of_males ?? 0) || 0,
        number_of_females: typeof details.number_of_females === 'number' ? details.number_of_females : Number(details.number_of_females ?? 0) || 0,
        males_castrated: typeof details.males_castrated === 'boolean' ? details.males_castrated : false,
      } : undefined,
      biosecurity: biosecurity ? {
        breeder_name: typeof biosecurity.breeder_name === 'string' ? biosecurity.breeder_name : undefined,
        is_breeder_seller: typeof biosecurity.is_breeder_seller === 'boolean' ? biosecurity.is_breeder_seller : undefined,
      } : undefined,
    };
  });
};

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

  // Derive livestock info and counts from loading_points (new schema)
  let derivedLivestockType: string = 'N/A';
  let derivedBredOrBought: string = 'N/A';
  const loadingPoints = parseLoadingPoints(listing.loading_points as Json | string | null | undefined);
  const types = new Set<string>();
  const bob = new Set<string>();
  let cattleTotal = 0;
  let sheepTotal = 0;
  let maleTotal = 0;
  let femaleTotal = 0;
  const malesCastrationSet = new Set<boolean>();
  const breederSellerSet = new Set<boolean>();
  const breederNames = new Set<string>();
  for (const p of loadingPoints) {
    if (p.details?.livestock_type) types.add(p.details.livestock_type);
    if (p.details?.bred_or_bought) bob.add(p.details.bred_or_bought);
    const males = p.details?.number_of_males ?? 0;
    const females = p.details?.number_of_females ?? 0;
    const total = males + females;
    maleTotal += males;
    femaleTotal += females;
    if (p.details?.livestock_type === 'CATTLE') cattleTotal += total;
    else if (p.details?.livestock_type === 'SHEEP') sheepTotal += total;
    if (p.details?.livestock_type === 'CATTLE' && typeof p.details?.males_castrated === 'boolean') {
      malesCastrationSet.add(p.details.males_castrated);
    }
    if (typeof p.biosecurity?.is_breeder_seller === 'boolean') {
      breederSellerSet.add(p.biosecurity.is_breeder_seller);
    }
    const bname = p.biosecurity?.breeder_name?.trim();
    if (bname) breederNames.add(bname);
  }

  let derivedMalesCastrated: string = 'N/A';
  if (malesCastrationSet.size === 1) derivedMalesCastrated = malesCastrationSet.has(true) ? 'Yes' : 'No';
  else if (malesCastrationSet.size > 1) derivedMalesCastrated = 'Mixed';

  let derivedIsBreederSeller: string = 'N/A';
  if (breederSellerSet.size === 1) derivedIsBreederSeller = breederSellerSet.has(true) ? 'Yes' : 'No';
  else if (breederSellerSet.size > 1) derivedIsBreederSeller = 'Mixed';

  let derivedBreederName: string = 'N/A';
  if (breederNames.size === 1) derivedBreederName = Array.from(breederNames)[0];
  else if (breederNames.size > 1) derivedBreederName = 'Mixed';

  if (types.size > 1) {
    derivedLivestockType = 'CATTLE AND SHEEP';
  } else if (types.size === 1) {
    const only = Array.from(types)[0];
    derivedLivestockType = only === 'CATTLE' || only === 'SHEEP' ? only : 'N/A';
  } else {
    if (cattleTotal > 0 && sheepTotal > 0) derivedLivestockType = 'CATTLE AND SHEEP';
    else if (cattleTotal > 0) derivedLivestockType = 'CATTLE';
    else if (sheepTotal > 0) derivedLivestockType = 'SHEEP';
  }

  if (bob.size > 1) derivedBredOrBought = 'Mixed';
  else if (bob.size === 1) derivedBredOrBought = Array.from(bob)[0];

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
                <DetailItem label="Livestock Type" value={derivedLivestockType} />
                <DetailItem label="Bred or Bought" value={derivedBredOrBought} />
                <DetailItem label="Breeder Name" value={derivedBreederName} />
                <DetailItem label="Is Breeder the Seller?" value={derivedIsBreederSeller} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Livestock Details</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Total Livestock" value={maleTotal + femaleTotal} />
                <DetailItem label="Number of Males" value={maleTotal} />
                <DetailItem label="Number of Females" value={femaleTotal} />
                <DetailItem label="Males Castrated" value={derivedMalesCastrated} />
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
                      {cattleTotal > 0 && (
                        <div>
                          <p><strong>Total Cattle:</strong> {cattleTotal}</p>
                        </div>
                      )}

                      {/* Only show sheep count if > 0 */}
                      {sheepTotal > 0 && (
                        <div>
                          <p><strong>Total Sheep:</strong> {sheepTotal}</p>
                        </div>
                      )}

                      <div>
                        <Badge variant="outline">
                          {LivestockCalculations.determineLivestockType(
                            cattleTotal,
                            sheepTotal
                          ) || "No livestock"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Loading Points Information */}
                  {listing.loading_points && (() => {
                    try {
                      const loadingPointsRaw = typeof listing.loading_points === 'string'
                        ? JSON.parse(listing.loading_points)
                        : listing.loading_points;
                      const points = Array.isArray(loadingPointsRaw) ? (loadingPointsRaw as DisplayPoint[]) : [];
                      if (points.length > 0) {
                        return (
                          <div className="mt-4">
                            <h5 className="font-medium mb-3">Loading Points Breakdown</h5>
                            <div className="space-y-3">
                              {points.map((point: DisplayPoint, index: number) => {
                                const males = point.details?.number_of_males ?? 0;
                                const females = point.details?.number_of_females ?? 0;
                                const total = males + females;
                                const isCattle = point.details?.livestock_type === 'CATTLE';
                                const isSheep = point.details?.livestock_type === 'SHEEP';
                                const cattleCount = isCattle ? total : 0;
                                const sheepCount = isSheep ? total : 0;
                                const hasCattle = cattleCount > 0;
                                const hasSheep = sheepCount > 0;
                                if (!hasCattle && !hasSheep) return null;
                                return (
                                  <div key={index} className="p-3 bg-white border rounded-md">
                                    <div className="flex justify-between items-start mb-2">
                                      <h6 className="font-medium text-sm">Loading Point {index + 1}</h6>
                                      <div className="flex gap-2">
                                        {hasCattle && (
                                          <Badge variant="secondary" className="text-xs">
                                            {cattleCount} Cattle
                                          </Badge>
                                        )}
                                        {hasSheep && (
                                          <Badge variant="secondary" className="text-xs">
                                            {sheepCount} Sheep
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                      <div>
                                        <strong>Birth:</strong> {point.birth_address?.farm_name || 'N/A'}, {point.birth_address?.district || 'N/A'}, {point.birth_address?.province || 'N/A'}
                                      </div>
                                      <div>
                                        <strong>Current:</strong> {point.is_current_same_as_birth ? 'Same as birth address' : `${point.current_address?.farm_name || 'N/A'}, ${point.current_address?.district || 'N/A'}, ${point.current_address?.province || 'N/A'}`}
                                      </div>
                                      <div>
                                        <strong>Loading:</strong> {point.is_loading_same_as_current ? 'Same as current address' : `${point.loading_address?.farm_name || 'N/A'}, ${point.loading_address?.district || 'N/A'}, ${point.loading_address?.province || 'N/A'}`}
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-700">
                                      <div>
                                        <strong>Male/Female:</strong> {males} / {females}
                                      </div>
                                      {isCattle && typeof point.details?.males_castrated === 'boolean' && (
                                        <div>
                                          <strong>Males Castrated:</strong> {point.details.males_castrated ? 'Yes' : 'No'}
                                        </div>
                                      )}
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
                <DetailItem label="Number of Cattle Loaded" value={cattleTotal} />
                <DetailItem label="Number of Sheep Loaded" value={sheepTotal} />
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
