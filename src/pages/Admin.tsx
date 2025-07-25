
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, UserPlus, Mail, Shield, Building2, Trash2, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useCompany } from "@/contexts/companyContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CompanyService } from "@/services/companyService";
import type { CompanyUserRelationship, Profile } from "@/services/companyService";

type CompanyUser = CompanyUserRelationship & { profiles: Profile };

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { currentCompany, companies, loading: companyLoading } = useCompany();
  const { toast } = useToast();
  
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('');
  const [inviteLoading, setInviteLoading] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          email,
          role,
          status,
          seller_entity_name,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all users:', error);
        throw error;
      }
      
      // Transform data to match the expected CompanyUser structure
      const transformedData = data?.map(user => ({
        // CompanyUserRelationship fields
        id: `system-${user.id}`, // Unique ID for system-wide view
        user_id: user.id,
        company_id: 'system-wide',
        relationship_type: user.role,
        status: 'active',
        invited_by: 'system',
        accepted_at: user.created_at,
        created_at: user.created_at,
        
        // User profile fields
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        user_role: user.role,
        user_status: user.status,
        seller_entity_name: user.seller_entity_name,
        company_name: 'System Wide' // Placeholder for super admin view
      })) || [];
      
      setCompanyUsers(transformedData as any);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [toast]);

  const fetchCompanyUsers = useCallback(async () => {
    if (!currentCompany) return;
    
    try {
      setLoadingUsers(true);
      const { data, error } = await CompanyService.getCompanyUsers(currentCompany.companyId);
      
      if (error) {
        console.error('Error fetching company users:', error);
        throw error;
      }
      
      // Filter out super_admin users if current user is not a super admin
      const filteredData = isSuperAdmin 
        ? (data || []) 
        : (data || []).filter(user => user.profiles?.role !== 'super_admin');
      
      setCompanyUsers(filteredData);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: "Error",
        description: "Failed to load company users",
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [currentCompany, toast, isSuperAdmin]);

  useEffect(() => {
    if (loading || companyLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    // Allow admin and super_admin users with approved or pending status
    const allowedStatuses = ['approved', 'pending'];
    if (!profile || !['super_admin', 'admin'].includes(profile.role) || !allowedStatuses.includes(profile.status)) {
      navigate('/');
      return;
    }

    // Super admins can view all users system-wide
    if (isSuperAdmin) {
      fetchAllUsers();
      return;
    }

    // For regular admins, check company context
    if (!currentCompany && !companyLoading) {
      // For admin users, if no company is available after loading, show an error instead of redirecting
      if (profile?.role === 'admin') {
        toast({
          title: "No Company Access",
          description: "You don't have access to any companies. Please contact your administrator.",
          variant: "destructive"
        });
        return;
      }
      // For super_admin, redirect to dashboard if no companies exist
      navigate('/admin-dashboard');
      return;
    }

    // Regular admins fetch company-specific users
    if (currentCompany) {
      fetchCompanyUsers();
    }
  }, [user, profile, loading, companyLoading, currentCompany, navigate, fetchCompanyUsers, fetchAllUsers, isSuperAdmin, toast]);

  const handleInviteUser = async () => {
    if (!currentCompany || !inviteEmail || !inviteRole) return;
    
    setInviteLoading(true);
    
    try {
      const { error } = await CompanyService.inviteUser(
        currentCompany.companyId,
        inviteEmail,
        inviteRole as 'admin' | 'seller' | 'vet' | 'agent' | 'driver'
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User invited successfully",
        variant: "default"
      });
      
      // Reset form and close dialog
      setInviteEmail('');
      setInviteRole('');
      setShowInviteDialog(false);
      
      // Refresh the company users list
      fetchCompanyUsers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive"
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemoveUser = async (relationshipId: string) => {
    if (!currentCompany) return;
    
    try {
      const { error } = await CompanyService.removeUserFromCompany(
        relationshipId
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User removed from company",
        variant: "default"
      });
      
      // Refresh the company users list
      fetchCompanyUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive"
      });
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      const { data, error } = await CompanyService.approveUser(userId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Success",
        description: "User approved successfully",
        variant: "default"
      });
      
      // Refresh the company users list
      fetchCompanyUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive"
      });
    }
  };

  // Helper function to check if a user is the company owner
  const isCompanyOwner = (userId: string): boolean => {
    if (!currentCompany) return false;
    
    // Find the full company data from the companies array in context
    const fullCompany = companies.find(c => c.id === currentCompany.companyId);
    
    return fullCompany?.admin_user_id === userId;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'suspended':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-600 hover:bg-purple-700"><Shield className="w-3 h-3 mr-1" />Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600 hover:bg-blue-700"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'seller':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Seller</Badge>;
      case 'vet':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Vet</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Agent</Badge>;
      case 'driver':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Driver</Badge>;
      case 'load_master':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Load Master</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading || !profile || loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin-dashboard')}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                Company Users
              </h1>
              <p className="text-slate-600 mt-1">
                Manage users for {isSuperAdmin ? 'System Wide' : currentCompany?.companyName}
              </p>
            </div>
          </div>
          {!isSuperAdmin && <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite User
          </Button>}
        </div>
          
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                Company Users ({companyUsers.length})
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Approved: {companyUsers.filter(u => {
                    const status = u.profiles?.status || (u as any).user_status;
                    return status === 'approved';
                  }).length}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  Pending: {companyUsers.filter(u => {
                    const status = u.profiles?.status || (u as any).user_status;
                    return status === 'pending';
                  }).length}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Manage users and their roles within your company
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.map((companyUser) => (
                  <TableRow key={companyUser.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {companyUser.profiles?.first_name || (companyUser as any).first_name} {companyUser.profiles?.last_name || (companyUser as any).last_name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {companyUser.profiles?.email || (companyUser as any).email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(companyUser.relationship_type)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(companyUser.status)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-500">
                        {companyUser.accepted_at 
                          ? new Date(companyUser.accepted_at).toLocaleDateString()
                          : new Date(companyUser.created_at).toLocaleDateString()
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* Approve button for pending users */}
                        {(companyUser.profiles?.status || (companyUser as any).user_status) === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleApproveUser(companyUser.user_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {/* Remove button for active users (except owners) */}
                        {companyUser.status === 'active' && !isCompanyOwner(companyUser.user_id) && (
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleRemoveUser(companyUser.id)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        )}
                        {/* Owner badge */}
                        {isCompanyOwner(companyUser.user_id) && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            Owner
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User to Company</DialogTitle>
              <DialogDescription>
                Send an invitation to join {currentCompany?.companyName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="user@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="vet">Veterinarian</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="driver">Driver</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleInviteUser}
                disabled={!inviteEmail || !inviteRole || inviteLoading}
              >
                {inviteLoading ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
