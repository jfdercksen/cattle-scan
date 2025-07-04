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
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';

export const BiosecuritySection = () => {
  const form = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Supplier Identity & Location</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <FormField
          control={form.control}
          name="farm_birth_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm Birth Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm birth address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="farm_loading_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Farm Loading Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter farm loading address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
          <FormField
            control={form.control}
            name="livestock_moved_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location where livestock was moved</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location details" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
