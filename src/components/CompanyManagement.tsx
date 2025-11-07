import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CompanyService, type Company, type CompanyUserRelationship } from "@/services/companyService";
import { useAuth } from "@/contexts/auth";
import { Building2, Users, Settings, Plus, UserPlus, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { CompanyRegistrationForm } from "./CompanyRegistrationForm";
import type { Tables } from "@/integrations/supabase/types";
import { useTranslation } from "@/i18n/useTranslation";

type Profile = Tables<'profiles'>;

// Define the structure of company settings JSON
interface CompanySettings {
  description?: string;
  phone?: string;
  registration_number?: string;
  address?: string;
  [key: string]: unknown; // Allow for additional properties
}

type CompanyUserWithProfile = CompanyUserRelationship & { profiles: Profile };

interface CompanyEntry {
  company: Company;
  userCount: number;
  users: CompanyUserWithProfile[];
}

const getCompanySettings = (company: Company): CompanySettings | null => {
  if (!company.settings || typeof company.settings !== 'object' || Array.isArray(company.settings)) {
    return null;
  }
  return company.settings as CompanySettings;
};

interface CompanyManagementProps {
  onClose?: () => void;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [companies, setCompanies] = useState<CompanyEntry[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'seller' | 'vet' | 'load_master'>('seller');
  const [inviteLoading, setInviteLoading] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';
  const fetchCompanies = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      let baseCompanies: Company[] = [];

      if (isSuperAdmin) {
        // Super admin can see all companies
        const { data, error } = await CompanyService.getCompanies();
        if (error) throw error;
        baseCompanies = data ?? [];
      } else {
        // Regular users see only their companies
        const { data, error } = await CompanyService.getUserCompanies(user.id);
        if (error) throw error;
        baseCompanies = data ?? [];
      }

      // Fetch user details for each company
      const companiesWithUsers: CompanyEntry[] = await Promise.all(
        baseCompanies.map(async (company): Promise<CompanyEntry> => {
          const { data: users, error: usersError } = await CompanyService.getCompanyUsers(company.id);
          if (usersError) throw usersError;

          return {
            company,
            userCount: users?.length || 0,
            users: (users || []) as CompanyUserWithProfile[]
          };
        })
      );

      setCompanies(companiesWithUsers);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast({
        title: t('companyManagement', 'toastErrorTitle'),
        description: t('companyManagement', 'toastErrorLoadCompanies'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isSuperAdmin]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleCompanyCreated = (companyId: string) => {
    setShowCreateDialog(false);
    fetchCompanies();
    toast({
      title: t('companyManagement', 'toastSuccessTitle'),
      description: t('companyManagement', 'toastCompanyCreated'),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'inactive':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return t('adminDashboard', 'roleSuperAdmin');
      case 'admin':
        return t('companyManagement', 'roleAdmin');
      case 'seller':
        return t('companyManagement', 'roleSeller');
      case 'vet':
        return t('companyManagement', 'roleVet');
      case 'agent':
        return t('adminDashboard', 'roleAgent');
      case 'load_master':
        return t('companyManagement', 'roleLoadMaster');
      default:
        return role;
    }
  };

  const getRelationshipStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t('companyManagement', 'statusActive');
      case 'pending':
        return t('companyManagement', 'statusPending');
      case 'inactive':
        return t('companyManagement', 'statusInactive');
      default:
        return status;
    }
  };

  const handleInviteUser = async () => {
    if (!selectedCompany || !user || !inviteEmail.trim()) {
      toast({
        title: t('companyManagement', 'toastErrorTitle'),
        description: t('companyManagement', 'toastFillRequired'),
        variant: "destructive"
      });
      return;
    }

    setInviteLoading(true);
    try {
      // Check if user exists
      const { exists, user: existingUser, error: checkError } = await CompanyService.checkUserExists(inviteEmail.trim());
      
      if (checkError) throw checkError;

      if (exists && existingUser) {
        // User exists - create direct company relationship
        const { error } = await CompanyService.createCompanyUserRelationship({
          company_id: selectedCompany.company.id,
          user_id: existingUser.id,
          relationship_type: inviteRole,
          invited_by: user.id,
          status: 'pending'
        });

        if (error) throw error;

        toast({
          title: t('companyManagement', 'toastSuccessTitle'),
          description: t('companyManagement', 'toastInvitationExisting').replace('{email}', inviteEmail)
        });
      } else {
        // User doesn't exist - create pending invitation record
        // This will be processed when the user eventually registers
        const { error } = await CompanyService.createPendingInvitation({
          company_id: selectedCompany.company.id,
          email: inviteEmail.trim(),
          relationship_type: inviteRole,
          invited_by: user.id,
          status: 'pending'
        });

        if (error) throw error;

        toast({
          title: t('companyManagement', 'toastSuccessTitle'),
          description: t('companyManagement', 'toastInvitationNew').replace('{email}', inviteEmail)
        });
      }

      // Reset form and close dialog
      setInviteEmail('');
      setInviteRole('seller');
      setShowInviteDialog(false);
      
      // Refresh companies to show updated user list
      await fetchCompanies();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: t('companyManagement', 'toastErrorTitle'),
        description: t('companyManagement', 'toastSendFailed'),
        variant: "destructive"
      });
    } finally {
      setInviteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">{t('companyManagement', 'loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('companyManagement', 'title')}</h1>
          <p className="text-slate-600">
            {isSuperAdmin ? t('companyManagement', 'superAdminSubtitle') : t('companyManagement', 'adminSubtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isSuperAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {t('companyManagement', 'createCompany')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{t('companyManagement', 'createCompanyTitle')}</DialogTitle>
                <DialogDescription>
                  {t('companyManagement', 'createCompanyDescription')}
                </DialogDescription>
              </DialogHeader>
              <CompanyRegistrationForm onSuccess={handleCompanyCreated} />
            </DialogContent>
          </Dialog>
          )}
          {/* {onClose && (
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          )} */}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((entry) => {
          const { company, userCount, users } = entry;
          const settings = getCompanySettings(company);

          return (
            <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-emerald-600" />
                    {company.name}
                  </div>
                  {company.admin_user_id === user?.id && (
                    <Badge variant="secondary">{t('companyManagement', 'roleAdmin')}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {settings?.description || t('companyManagement', 'noDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center text-slate-600">
                      <Users className="w-4 h-4 mr-1" />
                      {t('companyManagement', 'companyUsers').replace('{count}', String(userCount))}
                    </span>
                    <span className="flex items-center text-slate-600">
                      <Calendar className="w-4 h-4 mr-1" />
                      {t('companyManagement', 'createdOn').replace('{date}', new Date(company.created_at).toLocaleDateString())}
                    </span>
                  </div>

                  {settings?.phone && (
                    <div className="text-sm text-slate-600">
                      <strong>{t('companyManagement', 'phoneLabel')}</strong> {settings.phone}
                    </div>
                  )}

                  {settings?.registration_number && (
                    <div className="text-sm text-slate-600">
                      <strong>{t('companyManagement', 'registrationLabel')}</strong> {settings.registration_number}
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setSelectedCompany(entry)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    {t('companyManagement', 'manageButton')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">{t('companyManagement', 'noCompaniesTitle')}</h3>
            <p className="text-slate-600 mb-4">
              {isSuperAdmin 
                ? t('companyManagement', 'noCompaniesSuperAdmin')
                : t('companyManagement', 'noCompaniesAdmin')
              }
            </p>
            {isSuperAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t('companyManagement', 'createFirstCompany')}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Company Details Dialog */}
      <Dialog open={!!selectedCompany} onOpenChange={() => setSelectedCompany(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {selectedCompany?.company.name}
            </DialogTitle>
            <DialogDescription>
              {t('companyManagement', 'dialogTitle')}
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">{t('companyManagement', 'tabsUsers')}</TabsTrigger>
                <TabsTrigger value="settings">{t('companyManagement', 'tabsSettings')}</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">{t('companyManagement', 'companyUsersHeading')}</h3>
                  <Button size="sm" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    {t('companyManagement', 'inviteUser')}
                  </Button>
                </div>

                <div className="space-y-3">
                  {selectedCompany.users.map((relationship) => (
                    <div key={relationship.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {relationship.profiles.first_name?.[0] || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {relationship.profiles.first_name} {relationship.profiles.last_name}
                          </p>
                          <p className="text-sm text-slate-600">{relationship.profiles.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {getRoleDisplayName(relationship.relationship_type)}
                        </Badge>
                        <Badge className={getStatusColor(relationship.status)}>
                          {getStatusIcon(relationship.status)}
                          <span className="ml-1">{getRelationshipStatusLabel(relationship.status)}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{t('companyManagement', 'companyInfoHeading')}</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>{t('companyManagement', 'infoName')}</strong> {selectedCompany.company.name}
                      </div>
                      <div>
                        <strong>{t('companyManagement', 'infoCreated')}</strong> {new Date(selectedCompany.company.created_at).toLocaleDateString()}
                      </div>
                      {getCompanySettings(selectedCompany.company)?.phone && (
                        <div>
                          <strong>{t('companyManagement', 'phoneLabel')}</strong> {getCompanySettings(selectedCompany.company)?.phone}
                        </div>
                      )}
                      {getCompanySettings(selectedCompany.company)?.registration_number && (
                        <div>
                          <strong>{t('companyManagement', 'registrationLabel')}</strong> {getCompanySettings(selectedCompany.company)?.registration_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {getCompanySettings(selectedCompany.company)?.address && (
                    <div>
                      <strong>{t('companyManagement', 'infoAddress')}</strong>
                      <p className="text-sm text-slate-600 mt-1">{getCompanySettings(selectedCompany.company)?.address}</p>
                    </div>
                  )}

                  {getCompanySettings(selectedCompany.company)?.description && (
                    <div>
                      <strong>{t('companyManagement', 'infoDescription')}</strong>
                      <p className="text-sm text-slate-600 mt-1">{getCompanySettings(selectedCompany.company)?.description}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              {t('companyManagement', 'inviteDialogTitle').replace('{company}', selectedCompany?.company.name ?? '')}
            </DialogTitle>
            <DialogDescription>
              {t('companyManagement', 'inviteDialogDescription')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">{t('companyManagement', 'emailLabel')}</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder={t('companyManagement', 'emailPlaceholder')}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">{t('companyManagement', 'roleLabel')}</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'seller' | 'vet' | 'load_master') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('companyManagement', 'roleLabel')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">{t('companyManagement', 'roleAdmin')}</SelectItem>
                  <SelectItem value="seller">{t('companyManagement', 'roleSeller')}</SelectItem>
                  <SelectItem value="vet">{t('companyManagement', 'roleVet')}</SelectItem>
                  <SelectItem value="load_master">{t('companyManagement', 'roleLoadMaster')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowInviteDialog(false);
                  setInviteEmail('');
                  setInviteRole('seller');
                }}
                disabled={inviteLoading}
              >
                {t('companyManagement', 'cancel')}
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={inviteLoading || !inviteEmail.trim()}
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('companyManagement', 'sending')}
                  </>
                ) : (
                  t('companyManagement', 'sendInvitation')
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CompanyManagement;
