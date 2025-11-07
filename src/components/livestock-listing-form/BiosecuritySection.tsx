import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { YesNoSwitch } from '@/components/ui/YesNoSwitch';
import { useUserProfile } from '@/hooks/useUserProfile';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/i18n/useTranslation';

export const BiosecuritySection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const { userProfile } = useUserProfile();
  const { t } = useTranslation();

  const isBreederSeller = form.watch('is_breeder_seller');
  const { setValue } = form;

  useEffect(() => {
    if (isBreederSeller && userProfile) {
      const fullName = `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim();
      setValue('breeder_name', fullName, { shouldValidate: true });
    } else if (!isBreederSeller) {
      setValue('breeder_name', '', { shouldValidate: true });
    }
  }, [isBreederSeller, userProfile, setValue]);



  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('biosecuritySection', 'heading')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="is_breeder_seller"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>{t('biosecuritySection', 'breederSellerLabel')}</FormLabel>
                <FormControl>
                  <YesNoSwitch value={field.value} onChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isBreederSeller && (
          <FormField
            control={form.control}
            name="breeder_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('biosecuritySection', 'breederNameLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('biosecuritySection', 'breederNamePlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}



        <FormField
          control={form.control}
          name="livestock_moved_out_of_boundaries"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>{t('biosecuritySection', 'movedOutLabel')}</FormLabel>
                <FormControl>
                  <YesNoSwitch value={field.value} onChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.watch('livestock_moved_out_of_boundaries') && (
          <div className="md:col-span-2">
            <Label>{t('biosecuritySection', 'movedFromHeading')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="livestock_moved_location.farm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'farmNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'farmNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="livestock_moved_location.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'districtLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'districtPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="livestock_moved_location.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'provinceLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'provincePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="mt-4">
            <Label>{t('biosecuritySection', 'movedToHeading')}</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="livestock_moved_location_to.farm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'farmNameLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'farmNamePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="livestock_moved_location_to.district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'districtLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'districtPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="livestock_moved_location_to.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'provinceLabel')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('biosecuritySection', 'provincePlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
            </div>

            <div className="mt-4">
              <Label>{t('biosecuritySection', 'movedWhenHeading')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="livestock_moved_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'yearLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('biosecuritySection', 'yearPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="livestock_moved_month"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">{t('biosecuritySection', 'monthLabel')}</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={t('biosecuritySection', 'monthPlaceholder')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
