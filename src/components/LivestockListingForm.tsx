import { useState, useEffect } from 'react';
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { useFieldArray } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import { Database } from '@/integrations/supabase/types';
import { livestockListingSchema, LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { LivestockDetailsSection } from './livestock-listing-form/LivestockDetailsSection';
import { BiosecuritySection } from './livestock-listing-form/BiosecuritySection';
import { DeclarationsSection } from './livestock-listing-form/DeclarationsSection';
import { LoadingPointsSection } from './livestock-listing-form/LoadingPointsSection';

import { SignatureSection } from './livestock-listing-form/SignatureSection';
import { VetSelectionSection } from './livestock-listing-form/VetSelectionSection';
import { OfferTermsSection } from './livestock-listing-form/OfferTermsSection';
import { FormStepper } from './livestock-listing-form/FormStepper';
import { useTranslation } from '@/i18n/useTranslation';

/**
 * FIELD VISIBILITY NOTE:
 * For initial launch, the following advanced fields are hidden but remain in the database schema:
 * - weaning status (mothers_status, weaned_duration)
 * - grain feeding (grazing_green_feed)
 * - growth implants (growth_implant, growth_implant_type)
 * - breed details (breed)
 * - estimated weight (estimated_average_weight)
 * - weighing location (weighing_location) - redundant with loading points
 * 
 * These fields can be re-enabled by updating the fieldVisibility configuration.
 */

interface Address {
  farm_name: string;
  district: string;
  province: string;
  country?: string;
}

interface LoadingPoint {
  birth_address: Address;
  current_address: Address;
  loading_address: Address;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  number_of_cattle: number;
  number_of_sheep: number;
  details?: {
    livestock_type?: 'CATTLE' | 'SHEEP';
    bred_or_bought?: 'BRED' | 'BOUGHT IN';
    number_of_males: number;
    number_of_females: number;
    males_castrated: boolean;
    previous_owner_declaration_url?: string | null;
    previous_owner_declaration_name?: string | null;
  };
  biosecurity?: {
    is_breeder_seller: boolean;
    breeder_name?: string;
    livestock_moved_out_of_boundaries: boolean;
    livestock_moved_location?: Address;
    livestock_moved_location_to?: Address;
    livestock_moved_year?: number;
    livestock_moved_month?: number;
    livestock_moved_how?: 'Transport Contractor' | 'Own Truck' | 'On Foot';
  };
}

const safeJsonParse = (str: string | Address | null | undefined, fallback: Address): Address => {
  if (typeof str === 'object' && str !== null) return str as Address;
  if (typeof str !== 'string') return fallback;
  try {
    const parsed = JSON.parse(str);
    if (parsed && typeof parsed.farm_name === 'string' && typeof parsed.district === 'string' && typeof parsed.province === 'string') {
      return parsed;
    }
    return fallback;
  } catch (e) {
    return fallback;
  }
};

const safeJsonParseArray = (data: unknown, fallback: LoadingPoint[]): unknown[] => {
  if (Array.isArray(data)) {
    return data as unknown[];
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? (parsed as unknown[]) : (fallback as unknown[]);
    } catch (e) {
      return fallback as unknown[];
    }
  }
  return fallback as unknown[];
};

interface LivestockListingFormProps {
  invitationId: string;
  referenceId: string;
  onSuccess?: () => void;
}

export const LivestockListingForm = ({ invitationId, referenceId, onSuccess }: LivestockListingFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Database['public']['Tables']['profiles']['Row'] | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [existingListingId, setExistingListingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [invitingCompanyName, setInvitingCompanyName] = useState<string | undefined>(undefined);
  const draftKey = `livestock_listing_draft:${invitationId}`;
  const { t } = useTranslation();

  const getProfileOwnerName = (currentProfile: Database['public']['Tables']['profiles']['Row'] | null) => {
    if (!currentProfile) return '';
    return currentProfile.company_name || `${currentProfile.first_name || ''} ${currentProfile.last_name || ''}`.trim();
  };

  const serializeError = (value: unknown) => {
    if (value instanceof Error) return value.message;
    if (typeof value === 'string') return value;
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const form = useForm<LivestockListingFormData>({
    resolver: zodResolver(livestockListingSchema),
    defaultValues: {
      invitation_id: invitationId,
      reference_id: referenceId,
      owner_name: '',
      livestock_type: undefined,
      bred_or_bought: undefined,
      location: '', // Legacy field, now handled by loading_points
      weighing_location: '',
      total_livestock_offered: 0,
      number_of_heifers: 0,
      males_castrated: false,
      mothers_status: undefined,
      weaned_duration: '',
      grazing_green_feed: false,
      growth_implant: false,
      growth_implant_type: '',
      estimated_average_weight: undefined,
      breed: '',
      additional_r25_per_calf: false,
      additional_r25_per_head: false,
      gln_num: '',
      gln_document_url: null,
      affidavit_required: false,
      affidavit_file_path: '',
      breeder_name: '',
      is_breeder_seller: false,
      farm_birth_address: { farm_name: '', district: '', province: '' }, // Legacy field, now handled by loading_points
      is_loading_at_birth_farm: true, // Legacy field
      farm_loading_address: { farm_name: '', district: '', province: '' },
      livestock_moved_out_of_boundaries: false,
      livestock_moved_location: { farm_name: '', district: '', province: '' },
      livestock_moved_location_to: { farm_name: '', district: '', province: '' },
      livestock_moved_year: undefined,
      livestock_moved_month: undefined,
      declaration_no_cloven_hooved_animals: false,
      declaration_livestock_kept_away: false,
      declaration_no_contact_with_non_resident_livestock: false,
      declaration_no_animal_origin_feed: false,
      declaration_veterinary_products_registered: false,
      declaration_no_foot_mouth_disease: false,
      declaration_never_vaccinated_against_fmd: false,
      declaration_no_foot_mouth_disease_farm: false,
      declaration_no_rift_valley_fever_10km_12_months: false,
      declaration_livestock_south_africa: false,
      declaration_no_gene_editing: false,
      number_cattle_loaded: 0,
      number_sheep_loaded: 0,
      truck_registration_number: '',
      signature_data: '',
      signed_location: '',
      loading_points: [],
      assigned_vet_id: '',
      invited_vet_email: '',
    },
  });

  const { control, getValues, setValue, watch } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'loading_points',
  });

  const loadingPointsValues = watch('loading_points');
  const typedLoadingPoints: Array<{ number_of_cattle?: number; number_of_sheep?: number }> = Array.isArray(loadingPointsValues)
    ? (loadingPointsValues as unknown as Array<{ number_of_cattle?: number; number_of_sheep?: number }>)
    : [];
  const totalCattle = typedLoadingPoints.reduce((sum, point) => sum + (Number(point.number_of_cattle) || 0), 0);
  const totalSheep = typedLoadingPoints.reduce((sum, point) => sum + (Number(point.number_of_sheep) || 0), 0);

  useEffect(() => {
    if (getValues('number_cattle_loaded') !== totalCattle) {
      setValue('number_cattle_loaded', totalCattle, { shouldDirty: true, shouldValidate: true });
    }
    if (getValues('number_sheep_loaded') !== totalSheep) {
      setValue('number_sheep_loaded', totalSheep, { shouldDirty: true, shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCattle, totalSheep]);


  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            toast({ title: t('common', 'errorTitle'), description: t('livestockListingForm', 'toastProfileLoadErrorDescription'), variant: 'destructive' });
            setProfile(null);
          } else {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else if (!authLoading) {
      setProfileLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  useEffect(() => {
    if (!profile) return;
    const ownerName = getProfileOwnerName(profile);
    if (!ownerName) return;
    const currentOwnerName = (getValues('owner_name') || '').trim();
    if (currentOwnerName !== ownerName) {
      setValue('owner_name', ownerName, { shouldDirty: false, shouldValidate: true });
    }
  }, [profile, getValues, setValue]);

  const formSections = [
    // { title: "Livestock Details", component: <LivestockDetailsSection /> },
    // { title: "Biosecurity", component: <BiosecuritySection /> },
    { title: t('livestockListingForm', 'movementTrackerTitle'), component: <LoadingPointsSection fields={fields} append={append} remove={remove} /> },

    { title: t('livestockListingForm', 'veterinarianTitle'), component: <VetSelectionSection /> },
    { title: t('offerTermsSection', 'heading'), component: <OfferTermsSection companyName={invitingCompanyName} /> },
    { title: t('declarationsSection', 'heading'), component: <DeclarationsSection companyName={invitingCompanyName} /> },
    {
      title: t('signatureSection', 'heading'),
      component: <SignatureSection signature={signature} setSignature={setSignature} />,
    },
  ];

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, formSections.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };



  useEffect(() => {
    const loadInitialData = async () => {
      if (!invitationId) return;

      try {
        // Fetch invitation data with explicit typing to avoid deep type inference
        const invitationQuery = supabase
          .from('listing_invitations')
          .select('reference_id, company_id, companies ( name )')
          .eq('id', invitationId)
          .single();
        
        const invitationRes = await invitationQuery;

        // Fetch listing data with simple type assertion to avoid deep type inference
        const listingRes = await supabase
          .from('livestock_listings')
          .select('*')
          .eq('invitation_id', invitationId)
          .maybeSingle();
        
        // Use simple type assertion to avoid TypeScript complexity
        const typedListingRes = listingRes as {
          data: Record<string, unknown> | null;
          error: Error | null;
        };

        const { data: invitationData, error: invitationError } = invitationRes;
        if (invitationError) {
          console.error('Error fetching invitation data:', invitationError);
          toast({
            title: t('common', 'errorTitle'),
            description: t('livestockListingForm', 'toastInvitationLoadErrorDescription'),
            variant: 'destructive',
          });
          return;
        }
        // Capture inviting company name (if available via FK join), with typed data and fallback
        type InvitationWithCompany = { reference_id: string | null; company_id: string | null; companies: { name: string } | null };
        const typedInvitation = invitationData as InvitationWithCompany | null;
        let companyName: string | undefined = typedInvitation?.companies?.name || undefined;
        if (!companyName && typedInvitation?.company_id) {
          const { data: companyRow } = await supabase
            .from('companies')
            .select('name')
            .eq('id', typedInvitation.company_id)
            .maybeSingle();
          companyName = companyRow?.name || undefined;
        }
        setInvitingCompanyName(companyName);

        const { data: listingData, error: listingError } = typedListingRes;
        if (listingError) {
          console.error('Error fetching listing data:', listingError);
          toast({
            title: t('common', 'errorTitle'),
            description: t('livestockListingForm', 'toastListingLoadErrorDescription'),
            variant: 'destructive',
          });
          return;
        }

        const referenceId = invitationData?.reference_id || '';

        if (listingData) {
          // Helper functions to safely extract values
          const getString = (value: unknown): string => (value as string) || '';
          const getNumber = (value: unknown): number => (value as number) || 0;
          const getBoolean = (value: unknown): boolean => (value as boolean) || false;
          const getJsonValue = (value: unknown): string | Address | null | undefined => {
            if (value === null) return null;
            if (value === undefined) return undefined;
            if (typeof value === 'string') return value;
            if (typeof value === 'object' && value !== null) return value as Address;
            return null;
          };
          
          const formData: Partial<LivestockListingFormData> = {
            invitation_id: getString(listingData.invitation_id) || invitationId, // from database or props
            reference_id: referenceId, // from invitation
            owner_name: getString(listingData.owner_name),
            livestock_type: getString(listingData.livestock_type) as "CATTLE AND SHEEP" | "CATTLE" | "SHEEP" | undefined,
            bred_or_bought: getString(listingData.bred_or_bought) as "BRED" | "BOUGHT IN" | undefined,
            location: getString(listingData.location),
            weighing_location: getString(listingData.weighing_location),
            total_livestock_offered: getNumber(listingData.total_livestock_offered),
            number_of_heifers: getNumber(listingData.number_of_heifers) || undefined,
            males_castrated: getBoolean(listingData.males_castrated),
            mothers_status: getString(listingData.mothers_status) as "WITH MOTHERS" | "ALREADY WEANED" | undefined,
            weaned_duration: getString(listingData.weaned_duration),
            grazing_green_feed: getBoolean(listingData.grazing_green_feed),
            growth_implant: getBoolean(listingData.growth_implant),
            growth_implant_type: getString(listingData.growth_implant_type),
            estimated_average_weight: getNumber(listingData.estimated_average_weight) || undefined,
            breed: getString(listingData.breed),
            additional_r25_per_calf: getBoolean(listingData.additional_r25_per_calf),
            affidavit_required: getBoolean(listingData.affidavit_required),
            additional_r25_per_head: getBoolean(listingData.additional_r25_per_head),
            gln_num: getString(listingData.gln_num),
            gln_document_url: getString(listingData.gln_document_url),
            affidavit_file_path: getString(listingData.affidavit_file_path),
            breeder_name: getString(listingData.breeder_name),
            is_breeder_seller: getBoolean(listingData.is_breeder_seller),
            farm_birth_address: safeJsonParse(getJsonValue(listingData.farm_birth_address), { farm_name: '', district: '', province: '', country: '' }),
            farm_loading_address: safeJsonParse(getJsonValue(listingData.farm_loading_address), { farm_name: '', district: '', province: '', country: '' }),
            livestock_moved_out_of_boundaries: getBoolean(listingData.livestock_moved_out_of_boundaries),
            livestock_moved_location: safeJsonParse(getJsonValue(listingData.livestock_moved_location), { farm_name: '', district: '', province: '', country: '' }),
            livestock_moved_location_to: safeJsonParse(getJsonValue(listingData.livestock_moved_location_to), { farm_name: '', district: '', province: '', country: '' }),
            livestock_moved_year: getNumber(listingData.livestock_moved_year) || undefined,
            livestock_moved_month: getNumber(listingData.livestock_moved_month) || undefined,
            declaration_no_cloven_hooved_animals: getBoolean(listingData.declaration_no_cloven_hooved_animals),
            declaration_livestock_kept_away: getBoolean(listingData.declaration_livestock_kept_away),
            declaration_no_contact_with_non_resident_livestock: getBoolean(listingData.declaration_no_contact_with_non_resident_livestock),
            declaration_no_animal_origin_feed: getBoolean(listingData.declaration_no_animal_origin_feed),
            declaration_veterinary_products_registered: getBoolean(listingData.declaration_veterinary_products_registered),
            declaration_no_foot_mouth_disease: getBoolean(listingData.declaration_no_foot_mouth_disease),
            declaration_never_vaccinated_against_fmd: getBoolean(listingData.declaration_never_vaccinated_against_fmd),
            declaration_no_foot_mouth_disease_farm: getBoolean(listingData.declaration_no_foot_mouth_disease_farm),
            declaration_no_rift_valley_fever_10km_12_months: getBoolean(listingData.declaration_no_rift_valley_fever_10km_12_months),
            declaration_livestock_south_africa: getBoolean(listingData.declaration_livestock_south_africa),
            declaration_no_gene_editing: getBoolean(listingData.declaration_no_gene_editing),
            loading_points: (() => {
              const points = safeJsonParseArray(listingData.loading_points, []);
              type LegacyPoint = {
                birth_address?: Address;
                loading_address?: Address;
                is_loading_at_birth_farm?: boolean;
                number_of_cattle?: number;
                number_of_sheep?: number;
                details?: {
                  livestock_type?: 'CATTLE' | 'SHEEP';
                  bred_or_bought?: 'BRED' | 'BOUGHT IN';
                  number_of_males?: number;
                  number_of_females?: number;
                  males_castrated?: boolean;
                  previous_owner_declaration_url?: string | null;
                  previous_owner_declaration_name?: string | null;
                };
                biosecurity?: {
                  is_breeder_seller?: boolean;
                  breeder_name?: string;
                  livestock_moved_out_of_boundaries?: boolean;
                  livestock_moved_location?: Address;
                  livestock_moved_location_to?: Address;
                  livestock_moved_year?: number;
                  livestock_moved_month?: number;
                  livestock_moved_how?: 'Transport Contractor' | 'Own Truck' | 'On Foot';
                };
              };
              type NewPoint = {
                birth_address?: Address;
                current_address?: Address;
                loading_address?: Address;
                is_current_same_as_birth?: boolean;
                is_loading_same_as_current?: boolean;
                number_of_cattle?: number;
                number_of_sheep?: number;
                details?: {
                  livestock_type?: 'CATTLE' | 'SHEEP';
                  bred_or_bought?: 'BRED' | 'BOUGHT IN';
                  number_of_males?: number;
                  number_of_females?: number;
                  males_castrated?: boolean;
                  previous_owner_declaration_url?: string | null;
                  previous_owner_declaration_name?: string | null;
                };
                biosecurity?: {
                  is_breeder_seller?: boolean;
                  breeder_name?: string;
                  livestock_moved_out_of_boundaries?: boolean;
                  livestock_moved_location?: Address;
                  livestock_moved_location_to?: Address;
                  livestock_moved_year?: number;
                  livestock_moved_month?: number;
                  livestock_moved_how?: 'Transport Contractor' | 'Own Truck' | 'On Foot';
                };
              };
              const isLegacyPoint = (p: unknown): p is LegacyPoint =>
                typeof p === 'object' && p !== null && 'is_loading_at_birth_farm' in p;

              const fallbackAddress: Address = { farm_name: '', district: '', province: '', country: '' };

              return points.map((point) => {
                if (isLegacyPoint(point)) {
                  const legacyPoint = point;
                  return {
                    birth_address: legacyPoint.birth_address || fallbackAddress,
                    current_address: legacyPoint.birth_address || fallbackAddress,
                    loading_address: legacyPoint.is_loading_at_birth_farm
                      ? (legacyPoint.birth_address || fallbackAddress)
                      : (legacyPoint.loading_address || fallbackAddress),
                    is_current_same_as_birth: true,
                    is_loading_same_as_current: legacyPoint.is_loading_at_birth_farm || false,
                    number_of_cattle: legacyPoint.number_of_cattle || 0,
                    number_of_sheep: legacyPoint.number_of_sheep || 0,
                    details: {
                      livestock_type: undefined,
                      bred_or_bought: undefined,
                      number_of_males: 0,
                      number_of_females: 0,
                      males_castrated: false,
                      previous_owner_declaration_url: null,
                      previous_owner_declaration_name: null,
                    },
                    biosecurity: {
                      is_breeder_seller: true,
                      breeder_name: undefined,
                      livestock_moved_out_of_boundaries: false,
                      livestock_moved_location: undefined,
                      livestock_moved_location_to: undefined,
                      livestock_moved_year: undefined,
                      livestock_moved_month: undefined,
                      livestock_moved_how: undefined,
                    },
                  };
                }
                const p = point as NewPoint;
                const detailsData = {
                  livestock_type: p.details?.livestock_type,
                  bred_or_bought: p.details?.bred_or_bought,
                  number_of_males: p.details?.number_of_males,
                  number_of_females: p.details?.number_of_females,
                  males_castrated: p.details?.males_castrated,
                  previous_owner_declaration_url: p.details?.previous_owner_declaration_url ?? null,
                  previous_owner_declaration_name: p.details?.previous_owner_declaration_name ?? null,
                };
                const biosecurityData = {
                  is_breeder_seller: p.biosecurity?.is_breeder_seller,
                  breeder_name: p.biosecurity?.breeder_name,
                  livestock_moved_out_of_boundaries: p.biosecurity?.livestock_moved_out_of_boundaries,
                  livestock_moved_location: p.biosecurity?.livestock_moved_location,
                  livestock_moved_location_to: p.biosecurity?.livestock_moved_location_to,
                  livestock_moved_year: p.biosecurity?.livestock_moved_year,
                  livestock_moved_month: p.biosecurity?.livestock_moved_month,
                  livestock_moved_how: p.biosecurity?.livestock_moved_how,
                };
                return {
                  birth_address: p.birth_address || fallbackAddress,
                  current_address: p.current_address || fallbackAddress,
                  loading_address: p.loading_address || fallbackAddress,
                  is_current_same_as_birth: p.is_current_same_as_birth || false,
                  is_loading_same_as_current: p.is_loading_same_as_current || false,
                  number_of_cattle: p.number_of_cattle || 0,
                  number_of_sheep: p.number_of_sheep || 0,
                  details: {
                    livestock_type: detailsData.livestock_type,
                    bred_or_bought: detailsData.bred_or_bought,
                    number_of_males: detailsData.number_of_males ?? 0,
                    number_of_females: detailsData.number_of_females ?? 0,
                    males_castrated: detailsData.males_castrated ?? false,
                    previous_owner_declaration_url: detailsData.previous_owner_declaration_url ?? null,
                    previous_owner_declaration_name: detailsData.previous_owner_declaration_name ?? null,
                  },
                  biosecurity: {
                    is_breeder_seller: biosecurityData.is_breeder_seller ?? true,
                    breeder_name: biosecurityData.breeder_name,
                    livestock_moved_out_of_boundaries: biosecurityData.livestock_moved_out_of_boundaries ?? false,
                    livestock_moved_location: biosecurityData.livestock_moved_location || undefined,
                    livestock_moved_location_to: biosecurityData.livestock_moved_location_to || undefined,
                    livestock_moved_year: biosecurityData.livestock_moved_year ?? undefined,
                    livestock_moved_month: biosecurityData.livestock_moved_month ?? undefined,
                    livestock_moved_how: biosecurityData.livestock_moved_how,
                  },
                };
              });
            })(),
            number_cattle_loaded: getNumber(listingData.number_cattle_loaded) || undefined,
            number_sheep_loaded: getNumber(listingData.number_sheep_loaded) || undefined,
            truck_registration_number: getString(listingData.truck_registration_number),
            signature_data: getString(listingData.signature_data),
            signed_location: getString(listingData.signed_location),
            assigned_vet_id: getString(listingData.assigned_vet_id) || undefined,
            invited_vet_email: getString(listingData.invited_vet_email),
          };
          form.reset(formData);
          setExistingListingId(getString(listingData.id));
          if (getString(listingData.signature_data)) {
            setSignature(getString(listingData.signature_data));
          }
        } else if (profile) {
          // New listing: populate with blank addresses
          const defaultAddress = { farm_name: '', district: '', province: '', country: '' };
          const defaultLoadingPoint = {
            birth_address: defaultAddress,
            current_address: defaultAddress,
            loading_address: defaultAddress,
            is_current_same_as_birth: false,
            is_loading_same_as_current: false,
            number_of_cattle: 0,
            number_of_sheep: 0,
            details: {
              livestock_type: undefined,
              bred_or_bought: undefined,
              number_of_males: 0,
              number_of_females: 0,
              males_castrated: false,
              previous_owner_declaration_url: null,
              previous_owner_declaration_name: null,
            },
            biosecurity: {
              is_breeder_seller: true,
              breeder_name: undefined,
              livestock_moved_out_of_boundaries: false,
              livestock_moved_location: undefined,
              livestock_moved_location_to: undefined,
              livestock_moved_year: undefined,
              livestock_moved_month: undefined,
              livestock_moved_how: undefined,
            },
          };
          form.reset({
            ...form.getValues(),
            invitation_id: invitationId,
            reference_id: referenceId,
            owner_name: profile.company_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            farm_birth_address: defaultAddress,
            loading_points: [defaultLoadingPoint],
          });
        }

        // Attempt to restore any saved draft (applies to both existing and new listings)
        try {
          const rawDraft = localStorage.getItem(draftKey);
          if (rawDraft) {
            const parsed = JSON.parse(rawDraft) as {
              data?: Partial<LivestockListingFormData>;
              signature?: string | null;
              currentStep?: number;
            };
            if (parsed?.data) {
              const merged = {
                ...form.getValues(),
                ...parsed.data,
                invitation_id: invitationId,
                reference_id: referenceId,
              } as LivestockListingFormData;
              form.reset(merged);
            }
            if (typeof parsed.signature !== 'undefined') {
              setSignature(parsed.signature ?? null);
            }
            if (typeof parsed.currentStep === 'number') {
              setCurrentStep(Math.min(Math.max(0, parsed.currentStep), formSections.length - 1));
            }
          }
        } catch (e) {
          console.warn('Failed to restore draft:', e);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: t('common', 'errorTitle'),
          description: t('livestockListingForm', 'toastInitialDataErrorDescription'),
          variant: 'destructive',
        });
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId]);

  // Auto-save draft to localStorage (debounced)
  useEffect(() => {
    let saveTimer: number | undefined;
    const subscription = watch((values) => {
      if (saveTimer) window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        try {
          const draft = {
            data: values,
            signature,
            currentStep,
          };
          const replacer = (_k: string, v: unknown) => {
            if (typeof File !== 'undefined' && v instanceof File) return undefined;
            if (typeof Blob !== 'undefined' && v instanceof Blob) return undefined;
            return v;
          };
          localStorage.setItem(draftKey, JSON.stringify(draft, replacer));
        } catch (e) {
          console.warn('Failed to save draft:', e);
        }
      }, 600);
    });
    return () => {
      if (saveTimer) window.clearTimeout(saveTimer);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey, signature, currentStep]);

  // Persist signature and step changes even if no form fields changed
  useEffect(() => {
    try {
      const existingRaw = localStorage.getItem(draftKey);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      const draft = {
        ...existing,
        signature,
        currentStep,
      };
      const replacer = (_k: string, v: unknown) => {
        if (typeof File !== 'undefined' && v instanceof File) return undefined;
        if (typeof Blob !== 'undefined' && v instanceof Blob) return undefined;
        return v;
      };
      localStorage.setItem(draftKey, JSON.stringify(draft, replacer));
    } catch (e) {
      // ignore storage errors
    }
  }, [signature, currentStep, draftKey]);

  const onInvalid = (errors: FieldErrors<LivestockListingFormData>) => {
    console.error('Form validation errors:', errors);
    toast({
      title: t('livestockListingForm', 'toastIncompleteTitle'),
      description: t('livestockListingForm', 'toastIncompleteDescription'),
      variant: 'destructive',
    });
  };

  const onSubmit = async (data: LivestockListingFormData) => {
    if (!profile || !user) {
      toast({ title: t('common', 'errorTitle'), description: t('livestockListingForm', 'toastUserProfileNotFoundDescription'), variant: 'destructive' });
      return;
    }

    if (!signature) {
      toast({
        title: t('livestockListingForm', 'toastSignatureRequiredTitle'),
        description: t('livestockListingForm', 'toastSignatureRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let affidavitFilePath: string | undefined = data.affidavit_file_path;
      if (data.affidavit_file instanceof File) {
        const file = data.affidavit_file;
        const fileName = `${profile.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('livestock_affidavits')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('livestock_affidavits').getPublicUrl(uploadData.path);
        affidavitFilePath = publicUrlData.publicUrl;
      }

      const submissionData = {
        profile_id: profile.id,
        seller_id: user.id,
        signature_data: signature,
        status: data.assigned_vet_id ? 'submitted_to_vet' : 'pending',
        invitation_id: data.invitation_id,
        reference_id: data.reference_id,
        affidavit_file_path: affidavitFilePath,
        owner_name: data.owner_name || '',
        livestock_type: data.livestock_type || 'CATTLE',
        bred_or_bought: data.bred_or_bought || 'BRED',
        location: data.location || (data.loading_points?.[0]?.birth_address ?
          `${data.loading_points[0].birth_address.farm_name}|${data.loading_points[0].birth_address.district}|${data.loading_points[0].birth_address.province}` : ''),
        weighing_location: data.weighing_location || null,
        total_livestock_offered: data.total_livestock_offered || 0,
        estimated_average_weight: data.estimated_average_weight || null,
        breed: data.breed || null,
        number_cattle_loaded: data.number_cattle_loaded || 0,
        number_sheep_loaded: data.number_sheep_loaded || 0,
        truck_registration_number: data.truck_registration_number || '',
        signed_location: data.signed_location || '',
        number_of_heifers: data.number_of_heifers,
        males_castrated: data.males_castrated,
        mothers_status: data.mothers_status,
        weaned_duration: data.weaned_duration,
        grazing_green_feed: data.grazing_green_feed,
        growth_implant: data.growth_implant,
        growth_implant_type: data.growth_implant_type,
        breeder_name: data.breeder_name,
        is_breeder_seller: data.is_breeder_seller,
        livestock_moved_year: data.livestock_moved_year,
        livestock_moved_month: data.livestock_moved_month,
        assigned_vet_id: data.assigned_vet_id || null,
        invited_vet_email: data.invited_vet_email,
        additional_r25_per_calf: data.additional_r25_per_calf,
        affidavit_required: data.affidavit_required,
        additional_r25_per_head: data.additional_r25_per_head,
        // Include gln_num only when applicable; keep null otherwise for type compatibility
        gln_num: data.additional_r25_per_head ? (data.gln_num || null) : null,
        is_loading_at_birth_farm: data.loading_points?.[0]?.is_loading_same_as_current ?? data.is_loading_at_birth_farm,
        livestock_moved_out_of_boundaries: data.livestock_moved_out_of_boundaries,
        declaration_no_cloven_hooved_animals: data.declaration_no_cloven_hooved_animals,
        declaration_livestock_kept_away: data.declaration_livestock_kept_away,
        declaration_no_animal_origin_feed: data.declaration_no_animal_origin_feed,
        declaration_veterinary_products_registered: data.declaration_veterinary_products_registered,
        declaration_no_foot_mouth_disease: data.declaration_no_foot_mouth_disease,
        declaration_no_foot_mouth_disease_farm: data.declaration_no_foot_mouth_disease_farm,
        declaration_livestock_south_africa: data.declaration_livestock_south_africa,
        declaration_no_gene_editing: data.declaration_no_gene_editing,
        declaration_no_rift_valley_fever_10km_12_months: data.declaration_no_rift_valley_fever_10km_12_months,
        declaration_never_vaccinated_against_fmd: data.declaration_never_vaccinated_against_fmd,
        declaration_no_contact_with_non_resident_livestock: data.declaration_no_contact_with_non_resident_livestock,
        farm_birth_address: JSON.stringify(data.loading_points?.[0]?.birth_address || data.farm_birth_address),
        farm_loading_address: data.loading_points?.[0]?.is_loading_same_as_current ?
          JSON.stringify(data.loading_points[0].current_address) :
          JSON.stringify(data.loading_points?.[0]?.loading_address || data.farm_loading_address),
        livestock_moved_location: data.livestock_moved_out_of_boundaries ? JSON.stringify(data.livestock_moved_location) : null,
        livestock_moved_location_to: data.livestock_moved_out_of_boundaries ? JSON.stringify(data.livestock_moved_location_to) : null,
        loading_points: JSON.stringify(data.loading_points),
        gln_document_url: data.gln_document_url,
        previous_owner_declaration_url: data.loading_points?.some((point) => point.details?.previous_owner_declaration_url)
          ? JSON.stringify(
              data.loading_points
                ?.map((point) => point.details?.previous_owner_declaration_url || null)
                ?.filter((url) => url)
            )
          : null,
      };

      let result;
      if (existingListingId) {
        result = await supabase
          .from('livestock_listings')
          .update(submissionData)
          .eq('id', existingListingId);
      } else {
        result = await supabase
          .from('livestock_listings')
          .insert(submissionData);
      }

      if (result.error) throw result.error;

      const invitationToUpdate = data.invitation_id || invitationId;
      const invitationFilters: string[] = [];
      if (invitationToUpdate) invitationFilters.push(`id.eq.${invitationToUpdate}`);
      if (data.reference_id) invitationFilters.push(`reference_id.eq.${data.reference_id}`);
      if (existingListingId) invitationFilters.push(`listing_id.eq.${existingListingId}`);

      if (invitationFilters.length > 0) {
        const { error: invitationError } = await supabase
          .from('listing_invitations')
          .update({
            status: 'accepted',
            updated_at: new Date().toISOString(),
          })
          .or(invitationFilters.join(','));

        if (invitationError) {
          console.error('Failed to update invitation status:', invitationError);
        }
      }

      toast({
        title: t('common', 'successTitle'),
        description: existingListingId
          ? t('livestockListingForm', 'toastSuccessDescriptionUpdated')
          : t('livestockListingForm', 'toastSuccessDescriptionCreated'),
      });

      if (onSuccess) {
        // Clear saved draft upon success
        try { localStorage.removeItem(draftKey); } catch (e) { /* ignore draft removal error */ }
        onSuccess();
      } else {
        // Clear saved draft upon success
        try { localStorage.removeItem(draftKey); } catch (e) { /* ignore draft removal error */ }
        navigate('/seller-dashboard');
      }
    } catch (error) {
      console.error('Submission error:', serializeError(error));
      toast({
        title: t('common', 'errorTitle'),
        description: t('livestockListingForm', 'toastSubmissionErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>{t('livestockListingForm', 'loadingMessage')}</p>
      </div>
    );
  }

  if (!user || !profile) {
    toast({
      title: t('livestockListingForm', 'toastAuthenticationErrorTitle'),
      description: t('livestockListingForm', 'toastAuthenticationErrorDescription'),
      variant: 'destructive',
    });
    navigate('/auth');
    return null;
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-lg md:text-xl">
          {existingListingId
            ? t('livestockListingForm', 'cardTitleEdit')
            : t('livestockListingForm', 'cardTitleCreate')}
        </CardTitle>
        <CardDescription className="text-sm md:text-base">
          {t('livestockListingForm', 'cardDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 md:px-6">
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
              <FormField
                control={form.control}
                name="reference_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('livestockListingForm', 'referenceIdLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="font-mono bg-gray-100" />
                    </FormControl>
                    <FormDescription>
                      {t('livestockListingForm', 'referenceIdDescription')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />

              {/* Responsible Person Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {t('livestockListingForm', 'responsiblePersonHeading')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">{t('livestockListingForm', 'nameLabel')}</Label>
                    <p className="text-sm text-gray-700">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('livestockListingForm', 'designationLabel')}</Label>
                    <p className="text-sm text-gray-700">{profile?.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('livestockListingForm', 'companyLabel')}</Label>
                    <p className="text-sm text-gray-700">
                      {profile?.company_name || t('livestockListingForm', 'companyFallback')}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">{t('common', 'email')}</Label>
                    <p className="text-sm text-gray-700">{profile?.email}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <FormStepper steps={formSections} currentStep={currentStep} goToStep={goToStep} />

              <div className="my-6">
                {formSections[currentStep].component}
              </div>

              <div className="flex justify-between items-center mt-8">
                <Button type="button" variant="ghost" onClick={() => navigate('/seller-dashboard')}>
                  {t('common', 'cancel')}
                </Button>

                <div className="flex items-center space-x-4">
                  {/* Desktop navigation buttons */}
                  <div className="hidden md:flex items-center space-x-4">
                    {currentStep > 0 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        {t('livestockListingForm', 'backButton')}
                      </Button>
                    )}
                    {currentStep < formSections.length - 1 ? (
                      <Button type="button" onClick={nextStep}>
                        {t('livestockListingForm', 'nextButton')}
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting || !signature}>
                        {isSubmitting
                          ? existingListingId
                            ? t('livestockListingForm', 'updatingLabel')
                            : t('livestockListingForm', 'submittingLabel')
                          : existingListingId
                            ? t('livestockListingForm', 'updateButton')
                            : t('livestockListingForm', 'submitButton')}
                      </Button>
                    )}
                  </div>

                  {/* Mobile: Only show submit button on last step */}
                  <div className="md:hidden">
                    {currentStep === formSections.length - 1 && (
                      <Button type="submit" disabled={isSubmitting || !signature}>
                        {isSubmitting
                          ? existingListingId
                            ? t('livestockListingForm', 'updatingLabel')
                            : t('livestockListingForm', 'submittingLabel')
                          : existingListingId
                            ? t('livestockListingForm', 'updateButton')
                            : t('livestockListingForm', 'submitButton')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
