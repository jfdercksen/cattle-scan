import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { livestockListingSchema, LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { LivestockDetailsSection } from './livestock-listing-form/LivestockDetailsSection';
import { BiosecuritySection } from './livestock-listing-form/BiosecuritySection';
import { DeclarationsSection } from './livestock-listing-form/DeclarationsSection';
import { LoadingPointsSection } from './livestock-listing-form/LoadingPointsSection';
import { LoadingDetailsSection } from './livestock-listing-form/LoadingDetailsSection';
import { SignatureSection } from './livestock-listing-form/SignatureSection';
import { VetSelectionSection } from './livestock-listing-form/VetSelectionSection';
import { OfferTermsSection } from './livestock-listing-form/OfferTermsSection';
import { FormStepper } from './livestock-listing-form/FormStepper';

interface Address {
  farm_name: string;
  district: string;
  province: string;
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

interface LivestockListingFormProps {
  invitationId: string;
  referenceId: string;
  onSuccess?: () => void;
}

export const LivestockListingForm = ({ invitationId, referenceId, onSuccess }: LivestockListingFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [existingListingId, setExistingListingId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const formSections = [
    { title: "Livestock Details", component: <LivestockDetailsSection /> },
    { title: "Biosecurity", component: <BiosecuritySection /> },
    { title: "Loading Points", component: <LoadingPointsSection /> },
    { title: "Loading Details", component: <LoadingDetailsSection /> },
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

  const form = useForm<LivestockListingFormData>({
    resolver: zodResolver(livestockListingSchema),
    defaultValues: {
      invitation_id: invitationId,
      reference_id: referenceId,
      owner_name: profile?.company_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      livestock_type: undefined,
      bred_or_bought: undefined,
      location: '',
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
      farm_birth_address: { farm_name: '', district: '', province: '' },
      is_loading_at_birth_farm: true,
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

      // Vet selection
      assigned_vet_id: '',
      invited_vet_email: '',
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      if (!invitationId) return;

      try {
        const [invitationRes, listingRes] = await Promise.all([
          supabase.from('listing_invitations').select('reference_id').eq('id', invitationId).single(),
          supabase.from('livestock_listings').select('*').eq('invitation_id', invitationId).maybeSingle()
        ]);

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

        const { data: listingData, error: listingError } = listingRes;
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
          const formData: Partial<LivestockListingFormData> = {
            invitation_id: listingData.invitation_id,
            reference_id: referenceId, // from invitation
            owner_name: listingData.owner_name ?? '',
            bred_or_bought: listingData.bred_or_bought as "BRED" | "BOUGHT IN" | undefined,
            location: listingData.location ?? '',
            weighing_location: listingData.weighing_location ?? '',
            total_livestock_offered: listingData.total_livestock_offered ?? 0,
            number_of_heifers: listingData.number_of_heifers ?? undefined,
            males_castrated: listingData.males_castrated ?? false,
            mothers_status: listingData.mothers_status as "WITH MOTHERS" | "ALREADY WEANED" | undefined,
            weaned_duration: listingData.weaned_duration ?? '',
            grazing_green_feed: listingData.grazing_green_feed ?? false,
            growth_implant: listingData.growth_implant ?? false,
            growth_implant_type: listingData.growth_implant_type ?? '',
            estimated_average_weight: listingData.estimated_average_weight ?? undefined,
            breed: listingData.breed ?? '',
            breeder_name: listingData.breeder_name ?? '',
            is_breeder_seller: listingData.is_breeder_seller ?? false,
            farm_birth_address: safeJsonParse(listingData.farm_birth_address, { farm_name: '', district: '', province: '' }),
            farm_loading_address: safeJsonParse(listingData.farm_loading_address, { farm_name: '', district: '', province: '' }),
            livestock_moved_out_of_boundaries: listingData.livestock_moved_out_of_boundaries ?? false,
            livestock_moved_location: safeJsonParse(listingData.livestock_moved_location, { farm_name: '', district: '', province: '' }),
            declaration_no_cloven_hooved_animals: listingData.declaration_no_cloven_hooved_animals ?? false,
            declaration_livestock_kept_away: listingData.declaration_livestock_kept_away ?? false,
            declaration_no_animal_origin_feed: listingData.declaration_no_animal_origin_feed ?? false,
            declaration_veterinary_products_registered: listingData.declaration_veterinary_products_registered ?? false,
            declaration_no_foot_mouth_disease: listingData.declaration_no_foot_mouth_disease ?? false,
            declaration_no_foot_mouth_disease_farm: listingData.declaration_no_foot_mouth_disease_farm ?? false,
            declaration_livestock_south_africa: listingData.declaration_livestock_south_africa ?? false,
            declaration_no_gene_editing: listingData.declaration_no_gene_editing ?? false,
            number_cattle_loaded: listingData.number_cattle_loaded ?? undefined,
            number_sheep_loaded: listingData.number_sheep_loaded ?? undefined,
            truck_registration_number: listingData.truck_registration_number ?? '',
            signature_data: listingData.signature_data ?? '',
            signed_location: listingData.signed_location ?? '',
            assigned_vet_id: listingData.assigned_vet_id ?? undefined,
            invited_vet_email: listingData.invited_vet_email ?? '',
          };
          form.reset(formData);
          setExistingListingId(listingData.id);
          if (listingData.signature_data) {
            setSignature(listingData.signature_data);
          }
        } else {
          // New listing: just set the reference_id
          form.setValue('reference_id', referenceId);
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
  }, [invitationId, form]);

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

      // Manually construct the submission object to ensure type safety
      const submissionData: Omit<Database['public']['Tables']['livestock_listings']['Insert'], 'created_at' | 'id'> = {
        profile_id: profile.id,
        seller_id: user.id,
        signature_data: signature,
        status: data.assigned_vet_id ? 'submitted_to_vet' : 'pending_submission',
        affidavit_file_path: affidavitFilePath,
        // Required fields with defaults
        owner_name: data.owner_name || '',
        livestock_type: data.livestock_type || 'CATTLE',
        bred_or_bought: data.bred_or_bought || 'BRED',
        location: data.location || '',
        weighing_location: data.weighing_location || '',
        total_livestock_offered: data.total_livestock_offered || 0,
        estimated_average_weight: data.estimated_average_weight || 0,
        breed: data.breed || '',

        // Optional/Nullable Fields
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
        assigned_vet_id: data.assigned_vet_id,
        invited_vet_email: data.invited_vet_email,
        additional_r25_per_calf: data.additional_r25_per_calf,
        affidavit_required: data.affidavit_required,
        is_loading_at_birth_farm: data.is_loading_at_birth_farm,
        livestock_moved_out_of_boundaries: data.livestock_moved_out_of_boundaries,

        // Declarations
        declaration_no_cloven_hooved_animals: data.declaration_no_cloven_hooved_animals,
        declaration_livestock_kept_away: data.declaration_livestock_kept_away,
        declaration_no_animal_origin_feed: data.declaration_no_animal_origin_feed,
        declaration_veterinary_products_registered: data.declaration_veterinary_products_registered,
        declaration_no_foot_mouth_disease: data.declaration_no_foot_mouth_disease,
        declaration_no_foot_mouth_disease_farm: data.declaration_no_foot_mouth_disease_farm,
        declaration_livestock_south_africa: data.declaration_livestock_south_africa,
        declaration_no_gene_editing: data.declaration_no_gene_editing,

        // JSONB Fields
        farm_birth_address: JSON.stringify(data.farm_birth_address),
        farm_loading_address: data.is_loading_at_birth_farm ? JSON.stringify(data.farm_birth_address) : JSON.stringify(data.farm_loading_address),
        livestock_moved_location: data.livestock_moved_out_of_boundaries ? JSON.stringify(data.livestock_moved_location) : null,
        loading_points: JSON.stringify(data.loading_points),
      };

      let error;
      if (existingListingId) {
        const { error: updateError } = await supabase
          .from('livestock_listings')
          .update(submissionData)
          .eq('id', existingListingId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('livestock_listings')
          .insert(submissionData);
        error = insertError;
      }

      if (error) throw error;

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

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>{existingListingId ? 'Edit' : 'Create'} Livestock Listing</CardTitle>
        <CardDescription>
          Submit your livestock details and biosecurity attestation to sell to Chelmar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="flex justify-end items-center mt-8 space-x-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/seller-dashboard')}>
                  Cancel
                </Button>
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
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
