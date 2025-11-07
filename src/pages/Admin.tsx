
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
import { useTranslation } from "@/i18n/useTranslation";

type ProfilePreview = Pick<Profile, 'id' | 'first_name' | 'last_name' | 'email' | 'role' | 'status' | 'seller_entity_name'>;

type AdminCompanyUser = {
  id: string;
  user_id: string;
  company_id: string;
  relationship_type: CompanyUserRelationship['relationship_type'];
  status: CompanyUserRelationship['status'];
  invited_by: string | null;
  accepted_at: string | null;
  created_at: string | null;
  profiles: ProfilePreview | null;
};

type RawCompanyUser = CompanyUserRelationship & { profiles: Partial<Profile> | null };

const toProfilePreview = (profile: Partial<Profile> | null | undefined): ProfilePreview | null => {
  if (!profile) {
    return null;
  }

  const { id, first_name, last_name, email, role, status, seller_entity_name } = profile;

  return {
    id: id ?? '',
    first_name: first_name ?? '',
    last_name: last_name ?? '',
    email: email ?? '',
    role: (role ?? 'seller') as ProfilePreview['role'],
    status: (status ?? 'pending') as ProfilePreview['status'],
    seller_entity_name: seller_entity_name ?? '',
  };
};

const mapProfileStatusToRelationship = (
  status: ProfilePreview['status'] | null | undefined
): CompanyUserRelationship['status'] => {
  switch (status) {
    case 'approved':
      return 'active';
    case 'pending':
      return 'pending';
    case 'suspended':
      return 'inactive';
    default:
      return 'inactive';
  }
};

const normalizeCompanyUsers = (records: RawCompanyUser[]): AdminCompanyUser[] =>
  records.map((record) => ({
    id: record.id,
    user_id: record.user_id,
    company_id: record.company_id,
    relationship_type: record.relationship_type,
    status: record.status,
    invited_by: record.invited_by ?? null,
    accepted_at: record.accepted_at ?? null,
    created_at: record.created_at ?? null,
    profiles: toProfilePreview(record.profiles),
  }));

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { currentCompany, companies, loading: companyLoading } = useCompany();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [companyUsers, setCompanyUsers] = useState<AdminCompanyUser[]>([]);
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
      const transformedData: AdminCompanyUser[] = (data || []).map((user) => ({
        id: `system-${user.id}`,
        user_id: user.id,
        company_id: 'system-wide',
        relationship_type: (user.role ?? 'seller') as CompanyUserRelationship['relationship_type'],
        status: mapProfileStatusToRelationship(user.status),
        invited_by: null,
        accepted_at: user.status === 'approved' ? user.created_at : null,
        created_at: user.created_at,
        profiles: toProfilePreview({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          status: user.status,
          seller_entity_name: user.seller_entity_name,
        }),
      }));

      setCompanyUsers(transformedData);
    } catch (error) {
      console.error('Error fetching all users:', error);
      toast({
        title: t('adminUsers', 'toastErrorTitle'),
        description: t('adminUsers', 'toastLoadUsersError'),
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const normalized = data ? normalizeCompanyUsers(data as RawCompanyUser[]) : [];
      const filteredData = isSuperAdmin 
        ? normalized 
        : normalized.filter((user) => user.profiles?.role !== 'super_admin');
      
      setCompanyUsers(filteredData);
    } catch (error) {
      console.error('Error fetching company users:', error);
      toast({
        title: t('adminUsers', 'toastErrorTitle'),
        description: t('adminUsers', 'toastLoadUsersError'),
        variant: "destructive"
      });
    } finally {
      setLoadingUsers(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany, isSuperAdmin]);

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
          title: t('adminUsers', 'noCompanyAccessTitle'),
          description: t('adminUsers', 'noCompanyAccessDescription'),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile, loading, companyLoading, currentCompany, navigate, fetchCompanyUsers, fetchAllUsers, isSuperAdmin]);

  const handleInviteUser = async () => {
    if (!currentCompany || !inviteEmail || !inviteRole) return;
    
    setInviteLoading(true);
    
    try {
      const { error } = await CompanyService.inviteUser(
        currentCompany.companyId,
        inviteEmail,
        inviteRole as 'admin' | 'seller' | 'vet' | 'agent' | 'load_master'
      );
      
      if (error) {
        throw error;
      }
      
      toast({
        title: t('adminUsers', 'toastSuccessTitle'),
        description: t('adminUsers', 'toastInviteSuccess'),
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
        title: t('adminUsers', 'toastErrorTitle'),
        description: t('adminUsers', 'toastInviteError'),
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
        title: t('adminUsers', 'toastSuccessTitle'),
        description: t('adminUsers', 'toastRemoveSuccess'),
        variant: "default"
      });
      
      // Refresh the company users list
      fetchCompanyUsers();
    } catch (error) {
      console.error('Error removing user:', error);
      toast({
        title: t('adminUsers', 'toastErrorTitle'),
        description: t('adminUsers', 'toastRemoveError'),
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
        title: t('adminUsers', 'toastSuccessTitle'),
        description: t('adminUsers', 'toastApproveSuccess'),
        variant: "default"
      });
      
      // Refresh the company users list
      fetchCompanyUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: t('adminUsers', 'toastErrorTitle'),
        description: t('adminUsers', 'toastApproveError'),
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
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('adminDashboard', 'statusApproved')}</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{t('adminDashboard', 'statusPending')}</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">{t('adminDashboard', 'statusSuspended')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-purple-600 hover:bg-purple-700"><Shield className="w-3 h-3 mr-1" />{t('adminDashboard', 'roleSuperAdmin')}</Badge>;
      case 'admin':
        return <Badge className="bg-blue-600 hover:bg-blue-700"><Shield className="w-3 h-3 mr-1" />{t('adminDashboard', 'roleAdmin')}</Badge>;
      case 'seller':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">{t('adminDashboard', 'roleSeller')}</Badge>;
      case 'vet':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{t('adminDashboard', 'roleVet')}</Badge>;
      case 'load_master':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">{t('adminDashboard', 'roleLoadMaster')}</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading || !profile || loadingUsers) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">{t('common', 'loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              {t('adminUsers', 'backToDashboard')}
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-600" />
                {t('adminUsers', 'pageTitle')}
              </h1>
              <p className="text-slate-600 mt-1">
                {isSuperAdmin 
                  ? t('adminUsers', 'systemWideDescription')
                  : t('adminUsers', 'companyDescription').replace('{company}', currentCompany?.companyName || '')}
              </p>
            </div>
          </div>
          {!isSuperAdmin && <Button onClick={() => setShowInviteDialog(true)} className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="w-4 h-4 mr-2" />
            {t('adminUsers', 'inviteUserButton')}
          </Button>}
        </div>
          
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 mr-2" />
                {t('adminUsers', 'cardTitleWithCount').replace('{count}', String(companyUsers.length))}
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {t('adminDashboard', 'statusApproved')}: {companyUsers.filter(({ profiles }) => profiles?.status === 'approved').length}
                </Badge>
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {t('adminDashboard', 'statusPending')}: {companyUsers.filter(({ profiles }) => profiles?.status === 'pending').length}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              {t('adminUsers', 'cardDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminUsers', 'tableUser')}</TableHead>
                  <TableHead>{t('adminUsers', 'tableRole')}</TableHead>
                  <TableHead>{t('adminUsers', 'tableStatus')}</TableHead>
                  <TableHead>{t('adminUsers', 'tableJoined')}</TableHead>
                  <TableHead>{t('adminUsers', 'tableActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.map((companyUser) => (
                  <TableRow key={companyUser.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {companyUser.profiles?.first_name} {companyUser.profiles?.last_name}
                        </div>
                        <div className="text-sm text-slate-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {companyUser.profiles?.email}
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
                        {(companyUser.accepted_at || companyUser.created_at)
                          ? new Date(companyUser.accepted_at || companyUser.created_at || '').toLocaleDateString()
                          : t('common', 'notAvailable')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {!isCompanyOwner(companyUser.user_id) && (
                          <> 
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleApproveUser(companyUser.user_id)}
                              disabled={companyUser.status === 'active'}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {t('adminUsers', 'actionApprove')}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveUser(companyUser.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              {t('adminUsers', 'actionRemove')}
                            </Button>
                          </>
                        )}
                        {/* Owner badge */}
                        {isCompanyOwner(companyUser.user_id) && (
                          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                            {t('adminUsers', 'ownerBadge')}
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('adminUsers', 'inviteDialogTitle')}</DialogTitle>
              <DialogDescription>{t('adminUsers', 'inviteDialogDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">{t('adminUsers', 'emailLabel')}</Label>
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t('adminUsers', 'emailPlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">{t('adminUsers', 'roleLabel')}</Label>
                <Select
                  value={inviteRole}
                  onValueChange={setInviteRole}
                  disabled={inviteLoading}
                >
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder={t('adminUsers', 'rolePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t('adminDashboard', 'roleAdmin')}</SelectItem>
                    <SelectItem value="seller">{t('adminDashboard', 'roleSeller')}</SelectItem>
                    <SelectItem value="vet">{t('adminDashboard', 'roleVet')}</SelectItem>
                    <SelectItem value="agent">{t('adminDashboard', 'roleAgent')}</SelectItem>
                    <SelectItem value="load_master">{t('adminDashboard', 'roleLoadMaster')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} disabled={inviteLoading}>
                {t('common', 'cancel')}
              </Button>
              <Button onClick={handleInviteUser} disabled={inviteLoading} className="bg-blue-600 hover:bg-blue-700">
                {inviteLoading ? (
                  <span className="flex items-center">
                    <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {t('adminUsers', 'sendingLabel')}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('adminUsers', 'sendInvitationButton')}
                  </span>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
