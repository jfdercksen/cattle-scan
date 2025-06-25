
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SellerLivestockTable } from './SellerLivestockTable';
import { LivestockListingDetailsDialog } from './LivestockListingDetailsDialog';
import { LivestockListingForm } from './LivestockListingForm';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

interface SellerLivestockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SellerLivestockDialog = ({ open, onOpenChange }: SellerLivestockDialogProps) => {
  const [selectedListing, setSelectedListing] = useState<LivestockListing | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleViewListing = (listing: LivestockListing) => {
    setSelectedListing(listing);
    setDetailsDialogOpen(true);
  };

  const handleEditListing = (listing: LivestockListing) => {
    setSelectedListing(listing);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedListing(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Livestock Listings</DialogTitle>
          </DialogHeader>
          
          <SellerLivestockTable 
            key={refreshKey}
            onViewListing={handleViewListing}
            onEditListing={handleEditListing}
          />
        </DialogContent>
      </Dialog>

      <LivestockListingDetailsDialog
        listing={selectedListing}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <LivestockListingForm
            listing={selectedListing}
            onClose={() => setEditDialogOpen(false)}
            onSuccess={handleEditSuccess}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
