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
import { calculationEngine, LivestockCalculations } from '@/lib/calculationEngine';

interface LoadingDetailsSectionProps {
  totalCattle: number;
  totalSheep: number;
}

export const LoadingDetailsSection = ({ totalCattle, totalSheep }: LoadingDetailsSectionProps) => {
  const { control } = useFormContext<LivestockListingFormData>();

  // Calculate mouthing requirements
  const mouthingRequirement = calculationEngine.calculateMouthingRequirement(totalCattle);
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

      {/* Mouthing Requirements - Only show if cattle are present */}
      {totalCattle > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mouthing Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900">
                  {mouthingRequirement.displayText}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Cattle:</span>
                  <span className="ml-2">{mouthingRequirement.totalCattle}</span>
                </div>
                <div>
                  <span className="font-medium">Required Percentage:</span>
                  <span className="ml-2">{mouthingRequirement.requiredPercentage}%</span>
                </div>
                <div>
                  <span className="font-medium">Required Count:</span>
                  <span className="ml-2 font-bold text-blue-600">{mouthingRequirement.requiredCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
