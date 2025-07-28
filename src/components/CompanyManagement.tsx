import React, { useState, useEffect } from 'react';
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
import { InvitationManager } from "@/services/invitationManager";
import { useAuth } from "@/contexts/auth";
import { Building2, Users, Settings, Plus, UserPlus, Mail, Calendar, CheckCircle, Clock, XCircle, X } from "lucide-react";
import { CompanyRegistrationForm } from "./CompanyRegistrationForm";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

// Define the structure of company settings JSON
interface CompanySettings {
  description?: string;
  phone?: string;
  registration_number?: string;
  address?: string;
  [key: string]: unknown; // Allow for additional properties
}

interface CompanyWithUsers extends Company {
  userCount: number;
  users: (CompanyUserRelationship & { profiles: Profile })[];
}

interface CompanyManagementProps {
  onClose?: () => void;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({ onClose }) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<CompanyWithUsers[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyWithUsers | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'seller' | 'vet' | 'load_master'>('seller');
  const [inviteLoading, setInviteLoading] = useState(false);

  const isSuperAdmin = profile?.role === 'super_admin';

  useEffect(() => {
    fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let companiesData: Company[] = [];

      if (isSuperAdmin) {
        // Super admin can see all companies
        const { data, error } = await CompanyService.getCompanies();
        if (error) throw error;
        companiesData = data || [];
      } else {
        // Regular users see only their companies
        const { data, error } = await CompanyService.getUserCompanies(user.id);
        if (error) throw error;
        companiesData = data || [];
      }

      // Fetch user details for each company
      const companiesWithUsers = await Promise.all(
        companiesData.map(async (company) => {
          const { data: users, error } = await CompanyService.getCompanyUsers(company.id);
          return {
            ...company,
            userCount: users?.length || 0,
            users: users || []
          };
        })
      );

      setCompanies(companiesWithUsers);
    } catch (error: any) {
      console.error('Error fetching companies:', error);
      toast({
        title: "Error",
        description: "Failed to load companies",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyCreated = (companyId: string) => {
    setShowCreateDialog(false);
    fetchCompanies();
    toast({
      title: "Success",
      description: "Company created successfully",
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
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'seller':
        return 'Seller';
      case 'vet':
        return 'Veterinarian';
      case 'agent':
        return 'Agent';
      case 'load_master':
        return 'Load Master';
      default:
        return role;
    }
  };

  const handleInviteUser = async () => {
    if (!selectedCompany || !user || !inviteEmail.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
          company_id: selectedCompany.id,
          user_id: existingUser.id,
          relationship_type: inviteRole,
          invited_by: user.id,
          status: 'pending'
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: `Invitation sent to existing user ${inviteEmail}`
        });
      } else {
        // User doesn't exist - create pending invitation record
        // This will be processed when the user eventually registers
        const { error } = await CompanyService.createPendingInvitation({
          company_id: selectedCompany.id,
          email: inviteEmail.trim(),
          relationship_type: inviteRole,
          invited_by: user.id,
          status: 'pending'
        });

        if (error) throw error;

        toast({
          title: "Success",
          description: `Invitation sent to ${inviteEmail}. They will be added to the company when they register.`
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
        title: "Error",
        description: "Failed to send invitation. Please try again.",
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
          <p className="text-slate-600">Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Company Management</h1>
          <p className="text-slate-600">
            {isSuperAdmin ? 'Manage all companies on the platform' : 'Manage your companies'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isSuperAdmin && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Company
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Create New Company</DialogTitle>
                <DialogDescription>
                  Set up a new livestock trading company on the platform.
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
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 mr-2 text-emerald-600" />
                  {company.name}
                </div>
                {company.admin_user_id === user?.id && (
                  <Badge variant="secondary">Admin</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {(company.settings as CompanySettings)?.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-slate-600">
                    <Users className="w-4 h-4 mr-1" />
                    {company.userCount} users
                  </span>
                  <span className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(company.created_at).toLocaleDateString()}
                  </span>
                </div>

                {(company.settings as CompanySettings)?.phone && (
                  <div className="text-sm text-slate-600">
                    <strong>Phone:</strong> {(company.settings as CompanySettings).phone}
                  </div>
                )}

                {(company.settings as CompanySettings)?.registration_number && (
                  <div className="text-sm text-slate-600">
                    <strong>Reg #:</strong> {(company.settings as CompanySettings).registration_number}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setSelectedCompany(company)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No companies found</h3>
            <p className="text-slate-600 mb-4">
              {isSuperAdmin 
                ? 'Create your first company to get started with the platform.'
                : 'You are not associated with any companies yet.'
              }
            </p>
            {isSuperAdmin && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Company
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
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Manage company settings and user relationships
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="users" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Company Users</h3>
                  <Button size="sm" onClick={() => setShowInviteDialog(true)}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite User
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
                          <span className="ml-1">{relationship.status}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Company Information</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Name:</strong> {selectedCompany.name}
                      </div>
                      <div>
                        <strong>Created:</strong> {new Date(selectedCompany.created_at).toLocaleDateString()}
                      </div>
                      {(selectedCompany.settings as CompanySettings)?.phone && (
                        <div>
                          <strong>Phone:</strong> {(selectedCompany.settings as CompanySettings).phone}
                        </div>
                      )}
                      {(selectedCompany.settings as CompanySettings)?.registration_number && (
                        <div>
                          <strong>Registration:</strong> {(selectedCompany.settings as CompanySettings).registration_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {(selectedCompany.settings as CompanySettings)?.address && (
                    <div>
                      <strong>Address:</strong>
                      <p className="text-sm text-slate-600 mt-1">{(selectedCompany.settings as CompanySettings).address}</p>
                    </div>
                  )}

                  {(selectedCompany.settings as CompanySettings)?.description && (
                    <div>
                      <strong>Description:</strong>
                      <p className="text-sm text-slate-600 mt-1">{(selectedCompany.settings as CompanySettings).description}</p>
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
              Invite User to {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              Invite an existing user to join this company. The user must already be registered.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="user@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteRole} onValueChange={(value: 'admin' | 'seller' | 'vet' | 'load_master') => setInviteRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="vet">Veterinarian</SelectItem>
                  <SelectItem value="load_master">Load Master</SelectItem>
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
                Cancel
              </Button>
              <Button
                onClick={handleInviteUser}
                disabled={inviteLoading || !inviteEmail.trim()}
              >
                {inviteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  'Send Invitation'
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
