import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SignaturePad } from '@/components/SignaturePad';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';

interface SignatureSectionProps {
  signature: string | null;
  setSignature: (signature: string | null) => void;
}

export const SignatureSection = ({ signature, setSignature }: SignatureSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Digital Signature</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <SignaturePad 
            onSignatureChange={(sig) => {
              setSignature(sig);
              form.setValue('signature_data', sig || '');
            }}
            signature={signature}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name="signed_location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location of Signing</FormLabel>
                <FormControl>
                  <Input placeholder="Enter location where signed" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
