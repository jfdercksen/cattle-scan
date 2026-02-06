import { useEffect, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LivestockCalculations } from '@/lib/calculationEngine';
import { useTranslation } from '@/i18n/useTranslation';

type VetProfile = Pick<Tables<'profiles'>, 'id' | 'first_name' | 'last_name' | 'email' | 'registration_number'>;
type LivestockListing = Tables<'livestock_listings'> & {
  companies?: {
    name: string;
  } | null;
  assigned_vet?: VetProfile | null;
};

interface Address {
  farm_name: string;
  district: string;
  province: string;
}

// Minimal types for loading points used for derived fields
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

const DetailItem = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-800 text-right">{value}</span>
  </div>
);

export const ViewListingPage = () => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const formatStatus = (status: string | null | undefined): string => {
    if (!status) return t('common', 'notAvailable');
    switch (status) {
      case 'draft':
        return t('adminViewListing', 'statusDraft');
      case 'submitted_to_vet':
        return t('adminViewListing', 'statusSubmittedToVet');
      case 'vet_completed':
        return t('adminViewListing', 'statusVetCompleted');
      case 'available_for_loading':
        return t('adminViewListing', 'statusAvailableForLoading');
      case 'assigned_to_load_master':
        return t('adminViewListing', 'statusAssignedToLoadMaster');
      case 'loading_completed':
        return t('adminViewListing', 'statusLoadingCompleted');
      case 'completed':
        return t('adminViewListing', 'statusCompleted');
      case 'approved':
        return t('adminViewListing', 'statusApproved');
      case 'rejected':
        return t('adminViewListing', 'statusRejected');
      case 'cancelled':
        return t('adminViewListing', 'statusCancelled');
      case 'expired':
        return t('adminViewListing', 'statusExpired');
      case 'in_progress':
        return t('adminViewListing', 'statusInProgress');
      case 'not_started':
        return t('adminViewListing', 'statusNotStarted');
      case 'pending':
        return t('adminListings', 'statusPending');
      default:
        return status
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  const BooleanDisplay = ({ value }: { value: boolean | null | undefined }) => (
    <span className={value ? 'text-green-600' : 'text-red-600'}>
      {value ? t('common', 'yes') : t('common', 'no')}
    </span>
  );

  const AddressDisplay = ({ address }: { address: Json | null | undefined }) => {
    if (address && typeof address === 'object' && !Array.isArray(address)) {
      const { farm_name, district, province } = address as Record<string, unknown>;
      if (typeof farm_name === 'string' && typeof district === 'string' && typeof province === 'string') {
        return <>{`${farm_name}, ${district}, ${province}`}</>;
      }
    }
    return <>{t('common', 'notAvailable')}</>;
  };

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;

      try {
        // Fetch listing data with company info using JOIN
        const { data: listingData, error: listingError } = await supabase
          .from('livestock_listings')
          .select(`
            *,
            companies (
              id,
              name
            )
          `)
          .eq('id', listingId)
          .single();

        if (listingError) throw listingError;

        let combinedData: LivestockListing = listingData;
        if (listingData.assigned_vet_id) {
          const { data: vetData, error: vetError } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email, registration_number')
            .eq('id', listingData.assigned_vet_id)
            .maybeSingle();

          if (!vetError && vetData) {
            combinedData = {
              ...listingData,
              assigned_vet: vetData,
            };
          }
        }

        setListing(combinedData);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(t('adminViewListing', 'errorMessage'));
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId, t]);

  if (loading) {
    return <div className="text-center p-4">{t('adminViewListing', 'loadingMessage')}</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center p-4">{t('adminViewListing', 'notFoundMessage')}</div>;
  }

  // Derive livestock type and bred/bought from loading points (new schema)
  let derivedLivestockType: string = t('common', 'notAvailable');
  let derivedBredOrBought: string = t('common', 'notAvailable');
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

  let derivedMalesCastrated: string = t('common', 'notAvailable');
  if (malesCastrationSet.size === 1) derivedMalesCastrated = malesCastrationSet.has(true) ? t('common', 'yes') : t('common', 'no');
  else if (malesCastrationSet.size > 1) derivedMalesCastrated = t('adminViewListing', 'mixedValue');

  let derivedIsBreederSeller: string = t('common', 'notAvailable');
  if (breederSellerSet.size === 1) derivedIsBreederSeller = breederSellerSet.has(true) ? t('common', 'yes') : t('common', 'no');
  else if (breederSellerSet.size > 1) derivedIsBreederSeller = t('adminViewListing', 'mixedValue');

  let derivedBreederName: string = t('common', 'notAvailable');
  if (breederNames.size === 1) derivedBreederName = Array.from(breederNames)[0];
  else if (breederNames.size > 1) derivedBreederName = t('adminViewListing', 'mixedValue');

  if (types.size > 1) {
    derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionCattleAndSheep');
  } else if (types.size === 1) {
    const only = Array.from(types)[0];
    if (only === 'CATTLE') {
      derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionCattle');
    } else if (only === 'SHEEP') {
      derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionSheep');
    }
  } else {
    if (cattleTotal > 0 && sheepTotal > 0) {
      derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionCattleAndSheep');
    } else if (cattleTotal > 0) {
      derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionCattle');
    } else if (sheepTotal > 0) {
      derivedLivestockType = t('livestockDetailsSection', 'livestockTypeOptionSheep');
    }
  }

  if (bob.size > 1) derivedBredOrBought = t('adminViewListing', 'mixedValue');
  else if (bob.size === 1) {
    const only = Array.from(bob)[0];
    derivedBredOrBought = only === 'BRED'
      ? t('livestockDetailsSection', 'bredOption')
      : only === 'BOUGHT IN'
        ? t('livestockDetailsSection', 'boughtOption')
        : t('common', 'notAvailable');
  }

  const livestockTypeSummary = LivestockCalculations.determineLivestockType(cattleTotal, sheepTotal);
  const livestockTypeSummaryText = livestockTypeSummary
    ? livestockTypeSummary === 'CATTLE'
      ? t('livestockDetailsSection', 'livestockTypeOptionCattle')
      : livestockTypeSummary === 'SHEEP'
        ? t('livestockDetailsSection', 'livestockTypeOptionSheep')
        : t('livestockDetailsSection', 'livestockTypeOptionCattleAndSheep')
    : t('adminViewListing', 'noLivestockLabel');

  const vetProfile = listing.assigned_vet;
  const vetName = [vetProfile?.first_name, vetProfile?.last_name].filter(Boolean).join(' ');
  const vetStatus = listing.assigned_vet_id
    ? t('common', 'yes')
    : listing.invited_vet_email
      ? t('adminListings', 'statusPending')
      : t('common', 'no');

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t('adminViewListing', 'cardTitle')}</CardTitle>
              <CardDescription>
                {t('adminViewListing', 'cardReference').replace(
                  '{reference}',
                  listing.reference_id ?? t('common', 'notAvailable')
                )}
                {listing.companies && (
                  <>
                    <br />
                    {t('adminViewListing', 'cardCompany').replace(
                      '{company}',
                      listing.companies?.name || t('adminViewListing', 'unknownCompany')
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant={listing.status === 'completed' ? 'default' : 'secondary'}>
                    {formatStatus(listing.status ?? '')}
                </Badge>
                <Button onClick={() => navigate(-1)}>{t('livestockListingForm', 'backButton')}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>{t('adminViewListing', 'accordionGeneralTitle')}</AccordionTrigger>
              <AccordionContent>
                <DetailItem label={t('adminViewListing', 'ownerNameLabel')} value={listing.owner_name ?? t('common', 'notAvailable')} />
                <DetailItem label={t('adminViewListing', 'livestockTypeLabel')} value={derivedLivestockType} />
                <DetailItem label={t('adminViewListing', 'bredOrBoughtLabel')} value={derivedBredOrBought} />
                <DetailItem label={t('adminViewListing', 'breederNameLabel')} value={derivedBreederName} />
                <DetailItem label={t('adminViewListing', 'breederSellerLabel')} value={derivedIsBreederSeller} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-vet">
              <AccordionTrigger>Veterinarian Information</AccordionTrigger>
              <AccordionContent>
                {listing.assigned_vet_id ? (
                  <>
                    <DetailItem label="Status" value="Assigned" />
                    <DetailItem label="Vet Name" value={vetName || t('common', 'notAvailable')} />
                    <DetailItem label="Vet Email" value={vetProfile?.email ?? t('common', 'notAvailable')} />
                    <DetailItem label="Registration Number" value={vetProfile?.registration_number ?? t('common', 'notAvailable')} />
                  </>
                ) : listing.invited_vet_email ? (
                  <>
                    <DetailItem label="Status" value="Invited" />
                    <DetailItem label="Invited Vet Email" value={listing.invited_vet_email} />
                  </>
                ) : (
                  <DetailItem label="Status" value="No vet assigned" />
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>{t('adminViewListing', 'accordionLivestockTitle')}</AccordionTrigger>
              <AccordionContent>
                <DetailItem label={t('adminViewListing', 'totalLivestockLabel')} value={maleTotal + femaleTotal} />
                <DetailItem label={t('adminViewListing', 'numberOfMalesLabel')} value={maleTotal} />
                <DetailItem label={t('adminViewListing', 'numberOfFemalesLabel')} value={femaleTotal} />
                <DetailItem label={t('adminViewListing', 'malesCastratedLabel')} value={derivedMalesCastrated} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>{t('adminViewListing', 'accordionLocationTitle')}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {/* Basic Location Information */}
                  <div className="space-y-2">
                    <DetailItem label={t('adminViewListing', 'locationLabel')} value={listing.location ?? t('common', 'notAvailable')} />
                    <DetailItem label={t('adminViewListing', 'movedOutOfBoundariesLabel')} value={<BooleanDisplay value={listing.livestock_moved_out_of_boundaries} />} />
                    {listing.livestock_moved_out_of_boundaries && 
                        <>
                            <DetailItem label={t('adminViewListing', 'movedFromLabel')} value={<AddressDisplay address={listing.livestock_moved_location} />} /> 
                            <DetailItem label={t('adminViewListing', 'movedToLabel')} value={<AddressDisplay address={listing.livestock_moved_location_to} />} />
                        </>
                    }
                  </div>

                  {/* Loading Summary */}
                  <div className="p-4 border rounded-md bg-gray-50">
                    <h4 className="text-lg font-semibold mb-3">{t('adminViewListing', 'loadingSummaryHeading')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Only show cattle count if > 0 */}
                      {cattleTotal > 0 && (
                        <div>
                          <p><strong>{t('adminViewListing', 'totalCattleLabel')}</strong> {cattleTotal}</p>
                        </div>
                      )}

                      {/* Only show sheep count if > 0 */}
                      {sheepTotal > 0 && (
                        <div>
                          <p><strong>{t('adminViewListing', 'totalSheepLabel')}</strong> {sheepTotal}</p>
                        </div>
                      )}

                      <div>
                        <Badge variant="outline">
                          {livestockTypeSummaryText}
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
                      const loadingPoints = Array.isArray(loadingPointsRaw) ? (loadingPointsRaw as DisplayPoint[]) : [];
                      if (loadingPoints.length > 0) {
                        return (
                          <div className="mt-4">
                            <h5 className="font-medium mb-3">{t('adminViewListing', 'loadingPointsHeading')}</h5>
                            <div className="space-y-3">
                              {loadingPoints.map((point: DisplayPoint, index: number) => {
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
                                      <h6 className="font-medium text-sm">{t('adminViewListing', 'loadingPointTitle').replace('{index}', String(index + 1))}</h6>
                                      <div className="flex gap-2">
                                        {hasCattle && (
                                          <Badge variant="secondary" className="text-xs">
                                            {t('adminViewListing', 'loadingPointCattleBadge').replace('{count}', String(cattleCount))}
                                          </Badge>
                                        )}
                                        {hasSheep && (
                                          <Badge variant="secondary" className="text-xs">
                                            {t('adminViewListing', 'loadingPointSheepBadge').replace('{count}', String(sheepCount))}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                      <div>
                                        <strong>{t('adminViewListing', 'birthLabel')}</strong> {point.birth_address?.farm_name || t('common', 'notAvailable')}, {point.birth_address?.district || t('common', 'notAvailable')}, {point.birth_address?.province || t('common', 'notAvailable')}
                                      </div>
                                      <div>
                                        <strong>{t('adminViewListing', 'currentLabel')}</strong> {point.is_current_same_as_birth ? t('adminViewListing', 'sameAsBirthAddress') : `${point.current_address?.farm_name || t('common', 'notAvailable')}, ${point.current_address?.district || t('common', 'notAvailable')}, ${point.current_address?.province || t('common', 'notAvailable')}`}
                                      </div>
                                      <div>
                                        <strong>{t('adminViewListing', 'loadingLabel')}</strong> {point.is_loading_same_as_current ? t('adminViewListing', 'sameAsCurrentAddress') : `${point.loading_address?.farm_name || t('common', 'notAvailable')}, ${point.loading_address?.district || t('common', 'notAvailable')}, ${point.loading_address?.province || t('common', 'notAvailable')}`}
                                      </div>
                                    </div>
                                    <div className="mt-2 text-xs text-gray-700">
                                      <div>
                                        <strong>{t('adminViewListing', 'maleFemaleLabel')}</strong> {males} / {females}
                                      </div>
                                      {isCattle && typeof point.details?.males_castrated === 'boolean' && (
                                        <div>
                                          <strong>{t('adminViewListing', 'malesCastratedInlineLabel')}</strong> {point.details.males_castrated ? t('common', 'yes') : t('common', 'no')}
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
              <AccordionTrigger>{t('adminViewListing', 'accordionDeclarationsTitle')}</AccordionTrigger>
              <AccordionContent>
                <DetailItem label={t('adminViewListing', 'declarationNoClovenHoovedLabel')} value={<BooleanDisplay value={listing.declaration_no_cloven_hooved_animals} />} />
                <DetailItem label={t('adminViewListing', 'declarationLivestockKeptAwayLabel')} value={<BooleanDisplay value={listing.declaration_livestock_kept_away} />} />
                <DetailItem label={t('adminViewListing', 'declarationNoAnimalFeedLabel')} value={<BooleanDisplay value={listing.declaration_no_animal_origin_feed} />} />
                <DetailItem label={t('adminViewListing', 'declarationProductsRegisteredLabel')} value={<BooleanDisplay value={listing.declaration_veterinary_products_registered} />} />
                <DetailItem label={t('adminViewListing', 'declarationNoFootMouthSymptomsLabel')} value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease} />} />
                <DetailItem label={t('adminViewListing', 'declarationNoFootMouthFarmLabel')} value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease_farm} />} />
                <DetailItem label={t('adminViewListing', 'declarationSouthAfricaLabel')} value={<BooleanDisplay value={listing.declaration_livestock_south_africa} />} />
                <DetailItem label={t('adminViewListing', 'declarationNoGeneEditingLabel')} value={<BooleanDisplay value={listing.declaration_no_gene_editing} />} />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>{t('adminViewListing', 'accordionLoadingTitle')}</AccordionTrigger>
              <AccordionContent>
                <DetailItem label={t('adminViewListing', 'loadingCattleLoadedLabel')} value={cattleTotal} />
                <DetailItem label={t('adminViewListing', 'loadingSheepLoadedLabel')} value={sheepTotal} />
                <DetailItem label={t('adminViewListing', 'loadingTruckRegistrationLabel')} value={listing.truck_registration_number ?? t('common', 'notAvailable')} />
                {listing.signature_data && (
                  <div className="py-2">
                    <span className="font-semibold text-gray-600">{t('adminViewListing', 'loadingSignatureLabel')}</span>
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
