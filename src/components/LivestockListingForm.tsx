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
  postal_code?: string;
}

interface LoadingPoint {
  birth_address: Address;
  current_address: Address;
  loading_address: Address;
  is_current_same_as_birth: boolean;
  is_loading_same_as_current: boolean;
  number_of_cattle: number;
  number_of_sheep: number;
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

const safeJsonParseArray = (data: unknown, fallback: LoadingPoint[]): any[] => {
  if (Array.isArray(data)) {
    return data;
  }
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }
  return fallback;
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
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [existingListingId, setExistingListingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

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
      breeder_name: '',
      is_breeder_seller: false,
      farm_birth_address: { farm_name: '', district: '', province: '' }, // Legacy field, now handled by loading_points
      is_loading_at_birth_farm: true, // Legacy field
      farm_loading_address: { farm_name: '', district: '', province: '' },
      livestock_moved_out_of_boundaries: false,
      livestock_moved_location: { farm_name: '', district: '', province: '' },
      declaration_no_cloven_hooved_animals: false,
      declaration_livestock_kept_away: false,
      declaration_no_animal_origin_feed: false,
      declaration_veterinary_products_registered: false,
      declaration_no_foot_mouth_disease: false,
      declaration_no_foot_mouth_disease_farm: false,
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
  const totalCattle = loadingPointsValues?.reduce((sum, point) => sum + (Number(point.number_of_cattle) || 0), 0) ?? 0;
  const totalSheep = loadingPointsValues?.reduce((sum, point) => sum + (Number(point.number_of_sheep) || 0), 0) ?? 0;

  useEffect(() => {
    if (getValues('number_cattle_loaded') !== totalCattle) {
      setValue('number_cattle_loaded', totalCattle, { shouldDirty: true, shouldValidate: true });
    }
    if (getValues('number_sheep_loaded') !== totalSheep) {
      setValue('number_sheep_loaded', totalSheep, { shouldDirty: true, shouldValidate: true });
    }
  }, [totalCattle, totalSheep, getValues, setValue]);


  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }: { data: any; error: any }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            toast({ title: 'Error', description: 'Could not load your profile.', variant: 'destructive' });
            setProfile(null);
          } else {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else if (!authLoading) {
      setProfileLoading(false);
    }
  }, [user, authLoading, toast]);

  const formSections = [
    { title: "Livestock Details", component: <LivestockDetailsSection /> },
    { title: "Biosecurity", component: <BiosecuritySection /> },
    { title: "Loading Points", component: <LoadingPointsSection fields={fields} append={append} remove={remove} /> },

    { title: "Veterinarian", component: <VetSelectionSection /> },
    { title: "Offer Terms", component: <OfferTermsSection /> },
    { title: "Declarations", component: <DeclarationsSection /> },
    {
      title: "Signature",
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
          .select('reference_id')
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
            title: 'Error',
            description: 'Failed to load invitation data.',
            variant: 'destructive',
          });
          return;
        }

        const { data: listingData, error: listingError } = typedListingRes;
        if (listingError) {
          console.error('Error fetching listing data:', listingError);
          toast({
            title: 'Error',
            description: 'Failed to load existing listing data.',
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
            breeder_name: getString(listingData.breeder_name),
            is_breeder_seller: getBoolean(listingData.is_breeder_seller),
            farm_birth_address: safeJsonParse(getJsonValue(listingData.farm_birth_address), { farm_name: '', district: '', province: '' }),
            farm_loading_address: safeJsonParse(getJsonValue(listingData.farm_loading_address), { farm_name: '', district: '', province: '' }),
            livestock_moved_out_of_boundaries: getBoolean(listingData.livestock_moved_out_of_boundaries),
            livestock_moved_location: safeJsonParse(getJsonValue(listingData.livestock_moved_location), { farm_name: '', district: '', province: '' }),
            declaration_no_cloven_hooved_animals: getBoolean(listingData.declaration_no_cloven_hooved_animals),
            declaration_livestock_kept_away: getBoolean(listingData.declaration_livestock_kept_away),
            declaration_no_animal_origin_feed: getBoolean(listingData.declaration_no_animal_origin_feed),
            declaration_veterinary_products_registered: getBoolean(listingData.declaration_veterinary_products_registered),
            declaration_no_foot_mouth_disease: getBoolean(listingData.declaration_no_foot_mouth_disease),
            declaration_no_foot_mouth_disease_farm: getBoolean(listingData.declaration_no_foot_mouth_disease_farm),
            declaration_livestock_south_africa: getBoolean(listingData.declaration_livestock_south_africa),
            declaration_no_gene_editing: getBoolean(listingData.declaration_no_gene_editing),
            loading_points: safeJsonParseArray(listingData.loading_points, []).map(point => {
              // Handle legacy format conversion
              if ('is_loading_at_birth_farm' in point) {
                // Convert old format to new format
                const legacyPoint = point as any;
                return {
                  birth_address: legacyPoint.birth_address || { farm_name: '', district: '', province: '', postal_code: '' },
                  current_address: legacyPoint.birth_address || { farm_name: '', district: '', province: '', postal_code: '' },
                  loading_address: legacyPoint.is_loading_at_birth_farm
                    ? legacyPoint.birth_address
                    : (legacyPoint.loading_address || { farm_name: '', district: '', province: '', postal_code: '' }),
                  is_current_same_as_birth: true,
                  is_loading_same_as_current: legacyPoint.is_loading_at_birth_farm || false,
                  number_of_cattle: legacyPoint.number_of_cattle || 0,
                  number_of_sheep: legacyPoint.number_of_sheep || 0,
                };
              }
              // New format - ensure all fields exist
              return {
                birth_address: point.birth_address || { farm_name: '', district: '', province: '', postal_code: '' },
                current_address: point.current_address || { farm_name: '', district: '', province: '', postal_code: '' },
                loading_address: point.loading_address || { farm_name: '', district: '', province: '', postal_code: '' },
                is_current_same_as_birth: point.is_current_same_as_birth || false,
                is_loading_same_as_current: point.is_loading_same_as_current || false,
                number_of_cattle: point.number_of_cattle || 0,
                number_of_sheep: point.number_of_sheep || 0,
              };
            }),
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
          const defaultAddress = { farm_name: '', district: '', province: '', postal_code: '' };
          const defaultLoadingPoint = {
            birth_address: defaultAddress,
            current_address: defaultAddress,
            loading_address: defaultAddress,
            is_current_same_as_birth: false,
            is_loading_same_as_current: false,
            number_of_cattle: 0,
            number_of_sheep: 0,
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
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load initial listing data.',
          variant: 'destructive',
        });
      }
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, form, profile]);

  const onInvalid = (errors: FieldErrors<LivestockListingFormData>) => {
    console.error('Form validation errors:', errors);
    toast({
      title: 'Incomplete Form',
      description: 'Please go back through the steps and make sure all required fields are completed.',
      variant: 'destructive',
    });
  };

  const onSubmit = async (data: LivestockListingFormData) => {
    if (!profile || !user) {
      toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' });
      return;
    }

    if (!signature) {
      toast({ title: 'Signature Required', description: 'Please provide your digital signature.', variant: 'destructive' });
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

      const submissionData: any = {
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
        farm_birth_address: JSON.stringify(data.loading_points?.[0]?.birth_address || data.farm_birth_address),
        farm_loading_address: data.loading_points?.[0]?.is_loading_same_as_current ?
          JSON.stringify(data.loading_points[0].current_address) :
          JSON.stringify(data.loading_points?.[0]?.loading_address || data.farm_loading_address),
        livestock_moved_location: data.livestock_moved_out_of_boundaries ? JSON.stringify(data.livestock_moved_location) : null,
        loading_points: JSON.stringify(data.loading_points),
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

      toast({
        title: 'Success!',
        description: `Livestock listing ${existingListingId ? 'updated' : 'created'} successfully.`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/seller-dashboard');
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast({ title: 'Error', description: 'There was an error submitting the form. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Loading form...</p>
      </div>
    );
  }

  if (!user || !profile) {
    toast({ title: 'Authentication Error', description: 'You must be logged in to create a listing.', variant: 'destructive' });
    navigate('/auth');
    return null;
  }

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="text-lg md:text-xl">{existingListingId ? 'Edit' : 'Create'} Livestock Listing</CardTitle>
        <CardDescription className="text-sm md:text-base">
          Submit your livestock details and biosecurity attestation to sell to Chelmar
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
                    <FormLabel>Reference ID</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly className="font-mono bg-gray-100" />
                    </FormControl>
                    <FormDescription>
                      This is the unique reference for your listing invitation.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator />

              {/* Responsible Person Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Responsible Person Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Name</Label>
                    <p className="text-sm text-gray-700">{`${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Designation</Label>
                    <p className="text-sm text-gray-700">{profile?.role}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Company</Label>
                    <p className="text-sm text-gray-700">{profile?.company_name || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Email</Label>
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
                  Cancel
                </Button>

                <div className="flex items-center space-x-4">
                  {/* Desktop navigation buttons */}
                  <div className="hidden md:flex items-center space-x-4">
                    {currentStep > 0 && (
                      <Button type="button" variant="outline" onClick={prevStep}>
                        Back
                      </Button>
                    )}
                    {currentStep < formSections.length - 1 ? (
                      <Button type="button" onClick={nextStep}>
                        Next
                      </Button>
                    ) : (
                      <Button type="submit" disabled={isSubmitting || !signature}>
                        {isSubmitting ? (existingListingId ? 'Updating...' : 'Submitting...') : (existingListingId ? 'Update Listing' : 'Submit Listing')}
                      </Button>
                    )}
                  </div>

                  {/* Mobile: Only show submit button on last step */}
                  <div className="md:hidden">
                    {currentStep === formSections.length - 1 && (
                      <Button type="submit" disabled={isSubmitting || !signature}>
                        {isSubmitting ? (existingListingId ? 'Updating...' : 'Submitting...') : (existingListingId ? 'Update Listing' : 'Submit Listing')}
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
