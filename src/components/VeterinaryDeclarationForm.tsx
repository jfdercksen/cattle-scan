import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useNavigate } from 'react-router-dom';
import type { Database } from '@/integrations/supabase/types';
import { veterinaryDeclarationSchema, VeterinaryDeclarationFormData } from '@/lib/schemas/veterinaryDeclarationSchema';
import { YesNoSwitch } from './ui/YesNoSwitch';
import { Tables } from '@/integrations/supabase/types';

interface VeterinaryDeclarationFormProps {
  listingId: string;
  onSuccess?: () => void;
}

export const VeterinaryDeclarationForm = ({ listingId, onSuccess }: VeterinaryDeclarationFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listing, setListing] = useState<Tables<'livestock_listings'> | null>(null);

  const form = useForm<VeterinaryDeclarationFormData>({
    resolver: zodResolver(veterinaryDeclarationSchema),
    defaultValues: {
      reference_id: listingId,
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
      });
    }
  }, [listingId, form, toast]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

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
        cattle_visually_inspected: data.cattle_visually_inspected,
        cattle_mouthed: data.cattle_mouthed,
        sheep_visually_inspected: data.sheep_visually_inspected,
        sheep_mouthed: data.sheep_mouthed,
        foot_and_mouth_symptoms: data.foot_and_mouth_symptoms,
        lumpy_skin_disease_symptoms: data.lumpy_skin_disease_symptoms,
        foot_and_mouth_case_in_10km: data.foot_and_mouth_case_in_10km,
        rift_valley_fever_case_in_10km: data.rift_valley_fever_case_in_10km,
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

  if (!listing) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Veterinary Declaration</CardTitle>
        <CardDescription>Please complete the veterinary declaration for the livestock listing.</CardDescription>
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

              <FormField
                control={form.control}
                name="veterinarian_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Veterinarian Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="veterinarian_registration_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration Number</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="cattle_visually_inspected" render={({ field }) => <FormItem><FormLabel>Cattle Visually Inspected</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="cattle_mouthed" render={({ field }) => <FormItem><FormLabel>25% of Cattle Mouthed</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="sheep_visually_inspected" render={({ field }) => <FormItem><FormLabel>Sheep Visually Inspected</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="sheep_mouthed" render={({ field }) => <FormItem><FormLabel>25% of Sheep Mouthed</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="foot_and_mouth_symptoms" render={({ field }) => <FormItem><FormLabel>Symptoms of Foot and Mouth Disease</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="lumpy_skin_disease_symptoms" render={({ field }) => <FormItem><FormLabel>Symptoms of Lumpy Skin Disease</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="foot_and_mouth_case_in_10km" render={({ field }) => <FormItem><FormLabel>Foot and Mouth Case within 10km</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
                <FormField name="rift_valley_fever_case_in_10km" render={({ field }) => <FormItem><FormLabel>Rift Valley Fever Case within 10km</FormLabel><FormControl><YesNoSwitch value={field.value} onChange={field.onChange} /></FormControl></FormItem>} />
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button type="button" variant="outline" onClick={() => navigate('/vet-dashboard')}>
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
