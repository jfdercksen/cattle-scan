import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Beef, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { LivestockListingDialog } from "@/components/LivestockListingDialog";
import { SellerInvitationsTable } from '@/components/SellerInvitationsTable';
// import { SellerOffersTable } from "@/components/SellerOffersTable";
// import { OfferDetailsDialog } from "@/components/OfferDetailsDialog";
// import { SellerLivestockDialog } from "@/components/SellerLivestockDialog";
import type { Tables } from '@/integrations/supabase/types';
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSection from "@/components/ProfileSection";
import { supabase } from '@/integrations/supabase/client';

type Profile = Tables<'profiles'>;

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else if (!authLoading) {
      setProfileLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'seller') {
      navigate('/');
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  const needsProfileCompletion = () => {
    if (!profile) return true;
    return !profile.first_name || !profile.last_name || !profile.company_name || !profile.phone;
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (user && needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard">
            <div className="space-y-6 mt-4">
              <SellerInvitationsTable />
            </div>

            {/* <OfferDetailsDialog
              offer={selectedOffer}
              open={offerDialogOpen}
              onOpenChange={setOfferDialogOpen}
              onOfferUpdated={handleOfferUpdated}
            />

            <SellerLivestockDialog
              open={livestockDialogOpen}
              onOpenChange={setLivestockDialogOpen}
            /> */}
          </TabsContent>
          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SellerDashboard;
