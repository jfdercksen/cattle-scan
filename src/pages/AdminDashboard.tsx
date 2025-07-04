import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Clock, CheckCircle, Ban, Settings, Activity, BarChart3, ArrowRight, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { AdminOfferDetailsDialog } from "@/components/AdminOfferDetailsDialog";
import { ListingInvitationForm } from '@/components/ListingInvitationForm';
import { ListingInvitationsTable } from '@/components/ListingInvitationsTable';
import ProfileSection from "@/components/ProfileSection";
import { LivestockListingsTable } from "@/components/LivestockListingsTable";
import { LivestockListingDetailsDialog } from "@/components/LivestockListingDetailsDialog";
import { AdminOffersTable } from "@/components/AdminOffersTable";

type Profile = Tables<'profiles'>;

type ListingInvitation = {
  id: string;
  reference_id: string;
  seller_email: string | null;
  status: string;
  created_at: string;
  company_name: string | null;
  seller_profile_email: string | null;
};
type LivestockListing = Tables<'livestock_listings'> & {
  listing_invitations: {
    reference_id: string;
  } | null;
};
type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedListing, setSelectedListing] = useState<LivestockListing | null>(null);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<LivestockOffer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [invitations, setInvitations] = useState<ListingInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);

  const fetchProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to load user profiles",
        variant: "destructive"
      });
    } finally {
      setLoadingProfiles(false);
    }
  }, [toast]);

  const fetchInvitations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('detailed_listing_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setInvitations((data as ListingInvitation[]) || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({ title: 'Error', description: 'Failed to load invitations.', variant: 'destructive' });
    } finally {
      setLoadingInvitations(false);
    }
  }, [toast]);

  useEffect(() => {
    if (loading) {
      return; // Wait until the auth state is fully resolved.
    }

    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile) {
      if (!['super_admin', 'admin'].includes(profile.role) || profile.status !== 'approved') {
        navigate('/');
      } else {
        // User is authenticated and authorized, so fetch data.
        fetchProfiles();
        fetchInvitations();
      }
    }
    // If profile is not yet loaded, the loading guard will keep the user on the loading screen.
  }, [user, profile, loading, navigate, fetchProfiles, fetchInvitations]);

  // This is the key change. We now explicitly wait for the `loading` flag from `useAuth` to be false
  // and for the `profile` to be available. This prevents the component from getting stuck.
  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-lg font-semibold text-slate-700">Loading Dashboard...</p>
          <p className="text-sm text-slate-500">Verifying credentials and loading data.</p>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewListing = (listing: LivestockListing) => {
    setSelectedListing(listing);
    setListingDialogOpen(true);
  };

  const handleViewOffer = (offer: LivestockOffer) => {
    setSelectedOffer(offer);
    setOfferDialogOpen(true);
  };

  if (loading || loadingProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const approvedProfiles = profiles.filter(p => p.status === 'approved');
  const rejectedProfiles = profiles.filter(p => p.status === 'rejected');
  const suspendedProfiles = profiles.filter(p => p.status === 'suspended');

  const recentProfiles = profiles.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage users, monitor system activity, and oversee platform operations.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="livestock">Livestock</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Pending Approval
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{pendingProfiles.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approved Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{approvedProfiles.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Active users</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <Ban className="w-4 h-4 mr-2" />
                    Suspended
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{suspendedProfiles.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Suspended accounts</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{profiles.length}</div>
                  <p className="text-xs text-slate-500 mt-1">All registrations</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Quick Actions
                  </CardTitle>
                  <CardDescription>Common administrative tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link to="/admin">
                    <Button className="w-full justify-start" variant="outline">
                      <Users className="w-4 h-4 mr-2" />
                      Manage All Users
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                  </Link>
                  {pendingProfiles.length > 0 && (
                    <Link to="/admin">
                      <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700 text-white">
                        <Clock className="w-4 h-4 mr-2" />
                        Review {pendingProfiles.length} Pending Users
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="w-5 h-5 mr-2" />
                    Recent Registrations
                  </CardTitle>
                  <CardDescription>Latest user sign-ups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentProfiles.length > 0 ? (
                      recentProfiles.map((profile) => (
                        <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {profile.first_name?.[0] || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">
                                {profile.first_name} {profile.last_name}
                              </p>
                              <p className="text-xs text-slate-500">{profile.role}</p>
                            </div>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={
                              profile.status === 'approved' ? 'bg-green-100 text-green-800' :
                              profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              profile.status === 'suspended' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {profile.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500 text-center py-4">No recent registrations</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="livestock">
            <LivestockListingsTable onViewListing={handleViewListing} />
          </TabsContent>

          <TabsContent value="offers">
            <AdminOffersTable onViewOffer={handleViewOffer} />
          </TabsContent>

          <TabsContent value="invitations">
            <div className="grid gap-8">
              <ListingInvitationForm onSuccess={fetchInvitations} />
              <div className="mt-8">
                <ListingInvitationsTable invitations={invitations} loading={loadingInvitations} refetch={fetchInvitations} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  System Activity
                </CardTitle>
                <CardDescription>Monitor platform usage and activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Activity monitoring coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </div>

      <LivestockListingDetailsDialog
        listing={selectedListing}
        open={listingDialogOpen}
        onOpenChange={setListingDialogOpen}
      />

      <AdminOfferDetailsDialog
        offer={selectedOffer}
        open={offerDialogOpen}
        onOpenChange={setOfferDialogOpen}
      />
    </div>
  );
};

export default AdminDashboard;
