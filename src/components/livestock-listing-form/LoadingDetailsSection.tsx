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

interface LoadingDetailsSectionProps {
  totalCattle: number;
  totalSheep: number;
}

export const LoadingDetailsSection = ({ totalCattle, totalSheep }: LoadingDetailsSectionProps) => {
  const { control } = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Livestock Loading Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormItem>
          <FormLabel>Number of Cattle Loaded</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={totalCattle}
              readOnly
              className="bg-gray-100"
            />
          </FormControl>
        </FormItem>

        <FormItem>
          <FormLabel>Number of Sheep Loaded</FormLabel>
          <FormControl>
            <Input
              type="number"
              value={totalSheep}
              readOnly
              className="bg-gray-100"
            />
          </FormControl>
        </FormItem>

        <FormField
          control={control}
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
