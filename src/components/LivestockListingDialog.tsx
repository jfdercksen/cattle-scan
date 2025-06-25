
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Beef } from 'lucide-react';
import { LivestockListingForm } from './LivestockListingForm';
import { useState } from 'react';

export const LivestockListingDialog = () => {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // You can add any additional success handling here
    console.log('Livestock listing submitted successfully');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Beef className="w-4 h-4 mr-2" />
          Add Livestock Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <LivestockListingForm
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
};
