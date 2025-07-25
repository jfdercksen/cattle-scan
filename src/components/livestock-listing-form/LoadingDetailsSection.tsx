import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { LivestockCalculations } from '@/lib/calculationEngine';

interface LoadingDetailsSectionProps {
  totalCattle: number;
  totalSheep: number;
}

export const LoadingDetailsSection = ({ totalCattle, totalSheep }: LoadingDetailsSectionProps) => {
  const { control } = useFormContext<LivestockListingFormData>();

  // Calculate mouthing requirements
  const livestockType = LivestockCalculations.determineLivestockType(totalCattle, totalSheep);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Livestock Loading Details</h3>
      
      {/* Livestock Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Livestock Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <FormLabel>Number of Cattle Loaded</FormLabel>
              <Input
                type="number"
                value={totalCattle}
                readOnly
                className="bg-gray-100 mt-1"
              />
            </div>

            <div>
              <FormLabel>Number of Sheep Loaded</FormLabel>
              <Input
                type="number"
                value={totalSheep}
                readOnly
                className="bg-gray-100 mt-1"
              />
            </div>

            <div>
              <FormLabel>Livestock Type</FormLabel>
              <div className="mt-1">
                <Badge variant={livestockType ? "default" : "secondary"}>
                  {livestockType || "No livestock specified"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transportation Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Transportation Details</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
