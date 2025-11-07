import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { YesNoSwitch } from '@/components/ui/YesNoSwitch';
import { Input } from '@/components/ui/input';
import FileUploadManager, { type UploadResult } from '@/components/FileUploadManager';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { useTranslation } from '@/i18n/useTranslation';

export const OfferTermsSection = ({ companyName }: { companyName?: string }) => {
  const form = useFormContext<LivestockListingFormData>();
  const { watch, setValue } = form;
  const additionalR25 = watch('additional_r25_per_calf');
  const affidavitFilePath = watch('affidavit_file_path');
  const additionalR25PerHead = watch('additional_r25_per_head');
  const glnDocumentUrl = watch('gln_document_url');
  const { t } = useTranslation();

  useEffect(() => {
    // Automatically set affidavit_required based on the additional_r25_per_calf selection.
    // This removes the need for a second switch and makes the logic clearer.
    setValue('affidavit_required', additionalR25, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalR25]);

  const handleAffidavitUpload = (result: UploadResult) => {
    if (result.success && result.fileUrl) {
      setValue('affidavit_file_path', result.fileUrl, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('offerTermsSection', 'heading')}</h3>
      <div className="space-y-4">
      <FormField
          control={form.control}
          name="additional_r25_per_head"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>
                  {t('offerTermsSection', 'glnSwitchLabel').replace(
                    '{entity}',
                    t('offerTermsSection', 'entityTerm').toUpperCase()
                  ).replace('ENTITY', t('offerTermsSection', 'entityTerm').toUpperCase())}
                </FormLabel>
                <FormControl>
                  <YesNoSwitch value={field.value} onChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {additionalR25PerHead && (
          <div className="space-y-3 rounded-md border p-4">
            <p className="text-sm text-gray-700">
              {t('offerTermsSection', 'glnInfo')}
            </p>
            <FormField
              control={form.control}
              name="gln_num"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('offerTermsSection', 'glnNumberLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('offerTermsSection', 'glnNumberPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gln_document_url"
              render={() => (
                <FormItem>
                  <FormLabel>{t('offerTermsSection', 'glnDocumentLabel')}</FormLabel>
                  <FileUploadManager
                    documentType="gln_document"
                    label={t('offerTermsSection', 'glnUploadLabel')}
                    required
                    accept="image/*,application/pdf"
                    onUploadComplete={(result) => {
                      if (result.success && result.fileUrl) {
                        setValue('gln_document_url', result.fileUrl, { shouldValidate: true, shouldDirty: true });
                      }
                    }}
                    onRemove={() => setValue('gln_document_url', null, { shouldValidate: true, shouldDirty: true })}
                    currentFileUrl={glnDocumentUrl || undefined}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        <FormField
          control={form.control}
          name="additional_r25_per_calf"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>
                  {t('offerTermsSection', 'turnoverSwitchLabel').replace(
                    '{entity}',
                    t('offerTermsSection', 'entityTerm')
                  )}
                </FormLabel>
                <FormControl>
                  <YesNoSwitch value={field.value} onChange={field.onChange} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {additionalR25 && (
          <div className="space-y-2 rounded-md border p-4">
            <p className="text-sm text-gray-700">
              {t('offerTermsSection', 'affidavitInfo')}
            </p>
            <a href="/BEE_Affidavit-EME-Gen.pdf" download className="text-blue-600 hover:underline">
              {t('offerTermsSection', 'affidavitDownloadLabel')}
            </a>
            <div>
              <FileUploadManager
                documentType="affidavit"
                label={t('offerTermsSection', 'affidavitUploadLabel')}
                required={true}
                accept="application/pdf,image/*"
                onUploadComplete={handleAffidavitUpload}
                currentFileUrl={affidavitFilePath || undefined}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mt-4">
        <p className="text-sm text-blue-800">
          <strong>{t('offerTermsSection', 'noteTitle')}</strong>{' '}
          {t('offerTermsSection', 'noteDescription').replace(
            '{company}',
            companyName || t('offerTermsSection', 'defaultCompanyName')
          )}
        </p>
      </div>
    </div>
  );
};
