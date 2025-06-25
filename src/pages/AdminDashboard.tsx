import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, Clock, CheckCircle, XCircle, Ban, Settings, Bell, Activity, BarChart3, ArrowRight, LogOut, Beef } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import ProfileSection from "@/components/ProfileSection";
import { LivestockListingsTable } from "@/components/LivestockListingsTable";
import { LivestockListingDetailsDialog } from "@/components/LivestockListingDetailsDialog";
import { AdminOffersTable } from "@/components/AdminOffersTable";
import { AdminOfferDetailsDialog } from "@/components/AdminOfferDetailsDialog";

type Profile = Tables<'profiles'>;
type LivestockListing = Tables<'livestock_listings'>;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedListing, setSelectedListing] = useState<LivestockListing | null>(null);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      if (!profile || !['super_admin', 'admin'].includes(profile.role) || profile.status !== 'approved') {
        navigate('/');
        return;
      }
      
      fetchProfiles();
    }
  }, [user, profile, loading, navigate]);

  const fetchProfiles = async () => {
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
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewListing = (listing: LivestockListing) => {
    setSelectedListing(listing);
    setListingDialogOpen(true);
  };

  const handleViewOffer = (offer: any) => {
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
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-800">Cattle Scan</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {profile?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {profile?.first_name || 'Admin'}
              </span>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage users, monitor system activity, and oversee platform operations.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="livestock">Livestock</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
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

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  For detailed user management, use the dedicated admin panel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/admin">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    <Users className="w-5 h-5 mr-2" />
                    Open User Management Panel
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="livestock">
            <LivestockListingsTable onViewListing={handleViewListing} />
          </TabsContent>

          <TabsContent value="offers">
            <AdminOffersTable onViewOffer={handleViewOffer} />
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  System Settings
                </CardTitle>
                <CardDescription>Configure platform settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">Settings panel coming soon</p>
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
