import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
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
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';

export const OfferTermsSection = ({ companyName }: { companyName?: string }) => {
  const form = useFormContext<LivestockListingFormData>();
  const { watch, setValue } = form;
  const additionalR25 = watch('additional_r25_per_calf');
  const affidavitFilePath = watch('affidavit_file_path');
  const { t } = useTranslation();
  const loadingPoints = useWatch({ control: form.control, name: 'loading_points' });
  const farmWithGln = loadingPoints?.find((point) => point?.selected_farm_has_gln);
  const hasGlnFromFarm = Boolean(farmWithGln?.selected_farm_has_gln);
  const glnNumber = farmWithGln?.selected_farm_gln_number || '';
  const glnDocumentUrl = farmWithGln?.selected_farm_gln_document_url || '';

  useEffect(() => {
    // Automatically set affidavit_required based on the additional_r25_per_calf selection.
    // This removes the need for a second switch and makes the logic clearer.
    setValue('affidavit_required', additionalR25, { shouldValidate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [additionalR25]);

  useEffect(() => {
    if (hasGlnFromFarm) {
      setValue('additional_r25_per_head', true, { shouldValidate: true });
      setValue('gln_num', glnNumber, { shouldValidate: true });
      setValue('gln_document_url', glnDocumentUrl || null, { shouldValidate: true });
    } else {
      setValue('additional_r25_per_head', false, { shouldValidate: true });
      setValue('gln_num', '', { shouldValidate: true });
      setValue('gln_document_url', null, { shouldValidate: true });
    }
  }, [hasGlnFromFarm, glnNumber, glnDocumentUrl, setValue]);

  const handleAffidavitUpload = (result: UploadResult) => {
    if (result.success && result.fileUrl) {
      setValue('affidavit_file_path', result.fileUrl, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('offerTermsSection', 'heading')}</h3>
      <div className="space-y-4">
        <Card className={hasGlnFromFarm ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {hasGlnFromFarm ? (
                <CheckCircle className="h-6 w-6 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-6 w-6 text-gray-400 mt-0.5" />
              )}
              <div className="flex-1">
                <h4 className="font-semibold text-lg mb-2">
                  {t('offerTermsSection', 'glnPremiumTitle')}
                </h4>
                {hasGlnFromFarm ? (
                  <>
                    <p className="text-green-700 mb-4">
                      {t('offerTermsSection', 'glnQualified')}
                    </p>
                    <div className="space-y-4 bg-white p-4 rounded-lg border border-green-200">
                      <div>
                        <Label className="text-sm text-gray-600">
                          {t('offerTermsSection', 'glnNumber')}
                        </Label>
                        <Input
                          value={glnNumber}
                          readOnly
                          className="bg-gray-100 cursor-not-allowed mt-1"
                        />
                      </div>
                      {glnDocumentUrl && (
                        <div>
                          <Label className="text-sm text-gray-600">
                            {t('offerTermsSection', 'glnDocument')}
                          </Label>
                          <div className="mt-1">
                            <a
                              href={glnDocumentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                              {t('offerTermsSection', 'viewDocument')}
                            </a>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {t('offerTermsSection', 'glnFromFarmNote')}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">
                      {t('offerTermsSection', 'glnNotRegistered')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t('offerTermsSection', 'addGlnToFarm')}{' '}
                      <a href="/seller-dashboard?tab=farms" className="text-blue-600 underline">
                        Farm Settings
                      </a>
                      .
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
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
