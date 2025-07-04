import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beef, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LivestockListingDialog } from "@/components/LivestockListingDialog";
import { SellerInvitationsTable } from '@/components/SellerInvitationsTable';
import { SellerOffersTable } from "@/components/SellerOffersTable";
import { OfferDetailsDialog } from "@/components/OfferDetailsDialog";
import { SellerLivestockDialog } from "@/components/SellerLivestockDialog";
import type { Tables } from '@/integrations/supabase/types';
import ProfileCompletion from '@/components/ProfileCompletionForm';

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, needsProfileCompletion } = useAuth();
  const [selectedOffer, setSelectedOffer] = useState<LivestockOffer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [livestockDialogOpen, setLivestockDialogOpen] = useState(false);
  const [refreshOffers, setRefreshOffers] = useState(0);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'seller') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewOffer = (offer: LivestockOffer) => {
    setSelectedOffer(offer);
    setOfferDialogOpen(true);
  };

  const handleOfferUpdated = () => {
    setRefreshOffers(prev => prev + 1);
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beef className="w-5 h-5 mr-2" />
                Livestock Listings
              </CardTitle>
              <CardDescription>
                Manage your livestock listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setLivestockDialogOpen(true)}>
                View Livestock Listings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>
                Your account status: {profile.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {profile.status === 'pending' && "Your account is pending approval"}
                {profile.status === 'approved' && "Your account is approved and active"}
                {profile.status === 'suspended' && "Your account has been suspended"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <SellerInvitationsTable />
        </div>

        <OfferDetailsDialog
          offer={selectedOffer}
          open={offerDialogOpen}
          onOpenChange={setOfferDialogOpen}
          onOfferUpdated={handleOfferUpdated}
        />

        <SellerLivestockDialog
          open={livestockDialogOpen}
          onOpenChange={setLivestockDialogOpen}
        />
      </div>
    </div>
  );
};

export default SellerDashboard;
