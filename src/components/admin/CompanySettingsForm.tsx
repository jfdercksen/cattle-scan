import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/i18n/useTranslation';
import { useCompany } from '@/contexts/companyContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X } from 'lucide-react';

const companySettingsSchema = z.object({
  logo_url: z.string().url().optional().nullable(),
  registered_name: z.string().min(1, 'Registered name is required'),
  registration_number: z.string().optional().nullable(),
  vat_number: z.string().optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  postal_code: z.string().optional().nullable(),
  country: z.string().default('South Africa'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  contact_person: z.string().optional().nullable(),
  disclaimer_text: z.string().min(1, 'English disclaimer is required'),
  disclaimer_text_af: z.string().min(1, 'Afrikaans disclaimer is required'),
});

type CompanySettingsFormValues = z.infer<typeof companySettingsSchema>;

interface CompanySettingsFormProps {
  companyId: string;
}

const LOGO_MAX_BYTES = 2 * 1024 * 1024;
const LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

export function CompanySettingsForm({ companyId }: CompanySettingsFormProps) {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { refreshCompanies, currentCompany, setCurrentCompany } = useCompany();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const defaultValues = useMemo(
    () => ({
      logo_url: null,
      registered_name: '',
      registration_number: '',
      vat_number: '',
      address: '',
      city: '',
      province: '',
      postal_code: '',
      country: 'South Africa',
      email: '',
      phone: '',
      contact_person: '',
      disclaimer_text: '',
      disclaimer_text_af: '',
    }),
    []
  );

  const form = useForm<CompanySettingsFormValues>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues,
  });

  const logoUrl = form.watch('logo_url');

  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!companyId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('company_settings')
          .select('*')
          .eq('company_id', companyId)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          form.reset({
            logo_url: data.logo_url,
            registered_name: data.registered_name ?? '',
            registration_number: data.registration_number ?? '',
            vat_number: data.vat_number ?? '',
            address: data.address ?? '',
            city: data.city ?? '',
            province: data.province ?? '',
            postal_code: data.postal_code ?? '',
            country: data.country ?? 'South Africa',
            email: data.email ?? '',
            phone: data.phone ?? '',
            contact_person: data.contact_person ?? '',
            disclaimer_text: data.disclaimer_text ?? '',
            disclaimer_text_af: data.disclaimer_text_af ?? '',
          });
        } else {
          form.reset(defaultValues);
        }
      } catch (error) {
        console.error('Failed to load company settings:', error);
        toast({
          title: t('common', 'errorTitle'),
          description: t('companySettings', 'loadError'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanySettings();
  }, [companyId, form, toast, t, defaultValues]);

  const uploadLogo = async (file: File) => {
    if (file.size > LOGO_MAX_BYTES) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('companySettings', 'logoSizeError'),
        variant: 'destructive',
      });
      return;
    }

    if (!LOGO_TYPES.includes(file.type)) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('companySettings', 'logoTypeError'),
        variant: 'destructive',
      });
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${companyId}/logo.${fileExt}`;
      const { error } = await supabase.storage
        .from('company-logos')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      form.setValue('logo_url', data.publicUrl, { shouldDirty: true });
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('companySettings', 'logoUploadError'),
        variant: 'destructive',
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = () => {
    form.setValue('logo_url', null, { shouldDirty: true });
  };

  const onSubmit = async (values: CompanySettingsFormValues) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert(
          {
            company_id: companyId,
            ...values,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'company_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (values.registered_name) {
        const { error: companyError } = await supabase
          .from('companies')
          .update({
            name: values.registered_name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', companyId);

        if (companyError) {
          console.error('Failed to sync company name:', companyError);
        } else {
          if (currentCompany?.companyId === companyId) {
            setCurrentCompany({
              ...currentCompany,
              companyName: values.registered_name,
            });
          }
          await refreshCompanies();
        }
      }

      toast({
        title: t('common', 'successTitle'),
        description: t('companySettings', 'saveSuccess'),
      });
    } catch (error) {
      console.error('Failed to save company settings:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('companySettings', 'saveError'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        {t('companySettings', 'saving')}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('companySettings', 'brandingSection')}</CardTitle>
            <CardDescription>{t('companySettings', 'subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormItem>
              <FormLabel>{t('companySettings', 'logoLabel')}</FormLabel>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="w-48 h-24 border rounded-md flex items-center justify-center bg-slate-50">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company logo" className="max-h-20 max-w-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400">Logo</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    ref={logoInputRef}
                    type="file"
                    accept={LOGO_TYPES.join(',')}
                    className="hidden"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        await uploadLogo(file);
                        if (logoInputRef.current) {
                          logoInputRef.current.value = '';
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {t('companySettings', 'uploadLogo')}
                  </Button>
                  {logoUrl && (
                    <Button type="button" variant="ghost" onClick={removeLogo}>
                      <X className="h-4 w-4 mr-2" />
                      {t('companySettings', 'removeLogo')}
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t('companySettings', 'logoHint')}</p>
            </FormItem>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('companySettings', 'businessSection')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="registered_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'registeredName')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'registrationNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vat_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'vatNumber')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_person"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'contactPerson')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('companySettings', 'contactSection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'address')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'city')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'province')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'postalCode')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'country')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'email')}</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('companySettings', 'phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('companySettings', 'disclaimerSection')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="disclaimer_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'disclaimerText')}</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{t('companySettings', 'disclaimerHint')}</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="disclaimer_text_af"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('companySettings', 'disclaimerTextAf')}</FormLabel>
                  <FormControl>
                    <Textarea rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {saving ? t('companySettings', 'saving') : t('companySettings', 'saveButton')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}


