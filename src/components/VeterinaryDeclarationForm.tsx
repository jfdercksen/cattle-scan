import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { veterinaryDeclarationSchema, VeterinaryDeclarationFormData } from '@/lib/schemas/veterinaryDeclarationSchema';
import { YesNoSwitch } from './ui/YesNoSwitch';
import { Tables } from '@/integrations/supabase/types';
import { calculationEngine, LivestockCalculations } from '@/lib/calculationEngine';
import { useTranslation } from '@/i18n/useTranslation';

// Minimal helpers to parse loading points and compute derived totals
type LoadingPointDetails = {
  livestock_type?: 'CATTLE' | 'SHEEP';
  number_of_males?: number;
  number_of_females?: number;
  males_castrated?: boolean;
};
type LoadingPoint = {
  details?: LoadingPointDetails;
  // Optional address fields may exist and are used for display if present
  birth_address?: { farm_name?: string; district?: string; province?: string };
  current_address?: { farm_name?: string; district?: string; province?: string };
  loading_address?: { farm_name?: string; district?: string; province?: string };
  is_current_same_as_birth?: boolean;
  is_loading_same_as_current?: boolean;
};

const parseLoadingPoints = (lp: unknown): LoadingPoint[] => {
  if (!lp) return [];
  let raw: unknown = lp;
  if (typeof lp === 'string') {
    try { raw = JSON.parse(lp); } catch { return []; }
  }
  if (!Array.isArray(raw)) return [];
  return raw as LoadingPoint[];
};

const getTotalsFromLoadingPoints = (lp: unknown): { cattleTotal: number; sheepTotal: number } => {
  const points = parseLoadingPoints(lp);
  let cattleTotal = 0;
  let sheepTotal = 0;
  for (const p of points) {
    const males = p.details?.number_of_males ?? 0;
    const females = p.details?.number_of_females ?? 0;
    const total = males + females;
    if (p.details?.livestock_type === 'CATTLE') cattleTotal += total;
    else if (p.details?.livestock_type === 'SHEEP') sheepTotal += total;
  }
  return { cattleTotal, sheepTotal };
};

const normalizeCount = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

interface VeterinaryDeclarationFormProps {
  listingId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VeterinaryDeclarationForm = ({ listingId, onSuccess, onCancel }: VeterinaryDeclarationFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listing, setListing] = useState<Tables<'livestock_listings'> | null>(null);
  const [vetProfile, setVetProfile] = useState<Tables<'profiles'> | null>(null);
  const [existingDeclaration, setExistingDeclaration] = useState<Tables<'veterinary_declarations'> | null>(null);
  const [signingLocation, setSigningLocation] = useState<string>('');
  const [isEditingTotals, setIsEditingTotals] = useState(false);
  const [pendingTotals, setPendingTotals] = useState<{ cattle: string; sheep: string }>({ cattle: '', sheep: '' });
  const [isSavingTotals, setIsSavingTotals] = useState(false);
  const { t } = useTranslation();

  const formatMessage = (template: string, replacements: Record<string, string | number>) => {
    return Object.entries(replacements).reduce((result, [key, value]) => {
      return result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }, template);
  };

  const getLivestockTypeLabel = (type: ReturnType<typeof LivestockCalculations.determineLivestockType>) => {
    switch (type) {
      case 'CATTLE':
        return t('veterinaryDeclarationForm', 'livestockTypeCattle');
      case 'SHEEP':
        return t('veterinaryDeclarationForm', 'livestockTypeSheep');
      case 'CATTLE AND SHEEP':
        return t('veterinaryDeclarationForm', 'livestockTypeBoth');
      default:
        return t('veterinaryDeclarationForm', 'livestockTypeNone');
    }
  };

  const form = useForm<VeterinaryDeclarationFormData>({
    resolver: zodResolver(veterinaryDeclarationSchema),
    defaultValues: {
      reference_id: '', // Will be set when listing data is fetched
      number_cattle_loaded: 0,
      number_sheep_loaded: 0,
      cattle_visually_inspected: null,
      cattle_mouthed: null,
      sheep_visually_inspected: null,
      sheep_mouthed: null,
      foot_and_mouth_symptoms: null,
      lumpy_skin_disease_symptoms: null,
      foot_and_mouth_case_in_10km: null,
      rift_valley_fever_case_in_10km: null,
      signed_location: '',
      location_distance_note: '',
    },
  });

  const fetchListing = useCallback(async () => {
    if (!listingId) return;

    const { data, error } = await supabase
      .from('livestock_listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (error) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('veterinaryDeclarationForm', 'loadListingErrorDescription'),
        variant: 'destructive',
      });
    } else {
      setListing(data);
      const { cattleTotal, sheepTotal } = getTotalsFromLoadingPoints(data.loading_points);
      // Fallback to legacy top-level fields if derived totals are zero
      const derivedCattle = cattleTotal || data.number_cattle_loaded || 0;
      const derivedSheep = sheepTotal || data.number_sheep_loaded || 0;
      const baseValues: VeterinaryDeclarationFormData = {
        ...form.getValues(),
        reference_id: data.reference_id,
        owner_of_livestock: data.owner_name,
        farm_address: data.farm_loading_address ?? '',
        number_cattle_loaded: derivedCattle,
        number_sheep_loaded: derivedSheep,
        signed_location: data.signed_location ?? '',
      };

      setSigningLocation(baseValues.signed_location || '');
      setExistingDeclaration(null);

      if (data.reference_id) {
        const { data: declarationData, error: declarationError } = await supabase
          .from('veterinary_declarations')
          .select('*')
          .eq('reference_id', data.reference_id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!declarationError && declarationData && declarationData.length > 0) {
          const declarationRecord = declarationData[0];
          setExistingDeclaration(declarationRecord);
          baseValues.cattle_visually_inspected = declarationRecord.cattle_visually_inspected;
          baseValues.cattle_mouthed = declarationRecord.cattle_mouthed;
          baseValues.sheep_visually_inspected = declarationRecord.sheep_visually_inspected;
          baseValues.sheep_mouthed = declarationRecord.sheep_mouthed;
          baseValues.foot_and_mouth_symptoms = declarationRecord.foot_and_mouth_symptoms;
          baseValues.lumpy_skin_disease_symptoms = declarationRecord.lumpy_skin_disease_symptoms;
          baseValues.foot_and_mouth_case_in_10km = declarationRecord.foot_and_mouth_case_in_10km;
          baseValues.rift_valley_fever_case_in_10km = declarationRecord.rift_valley_fever_case_in_10km;
          baseValues.signed_location = declarationRecord.signed_location ?? baseValues.signed_location ?? '';
          baseValues.location_distance_note = declarationRecord.location_distance_note ?? '';
          setSigningLocation(baseValues.signed_location || '');
        }
      }

      form.reset(baseValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, form]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  useEffect(() => {
    const fetchVetProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('veterinaryDeclarationForm', 'loadVetProfileErrorDescription'),
          variant: 'destructive',
        });
      } else {
        setVetProfile(data);
        form.reset({
          ...form.getValues(),
          veterinarian_name: data.first_name + ' ' + data.last_name || '',
          veterinarian_registration_number: data.registration_number || '',
        });
      }
    };
    fetchVetProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, form]);

  const onSubmit = async (data: VeterinaryDeclarationFormData) => {
    if (existingDeclaration) {
      toast({
        title: t('veterinaryDeclarationForm', 'alreadySubmittedTitle'),
        description: t('veterinaryDeclarationForm', 'alreadySubmittedDescription'),
        variant: 'destructive',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      if (!data.reference_id) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('veterinaryDeclarationForm', 'missingReferenceDescription'),
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      const cattleCount = Number(data.number_cattle_loaded ?? 0);
      const sheepCount = Number(data.number_sheep_loaded ?? 0);

      const dbData: Database['public']['Tables']['veterinary_declarations']['Insert'] = {
        reference_id: data.reference_id,
        veterinarian_name: data.veterinarian_name,
        veterinarian_registration_number: data.veterinarian_registration_number,
        owner_of_livestock: data.owner_of_livestock,
        farm_address: data.farm_address,
        cattle_visually_inspected: data.cattle_visually_inspected ?? false,
        cattle_mouthed: data.cattle_mouthed ?? false,
        sheep_visually_inspected: data.sheep_visually_inspected ?? false,
        sheep_mouthed: data.sheep_mouthed ?? false,
        foot_and_mouth_symptoms: data.foot_and_mouth_symptoms ?? false,
        lumpy_skin_disease_symptoms: data.lumpy_skin_disease_symptoms ?? false,
        foot_and_mouth_case_in_10km: data.foot_and_mouth_case_in_10km ?? false,
        rift_valley_fever_case_in_10km: data.rift_valley_fever_case_in_10km ?? false,
        signed_location: signingLocation || data.signed_location || null,
        location_distance_note: data.location_distance_note || null,
      };

      const { error: insertError } = await supabase
        .from('veterinary_declarations')
        .insert(dbData);

      if (insertError) throw insertError;

      const listingUpdate = {
        status: 'available_for_loading',
        signed_location: (signingLocation || data.signed_location || listing?.signed_location || '') || null,
        number_cattle_loaded: cattleCount,
        number_sheep_loaded: sheepCount,
      } as Database['public']['Tables']['livestock_listings']['Update'];

      const { error: updateError } = await supabase
        .from('livestock_listings')
        .update(listingUpdate)
        .eq('id', listingId);

      if (updateError) throw updateError;

      toast({
        title: t('common', 'successTitle'),
        description: t('veterinaryDeclarationForm', 'submissionSuccessDescription'),
      });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/vet-dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Submission error:', error);
      toast({
        title: t('veterinaryDeclarationForm', 'submissionFailedTitle'),
        description: formatMessage(t('veterinaryDeclarationForm', 'submissionFailedDescription'), { reason: errorMessage }),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractFirstErrorMessage = (errors: FieldErrors<VeterinaryDeclarationFormData>): string | null => {
    const walk = (error: unknown): string | null => {
      if (!error) return null;
      if (Array.isArray(error)) {
        for (const item of error) {
          const message = walk(item);
          if (message) return message;
        }
        return null;
      }
      if (typeof error === 'object') {
        const maybeMessage = (error as { message?: string }).message;
        if (maybeMessage) return maybeMessage;
        for (const value of Object.values(error)) {
          const message = walk(value);
          if (message) return message;
        }
      }
      return null;
    };

    return walk(errors);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit, (errors) => {
    const firstMessage = extractFirstErrorMessage(errors);
    toast({
      title: t('veterinaryDeclarationForm', 'formReviewTitle'),
      description: firstMessage ?? t('veterinaryDeclarationForm', 'formReviewDescription'),
      variant: 'destructive',
    });
  });

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/vet-dashboard');
    }
  };

  if (!listing) {
    return <div>{t('common', 'loading')}</div>;
  }

  const readOnly = Boolean(existingDeclaration);
  // Compute derived totals for display and conditional UI
  const { cattleTotal, sheepTotal } = getTotalsFromLoadingPoints(listing.loading_points);
  const derivedCattleTotal = cattleTotal || listing.number_cattle_loaded || 0;
  const derivedSheepTotal = sheepTotal || listing.number_sheep_loaded || 0;
  const cattleCount = normalizeCount(form.watch('number_cattle_loaded'), derivedCattleTotal);
  const sheepCount = normalizeCount(form.watch('number_sheep_loaded'), derivedSheepTotal);
  const livestockType = LivestockCalculations.determineLivestockType(cattleCount, sheepCount);
  const livestockTypeLabel = getLivestockTypeLabel(livestockType);

  const vetFullName = `${vetProfile?.first_name ?? ''} ${vetProfile?.last_name ?? ''}`.trim();
  const headerDescription = formatMessage(t('veterinaryDeclarationForm', 'description'), {
    fullName: vetFullName || t('common', 'notAvailable'),
    registrationNumber: vetProfile?.registration_number || t('common', 'notAvailable'),
    location: listing.location || t('common', 'notAvailable'),
  });

  const beginEditTotals = () => {
    const rawCattle = form.getValues('number_cattle_loaded');
    const rawSheep = form.getValues('number_sheep_loaded');
    const initialCattle = (rawCattle ?? derivedCattleTotal) || 0;
    const initialSheep = (rawSheep ?? derivedSheepTotal) || 0;

    setPendingTotals({
      cattle: initialCattle > 0 ? String(initialCattle) : '',
      sheep: initialSheep > 0 ? String(initialSheep) : '',
    });
    setIsEditingTotals(true);
  };

  const cancelEditTotals = () => {
    setIsEditingTotals(false);
    setPendingTotals({ cattle: '', sheep: '' });
  };

  const saveTotals = async () => {
    if (readOnly) return;

    const parsedCattle = pendingTotals.cattle.trim() === '' ? 0 : Number(pendingTotals.cattle);
    const parsedSheep = pendingTotals.sheep.trim() === '' ? 0 : Number(pendingTotals.sheep);

    if (!Number.isFinite(parsedCattle) || parsedCattle < 0) {
      toast({
        title: t('veterinaryDeclarationForm', 'invalidCattleTotalTitle'),
        description: t('veterinaryDeclarationForm', 'invalidCattleTotalDescription'),
        variant: 'destructive',
      });
      return;
    }
    if (!Number.isFinite(parsedSheep) || parsedSheep < 0) {
      toast({
        title: t('veterinaryDeclarationForm', 'invalidSheepTotalTitle'),
        description: t('veterinaryDeclarationForm', 'invalidSheepTotalDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsSavingTotals(true);
    try {
      const listingTotalsUpdate: Database['public']['Tables']['livestock_listings']['Update'] = {
        number_cattle_loaded: parsedCattle,
        number_sheep_loaded: parsedSheep,
        additional_r25_per_head: listing?.additional_r25_per_head ?? null,
        gln_num: listing?.gln_num ?? null,
      };

      const { error } = await supabase
        .from('livestock_listings')
        .update(listingTotalsUpdate)
        .eq('id', listingId);

      if (error) throw error;

      form.setValue('number_cattle_loaded', parsedCattle, { shouldDirty: true, shouldValidate: true });
      form.setValue('number_sheep_loaded', parsedSheep, { shouldDirty: true, shouldValidate: true });
      setListing((prev) => (prev ? { ...prev, number_cattle_loaded: parsedCattle, number_sheep_loaded: parsedSheep } : prev));
      setIsEditingTotals(false);
      setPendingTotals({ cattle: '', sheep: '' });
      toast({
        title: t('veterinaryDeclarationForm', 'totalsUpdatedTitle'),
        description: t('veterinaryDeclarationForm', 'totalsUpdatedDescription'),
        variant: 'default',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update totals.';
      toast({
        title: t('common', 'errorTitle'),
        description: message || t('veterinaryDeclarationForm', 'updateFailedDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSavingTotals(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('veterinaryDeclarationForm', 'title')}</CardTitle>
        <CardDescription>{headerDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">{t('veterinaryDeclarationForm', 'listingInfoHeading')}</h3>
                <p><strong>{t('veterinaryDeclarationForm', 'ownerLabel')}:</strong> {listing.owner_name}</p>
                <p><strong>{t('veterinaryDeclarationForm', 'locationLabel')}:</strong> {listing.location}</p>
                <p><strong>{t('veterinaryDeclarationForm', 'referenceLabel')}:</strong> {listing.reference_id}</p>
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-semibold">{t('veterinaryDeclarationForm', 'inspectionLocationLabel')}</Label>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <Input
                      value={signingLocation}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSigningLocation(value);
                        form.setValue('signed_location', value, { shouldValidate: true });
                      }}
                      placeholder={t('veterinaryDeclarationForm', 'locationPlaceholder')}
                      disabled={readOnly}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={readOnly}
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast({
                            title: t('common', 'errorTitle'),
                            description: t('veterinaryDeclarationForm', 'locationErrorDescription'),
                            variant: 'destructive',
                          });
                          return;
                        }
                        toast({
                          title: t('veterinaryDeclarationForm', 'locationCaptureTitle'),
                          description: t('veterinaryDeclarationForm', 'locationCaptureDescription'),
                        });
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const formatted = `Lat: ${position.coords.latitude.toFixed(5)}, Lon: ${position.coords.longitude.toFixed(5)}`;
                            setSigningLocation(formatted);
                            form.setValue('signed_location', formatted, { shouldValidate: true });
                            toast({
                              title: t('veterinaryDeclarationForm', 'locationCapturedTitle'),
                              description: formatMessage(t('veterinaryDeclarationForm', 'locationCapturedDescription'), { coordinates: formatted }),
                            });
                          },
                          (error) => {
                            console.error('Geolocation error:', error);
                            toast({
                              title: t('veterinaryDeclarationForm', 'locationErrorTitle'),
                              description: error.message || t('veterinaryDeclarationForm', 'locationErrorDescription'),
                              variant: 'destructive',
                            });
                          },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                        );
                      }}
                    >
                      {t('signatureSection', 'getLocationButton')}
                    </Button>
                  </div>
                  <div className="mt-2">
                    <Label className="text-sm">{t('veterinaryDeclarationForm', 'distanceLabel')}</Label>
                    <Input
                      value={form.watch('location_distance_note') || ''}
                      onChange={(event) => {
                        form.setValue('location_distance_note', event.target.value, { shouldValidate: true });
                      }}
                      placeholder={t('veterinaryDeclarationForm', 'distancePlaceholder')}
                      disabled={readOnly}
                    />
                  </div>
                </div>
                {readOnly && (
                  <p className="mt-3 text-sm text-blue-700 bg-blue-100 border border-blue-200 rounded-md p-2">
                    {t('veterinaryDeclarationForm', 'readOnlyNotice')}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <h3 className="text-lg font-semibold">{t('veterinaryDeclarationForm', 'livestockSectionHeading')}</h3>
                  {!readOnly && (
                    <div className="flex gap-2">
                      {isEditingTotals ? (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={cancelEditTotals} disabled={isSavingTotals}>
                            {t('common', 'cancel')}
                          </Button>
                          <Button type="button" size="sm" onClick={saveTotals} disabled={isSavingTotals}>
                            {isSavingTotals ? t('common', 'saving') : t('veterinaryDeclarationForm', 'saveTotalsButton')}
                          </Button>
                        </>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={beginEditTotals}>
                          {t('veterinaryDeclarationForm', 'editTotalsButton')}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isEditingTotals ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      name="number_cattle_loaded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('veterinaryDeclarationForm', 'totalCattleLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={readOnly || isSavingTotals}
                              value={pendingTotals.cattle}
                              onChange={(event) => {
                                setPendingTotals((prev) => ({ ...prev, cattle: event.target.value }));
                                field.onChange(event.target.value === '' ? '' : Number(event.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="number_sheep_loaded"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('veterinaryDeclarationForm', 'totalSheepLabel')}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              disabled={readOnly || isSavingTotals}
                              value={pendingTotals.sheep}
                              onChange={(event) => {
                                setPendingTotals((prev) => ({ ...prev, sheep: event.target.value }));
                                field.onChange(event.target.value === '' ? '' : Number(event.target.value));
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end">
                      <Badge variant="outline">
                        {livestockTypeLabel}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cattleCount > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t('veterinaryDeclarationForm', 'totalCattleLabel')}</p>
                        <p className="text-xl font-semibold">{cattleCount}</p>
                      </div>
                    )}
                    {sheepCount > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">{t('veterinaryDeclarationForm', 'totalSheepLabel')}</p>
                        <p className="text-xl font-semibold">{sheepCount}</p>
                      </div>
                    )}
                    <div className="flex items-end">
                      <Badge variant="outline">
                        {livestockTypeLabel}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Loading Points Information */}
                {listing?.loading_points && (() => {
                  try {
                    const loadingPointsRaw = typeof listing.loading_points === 'string'
                      ? JSON.parse(listing.loading_points)
                      : listing.loading_points;
                    const loadingPoints = Array.isArray(loadingPointsRaw) ? (loadingPointsRaw as LoadingPoint[]) : [];
                    if (loadingPoints.length > 0) {
                      return (
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Loading Points Breakdown</h4>
                          <div className="space-y-3">
                            {loadingPoints.map((point: LoadingPoint, index: number) => {
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
                                    <h5 className="font-medium text-sm">
                                      {formatMessage(t('veterinaryDeclarationForm', 'loadingPointLabel'), { index: index + 1 })}
                                    </h5>
                                    <div className="flex gap-2">
                                      {hasCattle && (
                                        <Badge variant="secondary" className="text-xs">
                                          {formatMessage(t('veterinaryDeclarationForm', 'loadingPointCattleBadge'), { count: cattleCount })}
                                        </Badge>
                                      )}
                                      {hasSheep && (
                                        <Badge variant="secondary" className="text-xs">
                                          {formatMessage(t('veterinaryDeclarationForm', 'loadingPointSheepBadge'), { count: sheepCount })}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                                    <div>
                                      <strong>{t('veterinaryDeclarationForm', 'birthLabel')}</strong> {point.birth_address?.farm_name || t('common', 'notAvailable')}, {point.birth_address?.district || t('common', 'notAvailable')}, {point.birth_address?.province || t('common', 'notAvailable')}
                                    </div>
                                    <div>
                                      <strong>{t('veterinaryDeclarationForm', 'currentLabel')}</strong> {
                                        point.is_current_same_as_birth 
                                          ? t('veterinaryDeclarationForm', 'sameAsBirth')
                                          : `${point.current_address?.farm_name || t('common', 'notAvailable')}, ${point.current_address?.district || t('common', 'notAvailable')}, ${point.current_address?.province || t('common', 'notAvailable')}`
                                      }
                                    </div>
                                    <div>
                                      <strong>{t('veterinaryDeclarationForm', 'loadingLabel')}</strong> {
                                        point.is_loading_same_as_current 
                                          ? t('veterinaryDeclarationForm', 'sameAsCurrent')
                                          : `${point.loading_address?.farm_name || t('common', 'notAvailable')}, ${point.loading_address?.district || t('common', 'notAvailable')}, ${point.loading_address?.province || t('common', 'notAvailable')}`
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

                {/* Physical Inspection Requirements Display */}
                {cattleCount > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">{t('veterinaryDeclarationForm', 'cattleInspectionHeading')}</h4>
                    <p className="text-sm text-blue-800">
                      {formatMessage(t('veterinaryDeclarationForm', 'cattleInspectionText'), { count: cattleCount })}
                    </p>
                  </div>
                )}

                {/* Sheep Physical Inspection Requirements Display */}
                {sheepCount > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">{t('veterinaryDeclarationForm', 'sheepInspectionHeading')}</h4>
                    <p className="text-sm text-green-800">
                      {formatMessage(t('veterinaryDeclarationForm', 'sheepInspectionText'), { count: sheepCount })}
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cattle-related fields - Only show if cattle are loaded */}
                {LivestockCalculations.shouldShowCattleFields(cattleCount) && (
                  <>
                    <FormField
                      name="cattle_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {formatMessage(t('veterinaryDeclarationForm', 'cattleVisualQuestion'), { count: cattleCount })}
                          </FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} disabled={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="cattle_mouthed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {formatMessage(t('veterinaryDeclarationForm', 'cattlePhysicalQuestion'), { count: cattleCount })}
                          </FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} disabled={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Sheep-related fields - Only show if sheep are loaded */}
                {LivestockCalculations.shouldShowSheepFields(sheepCount) && (
                  <>
                    <FormField
                      name="sheep_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {formatMessage(t('veterinaryDeclarationForm', 'sheepVisualQuestion'), { count: sheepCount })}
                          </FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} disabled={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="sheep_mouthed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {formatMessage(t('veterinaryDeclarationForm', 'sheepPhysicalQuestion'), { count: sheepCount })}
                          </FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} disabled={readOnly} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* General disease-related fields - Always show */}
                <FormField
                  name="foot_and_mouth_symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('veterinaryDeclarationForm', 'footAndMouthQuestion')}</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lumpy_skin_disease_symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('veterinaryDeclarationForm', 'lumpySkinQuestion')}</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="foot_and_mouth_case_in_10km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('veterinaryDeclarationForm', 'footAndMouthAreaQuestion')}</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="rift_valley_fever_case_in_10km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('veterinaryDeclarationForm', 'riftValleyAreaQuestion')}</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  {t('common', 'cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || readOnly}>
                  {readOnly
                    ? t('veterinaryDeclarationForm', 'declarationSubmittedLabel')
                    : isSubmitting
                      ? t('veterinaryDeclarationForm', 'submittingLabel')
                      : t('veterinaryDeclarationForm', 'submitButtonLabel')}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
