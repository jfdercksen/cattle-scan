import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, BarChart3, Activity, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useCompany } from '@/contexts/companyContext';
import { useToast } from '@/hooks/use-toast';
import { LivestockListingDialog } from "@/components/LivestockListingDialog";
import { SellerInvitationsTable } from '@/components/SellerInvitationsTable';
import type { Tables } from '@/integrations/supabase/types';
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSection from "@/components/ProfileSection";
import { CompanySelector } from '@/components/CompanySelector';
import { MultiTenantDashboardController } from '@/services/multiTenantDashboardController';
import { supabase } from '@/integrations/supabase/client';

type Profile = Tables<'profiles'>;

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, needsProfileCompletion } = useAuth();
  const { currentCompany, userCompanies } = useCompany();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile || authLoading) return;
      
      try {
        setLoading(true);
        const result = await MultiTenantDashboardController.getDashboardData(user.id, profile.role);
        if (result.error) {
          throw result.error;
        }
        setDashboardData(result.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, profile, currentCompany, authLoading, toast]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'seller') {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);



  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (user && needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  // const stats = dashboardData?.stats || {
  //   totalListings: 0,
  //   activeOffers: 0,
  //   pendingInvitations: 0,
  //   completedSales: 0
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Company Selector */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Seller Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your livestock listings and sales</p>
          </div>
          <div className="flex items-center space-x-4">
            {/* <CompanySelector /> */}
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Add sign out logic here
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button> */}
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {/* Stats Cards */}
            {/* <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Listings</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeOffers}</div>
                  <p className="text-xs text-muted-foreground">
                    Pending offers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invitations</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingInvitations}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting response
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Sales</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedSales}</div>
                  <p className="text-xs text-muted-foreground">
                    Total sales
                  </p>
                </CardContent>
              </Card>
            </div> */}

            {/* Main Content */}
            <div className="space-y-6">
              <SellerInvitationsTable />
            </div>
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
