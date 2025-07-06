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

export const BiosecuritySection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const { userProfile } = useUserProfile();

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
      <h3 className="text-lg font-semibold mb-4">Supplier Identity & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="is_breeder_seller"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>Is the breeder the seller?</FormLabel>
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
                <FormLabel>Breeder Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter breeder name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="md:col-span-2">
          <Label>Farm Birth Address</Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <FormField
              control={form.control}
              name="farm_birth_address.farm_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Farm Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter farm name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farm_birth_address.district"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">District</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter district" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="farm_birth_address.province"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Province</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter province" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="is_loading_at_birth_farm"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>Is the livestock being loaded on the farm of birth?</FormLabel>
                <FormControl>
                  <YesNoSwitch value={field.value} onChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {!form.watch('is_loading_at_birth_farm') && (
          <div className="md:col-span-2">
            <Label>Farm Loading Address</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <FormField
                control={form.control}
                name="farm_loading_address.farm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Farm Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farm name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="farm_loading_address.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">District</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter district" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="farm_loading_address.province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter province" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="livestock_moved_out_of_boundaries"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>Has livestock been moved out of property boundaries?</FormLabel>
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
            <Label>Location where livestock was moved</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="livestock_moved_location.farm_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Farm Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter farm name" {...field} />
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
                      <FormLabel className="text-xs">District</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter district" {...field} />
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
                      <FormLabel className="text-xs">Province</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter province" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="mt-4">
              <Label>When was the livestock moved there?</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <FormField
                  control={form.control}
                  name="livestock_moved_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Year</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter year" {...field} />
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
                      <FormLabel className="text-xs">Month</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter month" {...field} />
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
