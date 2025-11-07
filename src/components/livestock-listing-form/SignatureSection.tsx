import { useFormContext } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { SignaturePad } from '@/components/SignaturePad';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { useTranslation } from '@/i18n/useTranslation';

interface SignatureSectionProps {
  signature: string | null;
  setSignature: (signature: string | null) => void;
  onLocationCapture?: (location: string) => void;
  disableLocationCapture?: boolean;
}

export const SignatureSection = ({ signature, setSignature, onLocationCapture, disableLocationCapture = false }: SignatureSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleGetLocation = () => {
    if (disableLocationCapture) return;
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      toast({
        title: t('signatureSection', 'locationFetchingTitle'),
        description: t('signatureSection', 'locationFetchingDescription'),
      });

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          navigator.geolocation.clearWatch(watchId);
          const { latitude, longitude } = position.coords;
          const locationString = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          form.setValue('signed_location', locationString, { shouldValidate: true });
          onLocationCapture?.(locationString);
          toast({
            title: t('common', 'successTitle'),
            description: t('signatureSection', 'locationSuccessDescription'),
          });
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);
          console.error('Geolocation error:', error);
          let errorMessage = t('signatureSection', 'locationErrorDefault');
          if (error.code === 1) {
            errorMessage = t('signatureSection', 'locationErrorPermission');
          } else if (error.code === 2) {
            errorMessage = t('signatureSection', 'locationErrorUnavailable');
          } else if (error.code === 3) {
            errorMessage = t('signatureSection', 'locationErrorTimeout');
          }
          toast({ title: t('common', 'errorTitle'), description: errorMessage, variant: 'destructive' });
        },
        options
      );
    } else {
      toast({
        title: t('common', 'errorTitle'),
        description: t('signatureSection', 'geolocationUnsupportedDescription'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('signatureSection', 'heading')}</h3>
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
                <FormLabel>{t('signatureSection', 'locationLabel')}</FormLabel>
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder={t('signatureSection', 'locationPlaceholder')} {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGetLocation}
                    disabled={disableLocationCapture}
                  >
                    {t('signatureSection', 'getLocationButton')}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
};
