import { useFormContext, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

interface LoadingPointsSectionProps {
  fields: FieldArrayWithId<LivestockListingFormData, 'loading_points', 'id'>[];
  append: UseFieldArrayAppend<LivestockListingFormData, 'loading_points'>;
  remove: UseFieldArrayRemove;
}

export const LoadingPointsSection = ({ fields, append, remove }: LoadingPointsSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();
  const livestockType = form.watch('livestock_type');

  const addLoadingPoint = () => {
    const birthAddress = form.getValues('farm_birth_address');
    const isSameAddress = form.getValues('is_loading_at_birth_farm');
    const loadingAddress = form.getValues('farm_loading_address');

    append({
      birth_address: birthAddress,
      is_loading_at_birth_farm: isSameAddress,
      loading_address: isSameAddress ? birthAddress : loadingAddress,
      number_of_cattle: 0,
      number_of_sheep: 0,
    });
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Loading Points</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader>
              <CardTitle>Herd {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="md:col-span-2">
                <Label>Loading address of Livestock</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 p-4 border rounded-md">
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.farm_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Farm Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.district`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">District</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.province`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Province</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(livestockType === 'CATTLE' || livestockType === 'CATTLE AND SHEEP') && (
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.number_of_cattle`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Cattle (to be loaded)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                {(livestockType === 'SHEEP' || livestockType === 'CATTLE AND SHEEP') && (
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.number_of_sheep`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Sheep (to be loaded)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => remove(index)}
              className="absolute top-4 right-4"
            >
              Remove
            </Button>
          </Card>
        ))}
      </div>
      <Button type="button" onClick={addLoadingPoint} className="mt-4">
        Add Loading Point
      </Button>
      <FormMessage>{form.formState.errors.loading_points?.message}</FormMessage>
    </div>
  );
};
