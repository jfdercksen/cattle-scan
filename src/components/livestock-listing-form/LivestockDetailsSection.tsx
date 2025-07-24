import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { useUserProfile } from '@/hooks/useUserProfile';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { defaultFieldVisibility, FormSection } from '@/lib/fieldVisibility';
import { LivestockCalculations } from '@/lib/calculationEngine';

export const LivestockDetailsSection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const { userProfile } = useUserProfile();
  const { setValue, watch, getValues } = form;
  const growthImplant = watch('growth_implant');
  const livestockType = watch('livestock_type');
  const loadingPoints = watch('loading_points') || [];

  // Calculate totals from loading points for conditional visibility
  const { totalCattle, totalSheep } = LivestockCalculations.calculateTotalLivestock(loadingPoints);
  
  // Determine if cattle or sheep fields should be shown
  const shouldShowCattleFields = livestockType === 'CATTLE' || livestockType === 'CATTLE AND SHEEP' || totalCattle > 0;
  const shouldShowSheepFields = livestockType === 'SHEEP' || livestockType === 'CATTLE AND SHEEP' || totalSheep > 0;

  useEffect(() => {
    if (userProfile?.company_name) {
      setValue('owner_name', userProfile.company_name, { shouldValidate: true });
    }
  }, [userProfile, setValue]);

  // State for the weighing location fields
  const [weighingFarmName, setWeighingFarmName] = useState('');
  const [weighingDistrict, setWeighingDistrict] = useState('');
  const [weighingProvince, setWeighingProvince] = useState('');

  // Effect to parse the weighing location from the form into separate fields
  useEffect(() => {
    const weighingLocationValue = getValues('weighing_location');
    if (weighingLocationValue && typeof weighingLocationValue === 'string') {
      const [farm, district, province] = weighingLocationValue.split('|');
      setWeighingFarmName(farm || '');
      setWeighingDistrict(district || '');
      setWeighingProvince(province || '');
    }
  }, [getValues]);

  // Effect to combine the separate weighing location fields and update the form
  useEffect(() => {
    const combinedWeighingLocation = `${weighingFarmName}|${weighingDistrict}|${weighingProvince}`;
    if (weighingFarmName || weighingDistrict || weighingProvince) {
      setValue('weighing_location', combinedWeighingLocation, { shouldValidate: true, shouldDirty: true });
    } else if (getValues('weighing_location')) {
      setValue('weighing_location', '', { shouldValidate: true, shouldDirty: true });
    }
  }, [weighingFarmName, weighingDistrict, weighingProvince, setValue, getValues]);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="livestock_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Livestock type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a livestock type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CATTLE AND SHEEP">Cattle and Sheep</SelectItem>
                  <SelectItem value="CATTLE">Cattle</SelectItem>
                  <SelectItem value="SHEEP">Sheep</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Livestock Type Indicator */}
        {livestockType && (
          <div className="md:col-span-2">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center gap-2">
                <Badge variant="default">{livestockType}</Badge>
                <span className="text-sm text-blue-800">
                  Form fields will be shown based on your livestock type selection
                </span>
              </div>
              {(totalCattle > 0 || totalSheep > 0) && (
                <div className="mt-2 text-xs text-blue-700">
                  Current totals from loading points: {totalCattle} cattle, {totalSheep} sheep
                </div>
              )}
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="bred_or_bought"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Did the owner breed or buy in the livestock?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-row space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BRED" id="bred" />
                    <Label htmlFor="bred">Bred</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BOUGHT IN" id="bought" />
                    <Label htmlFor="bought">Bought in</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />



        {/* Weighing location - Hidden for initial launch as it's redundant with loading points */}
        {defaultFieldVisibility.isFieldVisible('weighing_location', FormSection.LIVESTOCK_DETAILS) && (
          <div className="md:col-span-2">
            <Label>Where is the livestock going to be weighed?</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <FormItem>
                <FormLabel className="text-xs">Farm Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter farm name" value={weighingFarmName} onChange={(e) => setWeighingFarmName(e.target.value)} />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-xs">District</FormLabel>
                <FormControl>
                  <Input placeholder="Enter district" value={weighingDistrict} onChange={(e) => setWeighingDistrict(e.target.value)} />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-xs">Province</FormLabel>
                <FormControl>
                  <Input placeholder="Enter province" value={weighingProvince} onChange={(e) => setWeighingProvince(e.target.value)} />
                </FormControl>
              </FormItem>
            </div>
            {form.formState.errors.weighing_location && (
              <p className="text-sm font-medium text-destructive mt-2">
                {form.formState.errors.weighing_location.message?.toString()}
              </p>
            )}
          </div>
        )}

        {/* Breed - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('breed', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="breed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Breed of the livestock?</FormLabel>
                <FormControl>
                  <Input placeholder="Enter breed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Estimated weight - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('estimated_average_weight', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="estimated_average_weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated current average weight of the livestock?</FormLabel>
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
        )}
      </div>

      <h3 className="text-lg font-semibold my-4">Livestock Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="total_livestock_offered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of livestock offered</FormLabel>
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

        {/* Heifers field - Only show for cattle */}
        {shouldShowCattleFields && (
          <FormField
            control={form.control}
            name="number_of_heifers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of heifers</FormLabel>
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
        )}
      </div>

      <div className="space-y-4 mt-4">
        {/* Castration field - Only show for cattle (males typically refer to bulls/steers) */}
        {shouldShowCattleFields && (
          <FormField
            control={form.control}
            name="males_castrated"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between py-2 border-b">
                  <FormLabel>Have the males been castrated?</FormLabel>
                  <FormControl>
                    <YesNoSwitch value={field.value} onChange={field.onChange} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Weaning status - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('mothers_status', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="mothers_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Is the livestock with their mothers or have they been weaned?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-row space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="WITH MOTHERS" id="with-mothers" />
                      <Label htmlFor="with-mothers">With mothers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ALREADY WEANED" id="weaned" />
                      <Label htmlFor="weaned">Already weaned</Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Weaned duration - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('weaned_duration', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="weaned_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>If already weaned for how long?</FormLabel>
                <FormControl>
                  <Input placeholder="Enter weaned duration" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Grain feeding - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('grazing_green_feed', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="grazing_green_feed"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between py-2 border-b">
                  <FormLabel>Is the livestock grazing green feed?</FormLabel>
                  <FormControl>
                    <YesNoSwitch value={field.value} onChange={field.onChange} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Growth implant - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('growth_implant', FormSection.LIVESTOCK_DETAILS) && (
          <FormField
            control={form.control}
            name="growth_implant"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between py-2 border-b">
                  <FormLabel>Did the livestock receive a growth implant?</FormLabel>
                  <FormControl>
                    <YesNoSwitch value={field.value} onChange={field.onChange} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Growth implant type - Hidden for initial launch */}
        {defaultFieldVisibility.isFieldVisible('growth_implant_type', FormSection.LIVESTOCK_DETAILS) && growthImplant && (
          <FormField
            control={form.control}
            name="growth_implant_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>If yes which one?</FormLabel>
                <FormControl>
                  <Input placeholder="Enter growth implant type" {...field} />
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
