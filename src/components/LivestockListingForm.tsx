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

  const form = useForm<LivestockListingFormData>({
    resolver: zodResolver(livestockListingSchema),
    defaultValues: {
      invitation_id: invitationId,
      reference_id: referenceId,
      owner_name: profile?.company_name || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      bred_or_bought: undefined,
      location: '',
      weighing_location: '',
      loading_points_1: 0,
      loading_points_2: 0,
      loading_points_3: 0,
      loading_points_4: 0,
      loading_points_5: 0,
      livestock_at_loading_point_1: 0,
      livestock_at_loading_point_2: 0,
      livestock_at_loading_point_3: 0,
      livestock_at_loading_point_4: 0,
      livestock_at_loading_point_5: 0,
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
      farm_birth_address: '',
      farm_loading_address: '',
      livestock_moved_out_of_boundaries: false,
      livestock_moved_location: '',
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
      assigned_vet_id: undefined,
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
          // Existing listing: reset form with merged and sanitized data
          const sanitizedData = {
            ...listingData,
            // Always use referenceId from invitation as source of truth
            reference_id: referenceId,
            
            // Handle nullable text fields by converting null to an empty string
            owner_name: listingData.owner_name ?? '',
            location: listingData.location ?? '',
            weighing_location: listingData.weighing_location ?? '',
            breed: listingData.breed ?? '',
            breeder_name: listingData.breeder_name ?? '',
            weaned_duration: listingData.weaned_duration ?? '',
            growth_implant_type: listingData.growth_implant_type ?? '',
            livestock_moved_location: listingData.livestock_moved_location ?? '',

            // Handle optional select fields
            assigned_vet_id: listingData.assigned_vet_id ?? undefined,

            // Handle nullable number fields by converting null to undefined
            estimated_average_weight: listingData.estimated_average_weight ?? undefined,
            number_of_heifers: listingData.number_of_heifers ?? undefined,
            number_cattle_loaded: listingData.number_cattle_loaded ?? undefined,
            number_sheep_loaded: listingData.number_sheep_loaded ?? undefined,

            // Cast enum types
            bred_or_bought: listingData.bred_or_bought as "BRED" | "BOUGHT IN",
            mothers_status: listingData.mothers_status as "WITH MOTHERS" | "ALREADY WEANED",
          };
          form.reset(sanitizedData);
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
    if (!profile) {
      toast({ title: 'Error', description: 'User profile not found.', variant: 'destructive' });
      return;
    }

    if (!signature) {
      toast({ title: 'Signature Required', description: 'Please provide your digital signature.', variant: 'destructive' });
      return;
    }

    const validationResult = livestockListingSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('Form validation errors:', validationResult.error.flatten().fieldErrors);
      toast({ title: 'Validation Error', description: 'Please check the form for errors.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { affidavit_file, ...restOfData } = data;

      let affidavitFilePath: string | undefined = restOfData.affidavit_file_path;
      if (affidavit_file instanceof File) {
        const file = affidavit_file;
        const fileName = `${profile.id}/${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('livestock_affidavits')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('livestock_affidavits').getPublicUrl(uploadData.path);
        affidavitFilePath = publicUrlData.publicUrl;
      }

      let error;
      if (existingListingId) {
        const updatePayload = {
          ...restOfData,
          profile_id: profile.id,
          seller_id: profile.id,
          signature_data: signature,
          affidavit_file_path: affidavitFilePath,
        };
        const { error: updateError } = await supabase
          .from('livestock_listings')
          .update(updatePayload)
          .eq('id', existingListingId);
        error = updateError;
      } else {
        const insertPayload = {
          ...restOfData,
          profile_id: profile.id,
          seller_id: profile.id,
          signature_data: signature,
          affidavit_file_path: affidavitFilePath,
          status: 'pending' as const,
        };
        // The type assertion below is a workaround. The Zod schema is too permissive
        // for new listings, making some required fields optional in the inferred type.
        const { error: insertError } = await supabase
          .from('livestock_listings')
          .insert(insertPayload as unknown as Database['public']['Tables']['livestock_listings']['Insert']);
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

              <LivestockDetailsSection />

              <Separator />

              <BiosecuritySection />

              <Separator />

              <LoadingPointsSection />

              <Separator />

              <DeclarationsSection />

              <Separator />

              <LoadingDetailsSection />

              <Separator className="my-8" />

              <VetSelectionSection />

              <Separator className="my-8" />

              <OfferTermsSection />

              <Separator className="my-8" />

              <SignatureSection
                signature={signature}
                setSignature={setSignature}
              />

              <div className="flex justify-end space-x-4 mt-8">
                <Button type="button" variant="outline" onClick={() => navigate('/seller-dashboard')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !signature}>
                  {isSubmitting ? (existingListingId ? 'Updating...' : 'Submitting...') : (existingListingId ? 'Update Listing' : 'Submit Listing')}
                </Button>
              </div>
            </form>
          </Form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};
