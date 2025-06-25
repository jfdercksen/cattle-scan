import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beef, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { LivestockListingDialog } from "@/components/LivestockListingDialog";
import { SellerOffersTable } from "@/components/SellerOffersTable";
import { OfferDetailsDialog } from "@/components/OfferDetailsDialog";
import { SellerLivestockDialog } from "@/components/SellerLivestockDialog";
import type { Tables } from '@/integrations/supabase/types';

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
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (needsProfileCompletion()) {
        navigate('/profile-completion');
        return;
      }
      
      if (profile && profile.role !== 'seller') {
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate, needsProfileCompletion]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
            <p className="text-gray-600">Welcome back, {profile.first_name}!</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beef className="w-5 h-5 mr-2" />
                My Livestock
              </CardTitle>
              <CardDescription>
                Manage your cattle inventory and listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => setLivestockDialogOpen(true)}>
                View Livestock
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Beef className="w-5 h-5 mr-2" />
                Add Livestock Listing
              </CardTitle>
              <CardDescription>
                Submit livestock details to sell to Chelmar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LivestockListingDialog />
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
          <SellerOffersTable 
            key={refreshOffers}
            onViewOffer={handleViewOffer} 
          />
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
