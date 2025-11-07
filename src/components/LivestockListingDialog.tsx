import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Beef } from 'lucide-react';
import { LivestockListingForm } from './LivestockListingForm';
import { useState } from 'react';
import type { ComponentType } from 'react';
import { useTranslation } from '@/i18n/useTranslation';

export const LivestockListingDialog = () => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const LivestockListingFormComponent = LivestockListingForm as unknown as ComponentType<Partial<{ invitationId: string; referenceId: string }> & { onClose?: () => void; onSuccess?: () => void }>;

  const handleSuccess = () => {
    // You can add any additional success handling here
    console.log('Livestock listing submitted successfully');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Beef className="w-4 h-4 mr-2" />
          {t('livestockListingDialog', 'triggerLabel')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <LivestockListingFormComponent onClose={() => setOpen(false)} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
