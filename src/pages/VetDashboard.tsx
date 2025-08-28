
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Stethoscope, LogOut, FileText, Building2, Users, BarChart3, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useCompany } from '@/contexts/companyContext';
import { useToast } from '@/hooks/use-toast';
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { supabase } from '@/integrations/supabase/client';
import { VeterinaryDeclarationForm } from '@/components/VeterinaryDeclarationForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tables } from '@/integrations/supabase/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileSection from "@/components/ProfileSection";
import { CompanySelector } from '@/components/CompanySelector';
import { MultiTenantDashboardController } from '@/services/multiTenantDashboardController';

const VetDashboard = () => {
  const [assignments, setAssignments] = useState<Tables<'livestock_listings'>[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, profile, loading: authLoading, needsProfileCompletion } = useAuth();
  const { currentCompany, userCompanies } = useCompany();
  const { toast } = useToast();

  const fetchAssignments = useCallback(async () => {
    if (!profile) return;
    
    // Vets should see ALL listings assigned to them, regardless of company
    // Only filter by company for non-vet roles
    let query = supabase
      .from('livestock_listings')
      .select('*')
      .eq('assigned_vet_id', profile.id)
      .eq('status', 'submitted_to_vet');
    
    // Don't filter by company for vets - they work across companies
    // Only filter by company for other roles if not super admin
    if (currentCompany && profile.role !== 'super_admin' && profile.role !== 'vet') {
      query = query.eq('company_id', currentCompany.companyId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching assignments:', error);
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      });
    } else {
      setAssignments(data || []);
    }
  }, [profile, currentCompany, toast]);

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
        await fetchAssignments();
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
  }, [user, profile, currentCompany, authLoading, fetchAssignments, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'vet') {
      navigate('/');
    }
  }, [user, profile, authLoading, navigate]);

  const handleDeclarationSuccess = () => {
    setSelectedListingId(null);
    fetchAssignments();
  };

  const handleCancelDeclaration = () => {
    setSelectedListingId(null);
  };

  if (authLoading || loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  if (selectedListingId) {
    return <VeterinaryDeclarationForm listingId={selectedListingId} onSuccess={handleDeclarationSuccess} onCancel={handleCancelDeclaration} />;
  }

  const stats = dashboardData?.stats || {
    pendingDeclarations: assignments.length,
    completedDeclarations: 0,
    totalAssignments: 0,
    activeCompanies: userCompanies.length
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Company Selector */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Veterinary Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage livestock declarations and inspections</p>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard">
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Declarations</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingDeclarations}</div>
                  <p className="text-xs text-muted-foreground">
                    Awaiting completion
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completedDeclarations}</div>
                  <p className="text-xs text-muted-foreground">
                    This month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalAssignments}</div>
                  <p className="text-xs text-muted-foreground">
                    {currentCompany ? `From ${currentCompany.companyName}` : 'All companies'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Companies</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCompanies}</div>
                  <p className="text-xs text-muted-foreground">
                    Associated companies
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pending Declarations
                    {currentCompany && (
                      <Badge variant="secondary" className="ml-2">
                        {currentCompany.companyName}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Livestock listings requiring your veterinary declaration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {assignments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference ID</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignments.map((listing) => (
                          <TableRow key={listing.id}>
                            <TableCell>{listing.reference_id}</TableCell>
                            <TableCell>{listing.owner_name}</TableCell>
                            <TableCell>{listing.location}</TableCell>
                            <TableCell className="text-right">
                              <Button onClick={() => setSelectedListingId(listing.id)}>Complete Declaration</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <Stethoscope className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No pending declarations</p>
                      <p className="text-sm text-slate-400 mt-1">
                        {currentCompany ? `No assignments from ${currentCompany.companyName}` : 'No assignments available'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

export default VetDashboard;
