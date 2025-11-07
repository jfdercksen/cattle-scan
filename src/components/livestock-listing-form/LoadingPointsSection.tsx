import { useEffect, useState } from 'react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

const COUNTRY_OPTIONS = [
  'South Africa',
  'Botswana',
  'Namibia',
  'Zimbabwe',
  'Mozambique',
  'Lesotho',
  'Eswatini',
];

interface LoadingPointsSectionProps {
  fields: FieldArrayWithId<LivestockListingFormData, 'loading_points', 'id'>[];
  append: UseFieldArrayAppend<LivestockListingFormData, 'loading_points'>;
  remove: UseFieldArrayRemove;
}

export const LoadingPointsSection = ({ fields, append, remove }: LoadingPointsSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();
  const livestockType = form.watch('livestock_type');
  const locationManager = useLivestockLocationManager();
  const { user } = useAuth();
  const { t } = useTranslation();
  type Farm = Tables<'farms'>;
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loadingFarms, setLoadingFarms] = useState(true);

  useEffect(() => {
    const loadFarms = async () => {
      if (!user) return;
      try {
        setLoadingFarms(true);
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setFarms(data || []);
      } catch (e) {
        console.error('Failed to load farms', e);
      } finally {
        setLoadingFarms(false);
      }
    };
    loadFarms();
  }, [user]);

  const parseFarmAddress = (addr: string) => {
    const parts = addr.split('|').map(p => p.trim());
    const country = parts[4] || parts[3] || '';
    return {
      farm_name: parts[0] || '',
      district: parts[1] || '',
      province: parts[2] || '',
      country,
    };
  };

  const formatFarmAddress = (addr: string) => addr.split('|').map(p => p.trim()).filter(Boolean).join(', ');

  const handleSelectFarm = (
    herdIndex: number,
    section: 'birth_address' | 'current_address' | 'loading_address' | 'biosecurity.livestock_moved_location' | 'biosecurity.livestock_moved_location_to',
    farmId: string
  ) => {
    const farm = farms.find(f => f.id === farmId);
    if (!farm) return;
    const parsed = parseFarmAddress(farm.address);
    form.setValue(`loading_points.${herdIndex}.${section}.farm_name`, parsed.farm_name || farm.name);
    form.setValue(`loading_points.${herdIndex}.${section}.district`, parsed.district);
    form.setValue(`loading_points.${herdIndex}.${section}.province`, parsed.province);
    form.setValue(`loading_points.${herdIndex}.${section}.country`, parsed.country);
  };

  const addLoadingPoint = () => {
    append({
      birth_address: {
        farm_name: '',
        district: '',
        province: '',
        country: '',
      },
      current_address: {
        farm_name: '',
        district: '',
        province: '',
        country: '',
      },
      loading_address: {
        farm_name: '',
        district: '',
        province: '',
        country: '',
      },
      is_current_same_as_birth: false,
      is_loading_same_as_current: false,
      details: {
        livestock_type: undefined,
        bred_or_bought: undefined,
        breed: '',
        number_of_males: 0,
        number_of_females: 0,
        males_castrated: false,
        previous_owner_declaration_url: undefined,
        previous_owner_declaration_name: undefined,
      },
      biosecurity: {
        is_breeder_seller: false,
        breeder_name: undefined,
        livestock_moved_out_of_boundaries: false,
        livestock_moved_location: undefined,
        livestock_moved_location_to: undefined,
        livestock_moved_how: undefined,
        livestock_moved_year: undefined,
        livestock_moved_month: undefined,
      },
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
      <h3 className="text-lg font-semibold mb-4">{t('loadingPointsSection', 'heading')}</h3>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between pr-20">
                <CardTitle>
                  {t('loadingPointsSection', 'herdTitle').replace('{index}', String(index + 1))}
                </CardTitle>
                {index > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyFromAbove(index)}
                  >
                    {t('loadingPointsSection', 'copyFromAbove')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Per-Herd Livestock Details */}
              <div>
                <h4 className="text-base font-medium">{t('loadingPointsSection', 'herdDetailsHeading')}</h4>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.details.livestock_type`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('loadingPointsSection', 'herdLivestockTypeLabel')}</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-row space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="CATTLE" id={`herd-cattle-${index}`} />
                              <Label htmlFor={`herd-cattle-${index}`}>{t('loadingPointsSection', 'herdLivestockTypeOptionCattle')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SHEEP" id={`herd-sheep-${index}`} />
                              <Label htmlFor={`herd-sheep-${index}`}>{t('loadingPointsSection', 'herdLivestockTypeOptionSheep')}</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.details.bred_or_bought`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('loadingPointsSection', 'bredOrBoughtLabel')}</FormLabel>
                        <FormControl>
                          <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-row space-x-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="BRED" id={`bred-${index}`} />
                              <Label htmlFor={`bred-${index}`}>{t('loadingPointsSection', 'bredOption')}</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="BOUGHT IN" id={`bought-${index}`} />
                              <Label htmlFor={`bought-${index}`}>{t('loadingPointsSection', 'boughtOption')}</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch(`loading_points.${index}.details.bred_or_bought`) === 'BOUGHT IN' && (
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name={`loading_points.${index}.details.previous_owner_declaration_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('loadingPointsSection', 'declarationLabel')}</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={async (event) => {
                                  const file = event.target.files?.[0];
                                  if (!file) {
                                    form.setValue(`loading_points.${index}.details.previous_owner_declaration_url`, undefined, { shouldValidate: true });
                                    form.setValue(`loading_points.${index}.details.previous_owner_declaration_name`, undefined, { shouldValidate: true });
                                    return;
                                  }

                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `previous-owner-declaration-${index}-${Date.now()}.${fileExt}`;
                                  const filePath = `previous-owner-declarations/${fileName}`;

                                  const { error: uploadError } = await supabase.storage
                                    .from('listing-documents')
                                    .upload(filePath, file, { upsert: true, cacheControl: '3600' });

                                  if (uploadError) {
                                    console.error('Upload error', uploadError);
                                    form.setValue(`loading_points.${index}.details.previous_owner_declaration_url`, undefined, { shouldValidate: true });
                                    form.setValue(`loading_points.${index}.details.previous_owner_declaration_name`, undefined, { shouldValidate: true });
                                    return;
                                  }

                                  const { data: publicUrlData } = supabase.storage
                                    .from('listing-documents')
                                    .getPublicUrl(filePath);

                                  form.setValue(`loading_points.${index}.details.previous_owner_declaration_url`, publicUrlData?.publicUrl || undefined, { shouldValidate: true });
                                  form.setValue(`loading_points.${index}.details.previous_owner_declaration_name`, file.name, { shouldValidate: true });
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch(`loading_points.${index}.details.previous_owner_declaration_url`) && (
                        <div className="text-sm">
                          <strong>{t('loadingPointsSection', 'uploadedLabel')}</strong> {form.watch(`loading_points.${index}.details.previous_owner_declaration_name`)}
                        </div>
                      )}
                    </div>
                  )}

                  
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.biosecurity.is_breeder_seller`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border p-2 h-full">
                          <FormLabel>{t('loadingPointsSection', 'breederSellerQuestion')}</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!form.watch(`loading_points.${index}.biosecurity.is_breeder_seller`) && (
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.biosecurity.breeder_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('loadingPointsSection', 'breederNameLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'breederNamePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.details.breed`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('loadingPointsSection', 'breedLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('loadingPointsSection', 'breedPlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.details.number_of_males`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('loadingPointsSection', 'malesLabel')}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.details.number_of_females`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('loadingPointsSection', 'femalesLabel')}</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 mt-4">
                  {(livestockType === 'CATTLE' || livestockType === 'CATTLE AND SHEEP') && (
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.details.males_castrated`}
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center justify-between py-2 border-b">
                            <FormLabel>{t('loadingPointsSection', 'castratedQuestion')}</FormLabel>
                            <FormControl>
                              <YesNoSwitch value={field.value} onChange={field.onChange} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>


              {/* Birth Address Section */}
              <div>
                <Label className="text-base font-medium">{t('loadingPointsSection', 'birthAddressHeading')}</Label>
                {farms.length > 0 && (
                  <div className="mt-2">
                    <Label className="text-xs">{t('loadingPointsSection', 'useSavedFarmLabel')}</Label>
                    <div className="mt-1 w-full md:w-96">
                      <Select onValueChange={(val) => handleSelectFarm(index, 'birth_address', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingFarms ? t('loadingPointsSection', 'savedFarmPlaceholderLoading') : t('loadingPointsSection', 'savedFarmPlaceholderSelect')} />
                        </SelectTrigger>
                        <SelectContent>
                          {farms.map((f) => (
                            <SelectItem key={f.id} value={f.id}>{f.name} — {formatFarmAddress(f.address)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2 p-4 border rounded-md bg-blue-50">
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.farm_name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('loadingPointsSection', 'farmNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('loadingPointsSection', 'farmNamePlaceholder')} {...field} />
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
                        <FormLabel className="text-xs">{t('loadingPointsSection', 'districtLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('loadingPointsSection', 'districtPlaceholder')} {...field} />
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
                        <FormLabel className="text-xs">{t('loadingPointsSection', 'provinceLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('loadingPointsSection', 'provincePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.birth_address.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('loadingPointsSection', 'countryLabel')}</FormLabel>
                        <FormControl>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('loadingPointsSection', 'countryPlaceholder')} />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRY_OPTIONS.map((country) => (
                                <SelectItem key={country} value={country}>
                                  {country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
                  <Label className="text-base font-medium">{t('loadingPointsSection', 'currentAddressHeading')}</Label>
                </div>
                <FormField
                  control={form.control}
                  name={`loading_points.${index}.is_current_same_as_birth`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-md border p-2 mb-2">
                        <FormLabel className="text-sm">{t('loadingPointsSection', 'currentSameAsBirthLabel')}</FormLabel>
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
                    {farms.length > 0 && (
                      <div className="md:col-span-4">
                        <Label className="text-xs">{t('loadingPointsSection', 'useSavedFarmLabel')}</Label>
                        <div className="mt-1 w-full md:w-96">
                          <Select onValueChange={(val) => handleSelectFarm(index, 'current_address', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingFarms ? t('loadingPointsSection', 'savedFarmPlaceholderLoading') : t('loadingPointsSection', 'savedFarmPlaceholderSelect')} />
                            </SelectTrigger>
                            <SelectContent>
                              {farms.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.name} — {formatFarmAddress(f.address)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.current_address.farm_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'farmNameLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'farmNamePlaceholder')} {...field} />
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
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'districtLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'districtPlaceholder')} {...field} />
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
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'provinceLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'provincePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.current_address.country`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'countryLabel')}</FormLabel>
                          <FormControl>
                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('loadingPointsSection', 'countryPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRY_OPTIONS.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                  <Label className="text-base font-medium">{t('loadingPointsSection', 'loadingAddressHeading')}</Label>
                </div>
                <FormField
                  control={form.control}
                  name={`loading_points.${index}.is_loading_same_as_current`}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between rounded-md border p-2 mb-2">
                        <FormLabel className="text-sm">{t('loadingPointsSection', 'loadingSameAsCurrentLabel')}</FormLabel>
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
                    {farms.length > 0 && (
                      <div className="md:col-span-4">
                        <Label className="text-xs">{t('loadingPointsSection', 'useSavedFarmLabel')}</Label>
                        <div className="mt-1 w-full md:w-96">
                          <Select onValueChange={(val) => handleSelectFarm(index, 'loading_address', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingFarms ? t('loadingPointsSection', 'savedFarmPlaceholderLoading') : t('loadingPointsSection', 'savedFarmPlaceholderSelect')} />
                            </SelectTrigger>
                            <SelectContent>
                              {farms.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.name} — {formatFarmAddress(f.address)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.loading_address.farm_name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'farmNameLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'farmNamePlaceholder')} {...field} />
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
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'districtLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'districtPlaceholder')} {...field} />
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
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'provinceLabel')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('loadingPointsSection', 'provincePlaceholder')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`loading_points.${index}.loading_address.country`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">{t('loadingPointsSection', 'countryLabel')}</FormLabel>
                          <FormControl>
                            <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue placeholder={t('loadingPointsSection', 'countryPlaceholder')} />
                              </SelectTrigger>
                              <SelectContent>
                                {COUNTRY_OPTIONS.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              <Separator />

              {/* Per-Herd Biosecurity Details */}
              <div>
                <h4 className="text-base font-medium">{t('loadingPointsSection', 'herdBiosecurityHeading')}</h4>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`loading_points.${index}.biosecurity.livestock_moved_out_of_boundaries`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-md border p-2 h-full">
                          <FormLabel>{t('loadingPointsSection', 'movedOutQuestion')}</FormLabel>
                          <FormControl>
                            <YesNoSwitch value={field.value} onChange={field.onChange} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`loading_points.${index}.biosecurity.livestock_moved_out_of_boundaries`) && (
                  <div className="mt-4">
                    <Label>{t('loadingPointsSection', 'movedFromLabel')}</Label>
                    {farms.length > 0 && (
                      <div className="mt-2">
                        <Label className="text-xs">{t('loadingPointsSection', 'useSavedFarmLabel')}</Label>
                        <div className="mt-1 w-full md:w-96">
                          <Select onValueChange={(val) => handleSelectFarm(index, 'biosecurity.livestock_moved_location', val)}>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingFarms ? t('loadingPointsSection', 'savedFarmPlaceholderLoading') : t('loadingPointsSection', 'savedFarmPlaceholderSelect')} />
                            </SelectTrigger>
                            <SelectContent>
                              {farms.map((f) => (
                                <SelectItem key={f.id} value={f.id}>{f.name} — {formatFarmAddress(f.address)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                      <FormField
                        control={form.control}
                        name={`loading_points.${index}.biosecurity.livestock_moved_location.farm_name`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('loadingPointsSection', 'farmNameLabel')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('loadingPointsSection', 'farmNamePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`loading_points.${index}.biosecurity.livestock_moved_location.district`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('loadingPointsSection', 'districtLabel')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('loadingPointsSection', 'districtPlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`loading_points.${index}.biosecurity.livestock_moved_location.province`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('loadingPointsSection', 'provinceLabel')}</FormLabel>
                            <FormControl>
                              <Input placeholder={t('loadingPointsSection', 'provincePlaceholder')} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`loading_points.${index}.biosecurity.livestock_moved_location.country`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">{t('loadingPointsSection', 'countryLabel')}</FormLabel>
                            <FormControl>
                              <Select value={field.value || undefined} onValueChange={field.onChange}>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('loadingPointsSection', 'countryPlaceholder')} />
                                </SelectTrigger>
                                <SelectContent>
                                  {COUNTRY_OPTIONS.map((country) => (
                                    <SelectItem key={country} value={country}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <Label>{t('loadingPointsSection', 'movedToLabel')}</Label>
                      {farms.length > 0 && (
                        <div className="mt-2">
                          <Label className="text-xs">{t('loadingPointsSection', 'useSavedFarmLabel')}</Label>
                          <div className="mt-1 w-full md:w-96">
                            <Select onValueChange={(val) => handleSelectFarm(index, 'biosecurity.livestock_moved_location_to', val)}>
                              <SelectTrigger>
                                <SelectValue placeholder={loadingFarms ? t('loadingPointsSection', 'savedFarmPlaceholderLoading') : t('loadingPointsSection', 'savedFarmPlaceholderSelect')} />
                              </SelectTrigger>
                              <SelectContent>
                                {farms.map((f) => (
                                  <SelectItem key={f.id} value={f.id}>{f.name} — {formatFarmAddress(f.address)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_location_to.farm_name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'farmNameLabel')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('loadingPointsSection', 'farmNamePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_location_to.district`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'districtLabel')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('loadingPointsSection', 'districtPlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_location_to.province`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'provinceLabel')}</FormLabel>
                              <FormControl>
                                <Input placeholder={t('loadingPointsSection', 'provincePlaceholder')} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_location_to.country`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'countryLabel')}</FormLabel>
                              <FormControl>
                                <Select value={field.value || undefined} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('loadingPointsSection', 'countryPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {COUNTRY_OPTIONS.map((country) => (
                                      <SelectItem key={country} value={country}>
                                        {country}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label>{t('loadingPointsSection', 'movedWhenLabel')}</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_year`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'movedYearLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t('loadingPointsSection', 'movedYearPlaceholder')}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_month`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">{t('loadingPointsSection', 'movedMonthLabel')}</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder={t('loadingPointsSection', 'movedMonthPlaceholder')}
                                  value={field.value ?? ''}
                                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={form.control}
                          name={`loading_points.${index}.biosecurity.livestock_moved_how`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{t('loadingPointsSection', 'movedHowLabel')}</FormLabel>
                              <FormControl>
                                <Select value={field.value} onValueChange={field.onChange}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('loadingPointsSection', 'movedHowPlaceholder')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Transport Contractor">{t('loadingPointsSection', 'movedHowOptionContractor')}</SelectItem>
                                    <SelectItem value="Own Truck">{t('loadingPointsSection', 'movedHowOptionOwnTruck')}</SelectItem>
                                    <SelectItem value="On Foot">{t('loadingPointsSection', 'movedHowOptionOnFoot')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
                {t('loadingPointsSection', 'removeButton')}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mt-4">
        <Button type="button" onClick={addLoadingPoint}>
          {t('loadingPointsSection', 'addAnotherButton')}
        </Button>
      </div>

      <FormMessage>{form.formState.errors.loading_points?.message}</FormMessage>
    </div>
  );
};
