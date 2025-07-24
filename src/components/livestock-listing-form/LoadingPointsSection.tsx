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
import { YesNoSwitch } from '@/components/ui/YesNoSwitch';
import { useLivestockLocationManager } from './LivestockLocationManager';

interface LoadingPointsSectionProps {
  fields: FieldArrayWithId<LivestockListingFormData, 'loading_points', 'id'>[];
  append: UseFieldArrayAppend<LivestockListingFormData, 'loading_points'>;
  remove: UseFieldArrayRemove;
}

export const LoadingPointsSection = ({ fields, append, remove }: LoadingPointsSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();
  const livestockType = form.watch('livestock_type');
  const locationManager = useLivestockLocationManager();

  const addLoadingPoint = () => {
    append({
      birth_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      current_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      loading_address: {
        farm_name: '',
        district: '',
        province: '',
      },
      is_current_same_as_birth: false,
      is_loading_same_as_current: false,
      number_of_cattle: 0,
      number_of_sheep: 0,
    });
  };

  const copyFromAbove = (targetIndex: number) => {
    if (targetIndex > 0) {
      // Copy all location data from the previous herd (targetIndex - 1) to the current herd
      locationManager.copyLocationData(targetIndex, 'from_herd', targetIndex - 1);
    }
  };

  const copyBirthToCurrent = (herdIndex: number) => {
    locationManager.copyLocationData(herdIndex, 'birth_to_current');
  };

  const copyCurrentToLoading = (herdIndex: number) => {
    locationManager.copyLocationData(herdIndex, 'current_to_loading');
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Livestock Location & Loading Points</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between pr-20">
                <CardTitle>Herd {index + 1}</CardTitle>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyFromAbove(index)}
                  >
                    Complete From Above
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Birth Address Section */}
              <div>
                <Label className="text-base font-medium">Birth Address - Where was the livestock born?</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md bg-blue-50">
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.farm_name`}
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
                    name={`loading_points.${index}.birth_address.district`}
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
                    name={`loading_points.${index}.birth_address.province`}
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

              {/* Current Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Current Address - Where is the livestock currently located?</Label>
                </div>
                <FormField
                  control={form.control}
                  name={`loading_points.${index}.is_current_same_as_birth`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-md border p-2 mb-2">
                        <FormLabel className="text-sm">Current location is the same as birth address</FormLabel>
                        <FormControl>
                          <YesNoSwitch value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch(`loading_points.${index}.is_current_same_as_birth`) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md bg-yellow-50">
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.current_address.farm_name`}
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
                      name={`loading_points.${index}.current_address.district`}
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
                      name={`loading_points.${index}.current_address.province`}
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
                )}
              </div>

              {/* Loading Address Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base font-medium">Loading Address - Where will the livestock be loaded?</Label>
                </div>
                <FormField
                  control={form.control}
                  name={`loading_points.${index}.is_loading_same_as_current`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-md border p-2 mb-2">
                        <FormLabel className="text-sm">Loading location is the same as current address</FormLabel>
                        <FormControl>
                          <YesNoSwitch value={field.value} onChange={field.onChange} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!form.watch(`loading_points.${index}.is_loading_same_as_current`) && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md bg-green-50">
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.loading_address.farm_name`}
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
                      name={`loading_points.${index}.loading_address.district`}
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
                      name={`loading_points.${index}.loading_address.province`}
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
                )}
              </div>

              <Separator />

              {/* Livestock Numbers Section */}
              <div>
                <Label className="text-base font-medium">Number of livestock to be loaded from this location</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {(livestockType === 'CATTLE' || livestockType === 'CATTLE AND SHEEP') && (
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.number_of_cattle`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Cattle</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
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
                          <FormLabel>Number of Sheep</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>
            </CardContent>

            {fields.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
                className="absolute top-6 right-4"
              >
                Remove
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={addLoadingPoint}>
          Add Another Herd
        </Button>
      </div>

      <FormMessage>{form.formState.errors.loading_points?.message}</FormMessage>
    </div>
  );
};
