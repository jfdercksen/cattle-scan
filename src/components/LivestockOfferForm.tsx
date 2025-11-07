
import { useMemo, useState } from 'react';
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
import { useTranslation } from '@/i18n/useTranslation';

type LivestockListing = Tables<'livestock_listings'> & {
  listing_invitations: {
    reference_id: string;
  } | null;
};

type Translate = ReturnType<typeof useTranslation>['t'];

const createOfferFormSchema = (t: Translate) =>
  z.object({
    chalmar_beef_offer: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositiveOffer'),
      })
      .min(0, { message: t('adminOffers', 'validationPositiveOffer') }),
    to_weight: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositiveWeight'),
      })
      .min(0, { message: t('adminOffers', 'validationPositiveWeight') }),
    then_penilazation_of: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositivePenalization'),
      })
      .min(0, { message: t('adminOffers', 'validationPositivePenalization') }),
    and_from: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositiveWeight'),
      })
      .min(0, { message: t('adminOffers', 'validationPositiveWeight') }),
    penilazation_of: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositivePenalization'),
      })
      .min(0, { message: t('adminOffers', 'validationPositivePenalization') }),
    percent_heifers_allowed: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPercentRange'),
      })
      .min(0, { message: t('adminOffers', 'validationPercentRange') })
      .max(100, { message: t('adminOffers', 'validationPercentRange') }),
    penilazation_for_additional_heifers: z
      .number({
        invalid_type_error: t('adminOffers', 'validationPositivePenalization'),
      })
      .min(0, { message: t('adminOffers', 'validationPositivePenalization') }),
    offer_valid_until_date: z
      .string({
        invalid_type_error: t('adminOffers', 'validationDateRequired'),
      })
      .min(1, { message: t('adminOffers', 'validationDateRequired') }),
    offer_valid_until_time: z
      .string({
        invalid_type_error: t('adminOffers', 'validationTimeRequired'),
      })
      .min(1, { message: t('adminOffers', 'validationTimeRequired') }),
    additional_r25_per_calf: z.boolean().default(false),
    affidavit_required: z.boolean().default(false),
  });

type OfferFormSchema = ReturnType<typeof createOfferFormSchema>;
type OfferFormData = z.infer<OfferFormSchema>;

interface LivestockOfferFormProps {
  listing: LivestockListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const LivestockOfferForm = ({ listing, onClose, onSuccess }: LivestockOfferFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const offerFormSchema = useMemo(() => createOfferFormSchema(t), [t]);

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
        throw new Error(t('adminOffers', 'authError'));
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
        title: t('adminOffers', 'successTitle'),
        description: t('adminOffers', 'successDescription'),
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting offer:', error);
      toast({
        title: t('adminOffers', 'errorTitle'),
        description: t('adminOffers', 'errorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{t('adminOffers', 'formTitle').replace('{owner}', listing.owner_name)}</CardTitle>
        <CardDescription>
          {t('adminOffers', 'formDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">{t('adminOffers', 'listingDetailsHeading')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">{t('adminOffers', 'listingLocationLabel')}:</span> {listing.location}
            </div>
            <div>
              <span className="font-medium">{t('adminOffers', 'listingBreedLabel')}:</span> {listing.breed}
            </div>
            <div>
              <span className="font-medium">{t('adminOffers', 'listingTotalLivestockLabel')}:</span> {listing.total_livestock_offered}
            </div>
            <div>
              <span className="font-medium">{t('adminOffers', 'listingHeifersLabel')}:</span> {listing.number_of_heifers ?? t('common', 'notAvailable')}
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormItem>
              <FormLabel>{t('adminOffers', 'referenceIdLabel')}</FormLabel>
              <FormControl>
                <Input
                  value={listing.listing_invitations?.reference_id || t('common', 'notAvailable')}
                  readOnly
                  className="font-mono bg-gray-100"
                />
              </FormControl>
            </FormItem>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="chalmar_beef_offer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {`${t('adminOffers', 'chalmarOfferLabel')} (R${t('adminOffers', 'offerAmountSuffix')})`}
                    </FormLabel>
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
                    <FormLabel>{t('adminOffers', 'toWeightLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'thenPenalizationLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'andFromLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'penalizationLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'percentHeifersAllowedLabel')}</FormLabel>
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
                  <FormLabel>{t('adminOffers', 'additionalHeifersPenaltyLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'offerValidDateLabel')}</FormLabel>
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
                    <FormLabel>{t('adminOffers', 'offerValidTimeLabel')}</FormLabel>
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
                      <FormLabel>{t('adminOffers', 'additionalPaymentLabel')}</FormLabel>
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
                      <FormLabel>{t('adminOffers', 'affidavitRequiredLabel')}</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{t('adminOffers', 'noteTitle')}:</strong> {t('adminOffers', 'noteDescription')}
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('adminOffers', 'cancelButton')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('adminOffers', 'submittingButton') : t('adminOffers', 'submitButton')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
