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

interface SignatureSectionProps {
  signature: string | null;
  setSignature: (signature: string | null) => void;
}

export const SignatureSection = ({ signature, setSignature }: SignatureSectionProps) => {
  const form = useFormContext<LivestockListingFormData>();
  const { toast } = useToast();

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      toast({ title: 'Getting Location...', description: 'Please wait while we pinpoint your location.' });

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          navigator.geolocation.clearWatch(watchId);
          const { latitude, longitude } = position.coords;
          const locationString = `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`;
          form.setValue('signed_location', locationString, { shouldValidate: true });
          toast({ title: 'Success', description: 'Location captured successfully.' });
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);
          console.error('Geolocation error:', error);
          let errorMessage = 'Could not get location. Please enter it manually.';
          if (error.code === 1) {
            errorMessage = 'Please allow location access in your browser settings.';
          } else if (error.code === 2) {
            errorMessage = 'Location is unavailable. Please check your network connection or try again from a different location.';
          } else if (error.code === 3) {
            errorMessage = 'Getting location timed out. Please try again.';
          }
          toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        },
        options
      );
    } else {
      toast({ title: 'Error', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
    }
  };

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
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="Enter location or get GPS" {...field} />
                  </FormControl>
                  <Button type="button" variant="outline" onClick={handleGetLocation}>Get Location</Button>
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
