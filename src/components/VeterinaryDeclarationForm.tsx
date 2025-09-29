import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
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
        title: 'Error',
        description: 'Failed to fetch listing data.',
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
          setSigningLocation(baseValues.signed_location || '');
        }
      }

      form.reset(baseValues);
    }
  }, [listingId, form, toast]);

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
        toast({ title: 'Error', description: 'Failed to fetch vet profile.', variant: 'destructive' });
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
  }, [user, form, toast]);

  const onSubmit = async (data: VeterinaryDeclarationFormData) => {
    if (existingDeclaration) {
      toast({ title: 'Already Submitted', description: 'This declaration has already been submitted and cannot be edited.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      if (!data.reference_id) {
        toast({ title: 'Error', description: 'Reference ID is missing.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
      }

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
      };

      const { error: insertError } = await supabase
        .from('veterinary_declarations')
        .insert(dbData);

      if (insertError) throw insertError;

      const listingUpdate = {
        status: 'available_for_loading',
        signed_location: (signingLocation || data.signed_location || listing?.signed_location || '') || null,
      } as Database['public']['Tables']['livestock_listings']['Update'];

      const { error: updateError } = await supabase
        .from('livestock_listings')
        .update(listingUpdate)
        .eq('id', listingId);

      if (updateError) throw updateError;

      toast({ title: 'Success', description: 'Veterinary declaration submitted successfully.' });
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/vet-dashboard');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      console.error('Submission error:', error);
      toast({
        title: 'Submission Failed',
        description: `Could not submit the declaration. Reason: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/vet-dashboard');
    }
  };

  if (!listing) {
    return <div>Loading...</div>;
  }

  const readOnly = Boolean(existingDeclaration);
  // Compute derived totals for display and conditional UI
  const { cattleTotal, sheepTotal } = getTotalsFromLoadingPoints(listing.loading_points);
  const displayCattleTotal = cattleTotal || listing.number_cattle_loaded || 0;
  const displaySheepTotal = sheepTotal || listing.number_sheep_loaded || 0;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Veterinary Declaration</CardTitle>
        <CardDescription>
          I Dr. {vetProfile?.first_name} {vetProfile?.last_name}, a veterinarian registered with the South African Veterinary Council with registration number {vetProfile?.registration_number}, declare that I inspected the following livestock at the following address: {listing?.location}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-2">Listing Information</h3>
                <p><strong>Owner:</strong> {listing.owner_name}</p>
                <p><strong>Location:</strong> {listing.location}</p>
                <p><strong>Reference ID:</strong> {listing.reference_id}</p>
                <div className="mt-3 space-y-2">
                  <Label className="text-sm font-semibold">Inspection Location</Label>
                  <div className="flex flex-col md:flex-row md:items-center md:gap-2">
                    <Input
                      value={signingLocation}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSigningLocation(value);
                        form.setValue('signed_location', value, { shouldValidate: true });
                      }}
                      placeholder="Lat: -26.00000, Lon: 28.00000"
                      disabled={readOnly}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={readOnly}
                      onClick={() => {
                        if (!navigator.geolocation) {
                          toast({ title: 'Error', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
                          return;
                        }
                        toast({ title: 'Capturing Location', description: 'Attempting to retrieve your GPS coordinates.' });
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            const formatted = `Lat: ${position.coords.latitude.toFixed(5)}, Lon: ${position.coords.longitude.toFixed(5)}`;
                            setSigningLocation(formatted);
                            form.setValue('signed_location', formatted, { shouldValidate: true });
                            toast({ title: 'Location Captured', description: formatted });
                          },
                          (error) => {
                            console.error('Geolocation error:', error);
                            toast({
                              title: 'Location Error',
                              description: error.message || 'Unable to retrieve your location. Please enter it manually.',
                              variant: 'destructive',
                            });
                          },
                          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
                        );
                      }}
                    >
                      Get Location
                    </Button>
                  </div>
                </div>
                {readOnly && (
                  <p className="mt-3 text-sm text-blue-700 bg-blue-100 border border-blue-200 rounded-md p-2">
                    This declaration has already been submitted and is view-only.
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold">Livestock to be Loaded</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Only show cattle count if > 0 */}
                  {displayCattleTotal > 0 && (
                    <div>
                      <p><strong>Total Cattle:</strong> {displayCattleTotal}</p>
                    </div>
                  )}

                  {/* Only show sheep count if > 0 */}
                  {displaySheepTotal > 0 && (
                    <div>
                      <p><strong>Total Sheep:</strong> {displaySheepTotal}</p>
                    </div>
                  )}

                  <div>
                    <Badge variant="outline">
                      {LivestockCalculations.determineLivestockType(
                        displayCattleTotal,
                        displaySheepTotal
                      ) || "No livestock"}
                    </Badge>
                  </div>
                </div>

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
                                    <h5 className="font-medium text-sm">Loading Point {index + 1}</h5>
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

                {/* Mouthing Requirements Display */}
                {displayCattleTotal > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Cattle Mouthing Requirements</h4>
                    <p className="text-sm text-blue-800">
                      {calculationEngine.calculateMouthingRequirement(displayCattleTotal).displayText}
                    </p>
                  </div>
                )}

                {/* Sheep Mouthing Requirements Display */}
                {displaySheepTotal > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">Sheep Mouthing Requirements</h4>
                    <p className="text-sm text-green-800">
                      {Math.ceil(displaySheepTotal * 0.25)} sheep must be mouthed (25% of {displaySheepTotal} total sheep)
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cattle-related fields - Only show if cattle are loaded */}
                {LivestockCalculations.shouldShowCattleFields(displayCattleTotal) && (
                  <>
                    <FormField
                      name="cattle_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have {displayCattleTotal} cattle visually been inspected?</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} disabled={readOnly} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="cattle_mouthed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Have {calculationEngine.calculateMouthingRequirement(displayCattleTotal).requiredCount} cattle been mouthed? (25%)
                          </FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* Sheep-related fields - Only show if sheep are loaded */}
                {LivestockCalculations.shouldShowSheepFields(displaySheepTotal) && (
                  <>
                    <FormField
                      name="sheep_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have {displaySheepTotal} sheep been visually inspected?</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="sheep_mouthed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have {Math.ceil(displaySheepTotal * 0.25)} sheep been mouthed? (25%)</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
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
                      <FormLabel>Were there any symptoms or lesions (old or new) of Foot and Mouth Disease observed during the inspection of the livestock?</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="lumpy_skin_disease_symptoms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Were there any symptoms or lesions (old or new) of Lumpy Skin Disease observed during the inspection of the livestock?</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="foot_and_mouth_case_in_10km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>According to my knowledge there has been no case of Foot and Mouth disease within 10 km from the livestock inspection point.</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  name="rift_valley_fever_case_in_10km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>According to my knowledge there has been no case of Rift Valley Fever within 10 km from the livestock inspection point.</FormLabel>
                      <FormControl>
                        <YesNoSwitch value={field.value} onChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || readOnly}>
                  {readOnly ? 'Declaration Submitted' : isSubmitting ? 'Submitting...' : 'Submit Declaration'}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
