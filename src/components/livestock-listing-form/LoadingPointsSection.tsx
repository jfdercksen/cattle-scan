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

export const LoadingPointsSection = () => {
  const form = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Loading Points</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((point) => (
          <div key={point} className="space-y-2">
            <FormField
              control={form.control}
              name={`loading_points_${point}` as keyof LivestockListingFormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point {point}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      value={field.value as number}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`livestock_at_loading_point_${point}` as keyof LivestockListingFormData}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Livestock at Point {point}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      value={field.value as number}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
