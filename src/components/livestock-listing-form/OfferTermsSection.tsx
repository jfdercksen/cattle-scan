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

export const OfferTermsSection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const { watch, setValue } = form;
  const additionalR25 = watch('additional_r25_per_calf');
  const affidavitFilePath = watch('affidavit_file_path');

  useEffect(() => {
    // Automatically set affidavit_required based on the additional_r25_per_calf selection.
    // This removes the need for a second switch and makes the logic clearer.
    setValue('affidavit_required', additionalR25, { shouldValidate: true });
  }, [additionalR25, setValue]);

  const handleAffidavitUpload = (result: UploadResult) => {
    if (result.success && result.fileUrl) {
      setValue('affidavit_file_path', result.fileUrl, { shouldValidate: true, shouldDirty: true });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Offer Terms</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="additional_r25_per_calf"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between rounded-md border p-4 h-full">
                <FormLabel>If the entity selling the livestock has a turnover of less than R 10 million, it could mean an additional R 25 per calf payment. Apply?</FormLabel>
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
              To qualify for the additional payment, a sworn affidavit must be completed and submitted.
            </p>
            <a href="/BEE_Affidavit-EME-Gen.pdf" download className="text-blue-600 hover:underline">
              Download BEE Affidavit Form
            </a>
            <div>
              <FileUploadManager
                documentType="affidavit"
                label="Upload Completed Affidavit"
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
          <strong>Note:</strong> This offer is subject to biosecurity terms and evaluation of biosecurity and trace-ability
          assessment as well as the veterinary declaration. If Chalmar Beef is placed under quarantine before the livestock
          is offloaded, the offer is withdrawn.
        </p>
      </div>
    </div>
  );
};
