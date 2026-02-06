import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth";
import { useCompany } from '@/contexts/companyContext';
import { useToast } from '@/hooks/use-toast';
import { SellerInvitationsTable } from '@/components/SellerInvitationsTable';
import type { Tables } from '@/integrations/supabase/types';
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSection from "@/components/ProfileSection";
import { CompanySelector } from '@/components/CompanySelector';
import { MultiTenantDashboardController } from '@/services/multiTenantDashboardController';
import { supabase } from '@/integrations/supabase/client';
import SellerFarms from '@/components/SellerFarms';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/i18n/useTranslation';

type Profile = Tables<'profiles'>;

type LivestockOffer = Tables<'livestock_offers'> & {
  livestock_listings: Tables<'livestock_listings'>;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, initialized, needsProfileCompletion } = useAuth();
  const { currentCompany, userCompanies } = useCompany();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [hasFarms, setHasFarms] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const refreshFarmCount = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingFarms(true);
      const { count, error } = await supabase
        .from('farms')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user.id);
      if (error) throw error;
      setHasFarms((count ?? 0) > 0);
    } catch (error) {
      console.error('Error checking farms:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('sellerDashboard', 'toastDashboardError'),
        variant: "destructive",
      });
      setHasFarms(false);
    } finally {
      setLoadingFarms(false);
    }
  }, [user, toast, t]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !profile || authLoading) return;
      
      try {
        setLoading(true);
        const result = await MultiTenantDashboardController.getDashboardData(user.id, profile.role);
        if (result.error) {
          throw result.error;
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: t('sellerDashboard', 'toastErrorTitle'),
          description: t('sellerDashboard', 'toastDashboardError'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, currentCompany, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;
    refreshFarmCount();
  }, [user, authLoading, refreshFarmCount]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const showFarmPrompt = searchParams.get('showFarmPrompt');
    if (tabParam) {
      setActiveTab(tabParam);
    }
    if (showFarmPrompt) {
      toast({
        title: t('sellerDashboard', 'farmRequiredTitle'),
        description: t('sellerDashboard', 'farmRequiredDescription'),
        variant: "destructive",
      });
    }
  }, [searchParams, toast, t]);

  useEffect(() => {
    if (!loadingFarms && !hasFarms) {
      setActiveTab('farms');
    }
  }, [loadingFarms, hasFarms]);

  const handleTabChange = (value: string) => {
    if (!hasFarms && value !== 'farms') {
      toast({
        title: t('sellerDashboard', 'farmRequiredTitle'),
        description: t('sellerDashboard', 'pleaseCreateFarmFirst'),
        variant: "destructive",
      });
      return;
    }
    setActiveTab(value);
  };

  const handleFarmCreated = async () => {
    const hadFarmsBefore = hasFarms;
    await refreshFarmCount();
    if (!hadFarmsBefore) {
      toast({
        title: t('sellerDashboard', 'farmCreatedSuccess'),
        description: t('sellerDashboard', 'farmRequiredDescription'),
      });
      setActiveTab('dashboard');
    } else {
      toast({
        title: t('sellerDashboard', 'farmAddedSuccess'),
      });
    }
  };

  useEffect(() => {
    if (authLoading || !initialized) return;

    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'seller') {
      navigate('/');
    }
  }, [user, profile, authLoading, initialized, navigate]);



  if (authLoading || !initialized || loading || loadingFarms) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">{t('common', 'loading')}</div>
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Company Selector */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{t('sellerDashboard', 'title')}</h1>
            <p className="text-slate-600 mt-1">{t('sellerDashboard', 'description')}</p>
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

        {!hasFarms && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>{t('sellerDashboard', 'farmRequiredTitle')}</AlertTitle>
            <AlertDescription>
              {t('sellerDashboard', 'farmRequiredDescription')}
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">{t('sellerDashboard', 'tabDashboard')}</TabsTrigger>
            <TabsTrigger value="farms">{t('sellerDashboard', 'tabFarms')}</TabsTrigger>
            <TabsTrigger value="profile">{t('sellerDashboard', 'tabProfile')}</TabsTrigger>
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
            {hasFarms ? (
              <div className="space-y-6">
                <SellerInvitationsTable />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">{t('sellerDashboard', 'farmRequiredDescription')}</div>
            )}
          </TabsContent>
          
          <TabsContent value="farms">
            <SellerFarms onFarmCreated={handleFarmCreated} />
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
