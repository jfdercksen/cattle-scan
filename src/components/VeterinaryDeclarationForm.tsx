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

  const form = useForm<VeterinaryDeclarationFormData>({
    resolver: zodResolver(veterinaryDeclarationSchema),
    defaultValues: {
      reference_id: listingId,
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
      form.reset({
        ...form.getValues(),
        reference_id: data.id,
        owner_of_livestock: data.owner_name,
        farm_address: data.farm_loading_address ?? '',
        number_cattle_loaded: data.number_cattle_loaded ?? 0,
        number_sheep_loaded: data.number_sheep_loaded ?? 0,
      });
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
      };

      const { error: insertError } = await supabase
        .from('veterinary_declarations')
        .insert(dbData);

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('livestock_listings')
        .update({ status: 'completed' })
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
              </div>

              <Separator />

              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold">Livestock to be Loaded</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Only show cattle count if > 0 */}
                  {(listing?.number_cattle_loaded ?? 0) > 0 && (
                    <div>
                      <p><strong>Total Cattle:</strong> {listing?.number_cattle_loaded}</p>
                    </div>
                  )}

                  {/* Only show sheep count if > 0 */}
                  {(listing?.number_sheep_loaded ?? 0) > 0 && (
                    <div>
                      <p><strong>Total Sheep:</strong> {listing?.number_sheep_loaded}</p>
                    </div>
                  )}

                  <div>
                    <Badge variant="outline">
                      {LivestockCalculations.determineLivestockType(
                        listing?.number_cattle_loaded ?? 0,
                        listing?.number_sheep_loaded ?? 0
                      ) || "No livestock"}
                    </Badge>
                  </div>
                </div>

                {/* Loading Points Information */}
                {listing?.loading_points && (() => {
                  try {
                    const loadingPoints = typeof listing.loading_points === 'string' 
                      ? JSON.parse(listing.loading_points) 
                      : listing.loading_points;
                    
                    if (Array.isArray(loadingPoints) && loadingPoints.length > 0) {
                      return (
                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Loading Points Breakdown</h4>
                          <div className="space-y-3">
                            {loadingPoints.map((point: any, index: number) => {
                              const hasCattle = (point.number_of_cattle ?? 0) > 0;
                              const hasSheep = (point.number_of_sheep ?? 0) > 0;
                              
                              if (!hasCattle && !hasSheep) return null;
                              
                              return (
                                <div key={index} className="p-3 bg-white border rounded-md">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="font-medium text-sm">Loading Point {index + 1}</h5>
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

                {/* Mouthing Requirements Display */}
                {(listing?.number_cattle_loaded ?? 0) > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-medium text-blue-900 mb-2">Cattle Mouthing Requirements</h4>
                    <p className="text-sm text-blue-800">
                      {calculationEngine.calculateMouthingRequirement(listing?.number_cattle_loaded ?? 0).displayText}
                    </p>
                  </div>
                )}

                {/* Sheep Mouthing Requirements Display */}
                {(listing?.number_sheep_loaded ?? 0) > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">Sheep Mouthing Requirements</h4>
                    <p className="text-sm text-green-800">
                      {Math.ceil((listing?.number_sheep_loaded ?? 0) * 0.25)} sheep must be mouthed (25% of {listing?.number_sheep_loaded ?? 0} total sheep)
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cattle-related fields - Only show if cattle are loaded */}
                {LivestockCalculations.shouldShowCattleFields(listing?.number_cattle_loaded ?? 0) && (
                  <>
                    <FormField
                      name="cattle_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have {listing?.number_cattle_loaded || 0} cattle visually been inspected?</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="cattle_mouthed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Have {calculationEngine.calculateMouthingRequirement(listing?.number_cattle_loaded ?? 0).requiredCount} cattle been mouthed? (25%)
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
                {LivestockCalculations.shouldShowSheepFields(listing?.number_sheep_loaded ?? 0) && (
                  <>
                    <FormField
                      name="sheep_visually_inspected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Have {listing?.number_sheep_loaded || 0} sheep been visually inspected?</FormLabel>
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
                          <FormLabel>Have {Math.ceil((listing?.number_sheep_loaded || 0) * 0.25)} sheep been mouthed? (25%)</FormLabel>
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Declaration'}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
