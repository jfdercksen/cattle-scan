import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Users, Clock, CheckCircle, Ban, Settings, Activity, BarChart3, ArrowRight, LogOut, Building2, Plus } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useCompany } from "@/contexts/companyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MultiTenantDashboardController, type DashboardData } from "@/services/multiTenantDashboardController";
import type { Tables } from "@/integrations/supabase/types";
import { AdminOfferDetailsDialog } from "@/components/AdminOfferDetailsDialog";
import { ListingInvitationForm } from '@/components/ListingInvitationForm';
import { ListingInvitationsTable } from '@/components/ListingInvitationsTable';
import ProfileSection from "@/components/ProfileSection";
import { LivestockListingDetailsDialog } from "@/components/LivestockListingDetailsDialog";
import { CompanySelector } from "@/components/CompanySelector";
import { CompanyManagement } from "@/components/CompanyManagement";
import { CompanyRegistrationForm } from '@/components/CompanyRegistrationForm';


type Profile = Tables<'profiles'>;

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
  const { user, loading: authLoading, signOut, profile } = useAuth();
  const { currentCompany, userCompanies, loading: companyLoading } = useCompany();
  const { toast } = useToast();
  
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  
  const [selectedListing, setSelectedListing] = useState<LivestockListing | null>(null);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<LivestockOffer | null>(null);
  const [offerDialogOpen, setOfferDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Multi-tenant modal states
  const [showCompanyManagement, setShowCompanyManagement] = useState(false);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);


  const isSuperAdmin = profile?.role === 'super_admin';
  const isAdmin = profile?.role === 'admin' || isSuperAdmin;

  // Handle navigation redirects
  useEffect(() => {
    if (!user || !profile) {
      navigate('/auth');
      return;
    }
    
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
  }, [user, profile, isAdmin, navigate]);

  useEffect(() => {
    if (user && profile && !companyLoading) {
      fetchDashboardData();
    }
  }, [user, profile, currentCompany, companyLoading]);

  const fetchDashboardData = useCallback(async () => {
    if (!user || !profile) return;

    setLoading(true);
    setLoadingInvitations(true);
    try {
      const { data, error } = await MultiTenantDashboardController.getDashboardData(
        user.id, 
        profile.role
      );

      if (error) throw error;
      setDashboardData(data);
      setInvitations(data?.invitations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingInvitations(false);
    }
  }, [user, profile, currentCompany, toast]);

  // Function to refresh invitations data
  const fetchInvitations = useCallback(async () => {
    if (!user || !profile) return;

    setLoadingInvitations(true);
    try {
      const { data, error } = await MultiTenantDashboardController.getDashboardData(
        user.id, 
        profile.role
      );

      if (error) throw error;
      setDashboardData(data);
      setInvitations(data?.invitations || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast({
        title: "Error",
        description: "Failed to refresh invitations",
        variant: "destructive"
      });
    } finally {
      setLoadingInvitations(false);
    }
  }, [user, profile, toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };



  const handleViewListing = (listing: LivestockListing) => {
    setSelectedListing(listing);
    setListingDialogOpen(true);
  };

  const handleViewOffer = (offer: LivestockOffer) => {
    setSelectedOffer(offer);
    setOfferDialogOpen(true);
  };

  if (authLoading || companyLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Shield className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Navigation is now handled in useEffect to avoid setState during render
  if (!user || !profile || !isAdmin) {
    return null;
  }

  // Show company setup for users without companies
  if (!isSuperAdmin && userCompanies.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center">
              <Building2 className="w-6 h-6 mr-2" />
              Welcome to Cattle Secure Trace
            </CardTitle>
            <CardDescription>
              You need to be associated with a company to access the admin dashboard.
              Please contact your system administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = {
    totalListings: dashboardData?.listings?.length || 0,
    pendingInvitations: dashboardData?.invitations?.filter(inv => inv.status === 'pending').length || 0,
    activeOffers: dashboardData?.offers?.filter(offer => offer.status === 'pending').length || 0,
    totalUsers: dashboardData?.profiles?.length || 0,
    totalCompanies: dashboardData?.companies?.length || 0
  };

  const recentProfiles = dashboardData?.profiles?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-emerald-600 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {isSuperAdmin ? 'Platform-wide management' : 'Company management'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
             {!isSuperAdmin && (userCompanies.length > 0 && (
                <CompanySelector />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${isSuperAdmin ? 'grid-cols-3' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="companies" onClick={() => setShowCompanyManagement(true)}>Companies</TabsTrigger>}
            {/* <TabsTrigger value="livestock">Livestock</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
            <TabsTrigger value="sellers">Sellers</TabsTrigger> */}
            {!isSuperAdmin && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
            {/* <TabsTrigger value="activity">Activity</TabsTrigger> */}
            <TabsTrigger value="profile">Profile</TabsTrigger>
            
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              {isSuperAdmin && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                    <p className="text-xs text-muted-foreground">
                      Active companies on platform
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Listings</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalListings}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentCompany ? `From ${currentCompany.companyName}` : 'All companies'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeOffers}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending offers
                  </p>
                </CardContent>
              </Card> */}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Recent Users
                  </CardTitle>
                  <CardDescription>Latest user registrations</CardDescription>
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
                    
                    {isSuperAdmin && <div className="pt-3 border-t border-slate-200">
                      <Button 
                        onClick={() => navigate('/admin')}
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage All Users
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                    </div>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Company Management
                  </CardTitle>
                  <CardDescription>Manage companies and relationships</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isSuperAdmin ? (
                    <>
                      <Button 
                        onClick={() => setActiveTab('companies')}
                        className="w-full justify-start" 
                        variant="outline"
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Manage All Companies
                        <ArrowRight className="w-4 h-4 ml-auto" />
                      </Button>
                      <Dialog open={showCompanyRegistration} onOpenChange={setShowCompanyRegistration}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full justify-start" 
                            variant="outline"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Company
                            <ArrowRight className="w-4 h-4 ml-auto" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Create New Company</DialogTitle>
                          </DialogHeader>
                          <CompanyRegistrationForm 
                            onSuccess={() => {
                              setShowCompanyRegistration(false);
                              fetchDashboardData();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </>
                  ) : (
                    <Button 
                      onClick={() => navigate('/admin')}
                      className="w-full justify-start" 
                      variant="outline"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage Company Users
                      <ArrowRight className="w-4 h-4 ml-auto" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies">
            <CompanyManagement onClose={() => setShowCompanyManagement(false)} />
          </TabsContent>

          <TabsContent value="invitations">
            <div className="grid gap-8">
              <ListingInvitationForm onSuccess={fetchInvitations} />
              <div className="mt-8">
                <ListingInvitationsTable invitations={invitations} loading={loadingInvitations} refetch={fetchInvitations} />
              </div>
            </div>
          </TabsContent>
          
          {/* <TabsContent value="livestock">
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
          </TabsContent> */}

          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>
        </Tabs>
      </div>

      {/* Multi-tenant Modal Components */}
      
      {/* {showCompanyRegistration && (
        <CompanyRegistrationForm 
          onSuccess={() => {
            setShowCompanyRegistration(false);
            toast({
              title: "Success",
              description: "Company created successfully",
            });
          }}
          onCancel={() => setShowCompanyRegistration(false)}
        />
      )} */}
      


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
