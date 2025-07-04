import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { YesNoSwitch } from '@/components/ui/YesNoSwitch';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';

export const LivestockDetailsSection = () => {
  const form = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="owner_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Owner Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter owner name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bred_or_bought"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bred or Bought</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BRED" id="bred" />
                    <Label htmlFor="bred">BRED</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BOUGHT IN" id="bought" />
                    <Label htmlFor="bought">BOUGHT IN</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weighing_location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weighing Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter weighing location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input placeholder="Enter breed" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimated_average_weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Average Weight (kg)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <h3 className="text-lg font-semibold my-4">Livestock Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="total_livestock_offered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Livestock Offered</FormLabel>
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
          name="number_of_heifers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Heifers</FormLabel>
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
      </div>

      <div className="space-y-4 mt-4">
        <FormField
          control={form.control}
          name="males_castrated"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between py-2 border-b">
                <FormLabel>Males Castrated</FormLabel>
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
          name="mothers_status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mothers Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WITH MOTHERS" id="with-mothers" />
                    <Label htmlFor="with-mothers">WITH MOTHERS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ALREADY WEANED" id="weaned" />
                    <Label htmlFor="weaned">ALREADY WEANED</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weaned_duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weaned Duration (if applicable)</FormLabel>
              <FormControl>
                <Input placeholder="Enter weaned duration" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="grazing_green_feed"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between py-2 border-b">
                <FormLabel>Grazing Green Feed</FormLabel>
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
          name="growth_implant"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between py-2 border-b">
                <FormLabel>Growth Implant</FormLabel>
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
          name="growth_implant_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Growth Implant Type (if applicable)</FormLabel>
              <FormControl>
                <Input placeholder="Enter growth implant type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
