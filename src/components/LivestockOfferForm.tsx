
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

const offerFormSchema = z.object({
  chalmar_beef_offer: z.number().min(0, 'Offer amount must be positive'),
  to_weight: z.number().min(0, 'Weight must be positive'),
  then_penilazation_of: z.number().min(0, 'Penalization amount must be positive'),
  and_from: z.number().min(0, 'From amount must be positive'),
  penilazation_of: z.number().min(0, 'Penalization amount must be positive'),
  percent_heifers_allowed: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
  penilazation_for_additional_heifers: z.number().min(0, 'Penalization amount must be positive'),
  offer_valid_until_date: z.string().min(1, 'Date is required'),
  offer_valid_until_time: z.string().min(1, 'Time is required'),
  additional_r25_per_calf: z.boolean().default(false),
  affidavit_required: z.boolean().default(false),
});

type OfferFormData = z.infer<typeof offerFormSchema>;

interface LivestockOfferFormProps {
  listing: LivestockListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const LivestockOfferForm = ({ listing, onClose, onSuccess }: LivestockOfferFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      chalmar_beef_offer: 0,
      to_weight: 0,
      then_penilazation_of: 0,
      and_from: 0,
      penilazation_of: 0,
      percent_heifers_allowed: 0,
      penilazation_for_additional_heifers: 0,
      offer_valid_until_date: '',
      offer_valid_until_time: '',
      additional_r25_per_calf: false,
      affidavit_required: false,
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('livestock_offers')
        .insert({
          listing_id: listing.id,
          created_by: user.user.id,
          chalmar_beef_offer: data.chalmar_beef_offer,
          to_weight: data.to_weight,
          then_penilazation_of: data.then_penilazation_of,
          and_from: data.and_from,
          penilazation_of: data.penilazation_of,
          percent_heifers_allowed: data.percent_heifers_allowed,
          penilazation_for_additional_heifers: data.penilazation_for_additional_heifers,
          offer_valid_until_date: data.offer_valid_until_date,
          offer_valid_until_time: data.offer_valid_until_time,
          additional_r25_per_calf: data.additional_r25_per_calf,
          affidavit_required: data.affidavit_required,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Offer submitted successfully!",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Offer for {listing.owner_name}</CardTitle>
        <CardDescription>
          Complete the offer form for the livestock listing
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Listing Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Location:</span> {listing.location}
            </div>
            <div>
              <span className="font-medium">Breed:</span> {listing.breed}
            </div>
            <div>
              <span className="font-medium">Total Livestock:</span> {listing.total_livestock_offered}
            </div>
            <div>
              <span className="font-medium">Heifers:</span> {listing.number_of_heifers}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chalmar_beef_offer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chalmar Beef Offer (R/KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="to_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To Weight (KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="then_penilazation_of"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Then Penilazation of (C/KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="and_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>And From (KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="penilazation_of"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penilazation of (C/KG)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="percent_heifers_allowed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>% Heifers Allowed</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="penilazation_for_additional_heifers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Penilazation for Each Additional % Heifers (C/KG)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={field.value}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="offer_valid_until_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Valid Until (Date)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offer_valid_until_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offer Valid Until (Time)</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="additional_r25_per_calf"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Additional R25 per calf payment for turnover of less than R10 million</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affidavit_required"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Attached sworn affidavit must be completed and submitted</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This offer is subject to biosecurity terms and evaluation of biosecurity and trace-ability 
                assessment as well as the veterinary declaration. If Chalmar Beef is placed under quarantine before the livestock 
                is offloaded, the offer is withdrawn.
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting Offer...' : 'Submit Offer'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
