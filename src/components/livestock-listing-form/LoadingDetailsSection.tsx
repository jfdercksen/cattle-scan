import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';

export const LoadingDetailsSection = () => {
  const form = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Livestock Loading Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="number_cattle_loaded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Cattle Loaded</FormLabel>
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

        <FormField
          control={form.control}
          name="number_sheep_loaded"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Sheep Loaded</FormLabel>
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

        <FormField
          control={form.control}
          name="truck_registration_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Truck Registration Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter truck registration" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
