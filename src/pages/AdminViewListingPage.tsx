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
import { ListingPDFExport } from '@/components/admin/ListingPDFExport';
import { useTranslation } from '@/i18n/useTranslation';

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

const DetailItem = ({ label, value }: { label: ReactNode; value: ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-800 text-right">{value}</span>
  </div>
);

export const AdminViewListingPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [declaration, setDeclaration] = useState<VeterinaryDeclaration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const handlePdfGenerated = useCallback((url: string) => {
    setListing((prev) =>
      prev
        ? {
            ...prev,
            pdf_url: url,
            pdf_generated_at: new Date().toISOString(),
          }
        : prev
    );
  }, []);

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
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
      const parts = [farm_name, district, province].filter((value) => typeof value === 'string' && value);
      if (parts.length) {
        return <>{parts.join(', ')}</>;
      }
    }
    return <>{t('common', 'notAvailable')}</>;
  };

  const getMovementFromLoadingPoints = (loadingPointsRaw: unknown) => {
    try {
      const points = Array.isArray(loadingPointsRaw)
        ? loadingPointsRaw
        : typeof loadingPointsRaw === 'string'
          ? JSON.parse(loadingPointsRaw)
          : [];
      const firstPoint = Array.isArray(points) ? points[0] : undefined;
      const bio = firstPoint?.biosecurity || {};
      return {
        movedOut: bio.livestock_moved_out_of_boundaries as boolean | undefined,
        movedFrom: bio.livestock_moved_location as Json | undefined,
        movedTo: bio.livestock_moved_location_to as Json | undefined,
        movedYear: bio.livestock_moved_year as number | undefined,
        movedMonth: bio.livestock_moved_month as number | undefined,
        movedHow: bio.livestock_moved_how as string | undefined,
      };
    } catch {
      return {};
    }
  };

  const YesNoDisplay = ({ label, value }: { label: ReactNode; value: boolean | null | undefined }) => (
    <div className="flex justify-between items-center">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <Badge variant={value ? 'default' : 'destructive'}>{value ? t('common', 'yes') : t('common', 'no')}</Badge>
    </div>
  );

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

      // Fetch latest veterinary declaration using the listing's reference_id, not the UUID
      if (listingData.reference_id) {
        const { data: declarationData, error: declarationError } = await supabase
          .from('veterinary_declarations')
          .select('*')
          .eq('reference_id', listingData.reference_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (declarationError) {
          console.error('Error fetching declaration:', declarationError);
        } else if (declarationData && declarationData.length > 0) {
          setDeclaration(declarationData[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(t('adminViewListing', 'errorMessage'));
    } finally {
      setLoading(false);
    }
  }, [listingId, t]);

  useEffect(() => {
    fetchListingAndDeclaration();
  }, [listingId, fetchListingAndDeclaration]);

  if (loading) {
    return <div className="text-center p-4">{t('adminViewListing', 'loadingMessage')}</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center p-4">{t('adminViewListing', 'notFoundMessage')}</div>;
  }

  // Derive livestock info and counts from loading_points (new schema)
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
    } else {
      derivedLivestockType = t('common', 'notAvailable');
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

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('adminViewListing', 'backButtonLabel')}
      </Button>

      {listing && (
        <div className="mb-6">
          <ListingPDFExport
            listingId={listing.id}
            referenceId={listing.reference_id ?? ''}
            pdfUrl={listing.pdf_url ?? null}
            pdfGeneratedAt={listing.pdf_generated_at ?? null}
            onPdfGenerated={handlePdfGenerated}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{t('adminViewListing', 'cardTitle')}</CardTitle>
              <CardDescription>
                {t('adminViewListing', 'cardReference').replace('{reference}', listing.reference_id ?? t('common', 'notAvailable'))}
                {listing.companies && (
                  <>
                    <br />
                    {t('adminViewListing', 'cardCompany').replace(
                      '{company}',
                      listing.companies.name || t('adminViewListing', 'unknownCompany')
                    )}
                  </>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline">{formatStatus(listing.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
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
                    {(() => {
                      const movement = getMovementFromLoadingPoints(listing.loading_points);
                      const movedOut = movement.movedOut ?? listing.livestock_moved_out_of_boundaries;
                      const movedFrom = movement.movedFrom ?? listing.livestock_moved_location;
                      const movedTo = movement.movedTo ?? listing.livestock_moved_location_to;
                      const movedYear = movement.movedYear ?? listing.livestock_moved_year;
                      const movedMonth = movement.movedMonth ?? listing.livestock_moved_month;
                      const movedHow = movement.movedHow ?? (listing as { livestock_moved_how?: string }).livestock_moved_how;
                      const movedWhen =
                        movedYear || movedMonth
                          ? `${movedMonth ?? ''}${movedMonth ? '/' : ''}${movedYear ?? ''}`
                          : t('common', 'notAvailable');

                      return (
                        <>
                          <DetailItem label={t('adminViewListing', 'locationLabel')} value={listing.location ?? t('common', 'notAvailable')} />
                          <DetailItem label={t('adminViewListing', 'movedOutOfBoundariesLabel')} value={<BooleanDisplay value={movedOut} />} />
                          {movedOut && (
                            <>
                              <DetailItem label={t('adminViewListing', 'movedFromLabel')} value={<AddressDisplay address={movedFrom} />} />
                              <DetailItem label={t('adminViewListing', 'movedToLabel')} value={<AddressDisplay address={movedTo} />} />
                              <DetailItem label={t('adminViewListing', 'movedWhenLabel')} value={movedWhen} />
                              <DetailItem label={t('adminViewListing', 'movedHowLabel')} value={movedHow || t('common', 'notAvailable')} />
                            </>
                          )}
                        </>
                      );
                    })()}
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
                          {LivestockCalculations.determineLivestockType(
                            cattleTotal,
                            sheepTotal
                          ) || t('adminViewListing', 'noLivestockLabel')}
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
                            <h5 className="font-medium mb-3">{t('adminViewListing', 'loadingPointsHeading')}</h5>
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

            {/* Veterinary Declaration Section */}
            <AccordionItem value="item-7">
              <AccordionTrigger>{t('adminViewListing', 'accordionVeterinaryTitle')}</AccordionTrigger>
              <AccordionContent>
                {declaration ? (
                  <div className="space-y-4">
                    <DetailItem label={t('adminViewListing', 'vetNameLabel')} value={declaration.veterinarian_name ?? t('common', 'notAvailable')} />
                    <DetailItem label={t('adminViewListing', 'vetRegistrationLabel')} value={declaration.veterinarian_registration_number ?? t('common', 'notAvailable')} />
                    <Separator />
                    <DetailItem label={t('adminViewListing', 'vetCattleVisuallyInspectedLabel')} value={<BooleanDisplay value={declaration.cattle_visually_inspected} />} />
                    <DetailItem label={t('adminViewListing', 'vetCattleMouthedLabel')} value={<BooleanDisplay value={declaration.cattle_mouthed} />} />
                    <DetailItem label={t('adminViewListing', 'vetSheepVisuallyInspectedLabel')} value={<BooleanDisplay value={declaration.sheep_visually_inspected} />} />
                    <DetailItem label={t('adminViewListing', 'vetSheepMouthedLabel')} value={<BooleanDisplay value={declaration.sheep_mouthed} />} />
                    <Separator />
                    <DetailItem label={t('adminViewListing', 'vetFootMouthSymptomsLabel')} value={<BooleanDisplay value={declaration.foot_and_mouth_symptoms} />} />
                    <DetailItem label={t('adminViewListing', 'vetLumpySkinSymptomsLabel')} value={<BooleanDisplay value={declaration.lumpy_skin_disease_symptoms} />} />
                    <DetailItem label={t('adminViewListing', 'vetFootMouth10kmLabel')} value={<BooleanDisplay value={declaration.foot_and_mouth_case_in_10km} />} />
                    <DetailItem label={t('adminViewListing', 'vetRiftValley10kmLabel')} value={<BooleanDisplay value={declaration.rift_valley_fever_case_in_10km} />} />
                  </div>
                ) : (
                  <p className="text-gray-500">{t('adminViewListing', 'vetDeclarationMissingMessage')}</p>
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
