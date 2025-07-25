import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { CompanyService, type CompanyUserRelationship } from "@/services/companyService";
import { InvitationManager } from "@/services/invitationManager";
import { useAuth } from "@/contexts/auth";
import { UserPlus, Mail, CheckCircle, Clock, XCircle, AlertCircle, Loader2, X } from "lucide-react";
import type { Tables, Database } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;
type UserRole = Database['public']['Enums']['user_role'];

interface CompanyUserRelationshipManagerProps {
  companyId: string;
  companyName: string;
  onRelationshipChange?: () => void;
  onClose?: () => void;
}

interface InviteUserFormData {
  email: string;
  role: UserRole;
}

export const CompanyUserRelationshipManager: React.FC<CompanyUserRelationshipManagerProps> = ({
  companyId,
  companyName,
  onRelationshipChange,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [relationships, setRelationships] = useState<(CompanyUserRelationship & { profiles: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteForm, setInviteForm] = useState<InviteUserFormData>({
    email: '',
    role: 'seller'
  });
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchRelationships();
  }, [companyId]);

  const fetchRelationships = async () => {
    setLoading(true);
    try {
      const { data, error } = await CompanyService.getCompanyUsers(companyId);
      if (error) throw error;
      setRelationships(data || []);
    } catch (error: any) {
      console.error('Error fetching relationships:', error);
      toast({
        title: "Error",
        description: "Failed to load company users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !inviteForm.email.trim()) {
      return;
    }

    setInviteLoading(true);

    try {
      // Check if user exists and their relationship status
      const userCheck = await InvitationManager.checkUserExists(inviteForm.email, companyId);

      if (userCheck.exists && !userCheck.needsCompanyRelationship) {
        toast({
          title: "User Already Associated",
          description: "This user is already associated with this company",
          variant: "destructive"
        });
        return;
      }

      if (userCheck.exists && userCheck.user) {
        // User exists - create direct company relationship
        const { data: relationship, error } = await CompanyService.createCompanyUserRelationship({
          company_id: companyId,
          user_id: userCheck.user.id,
          relationship_type: inviteForm.role,
          invited_by: user.id,
          status: 'active'
        });

        if (error) throw error;

        // Send company relationship notification
        await sendCompanyRelationshipNotification(inviteForm.email, inviteForm.role);

        toast({
          title: "Success",
          description: `User added to ${companyName}`,
        });
      } else {
        // User doesn't exist - create pending invitation
        const { data: invitation, error } = await CompanyService.createPendingInvitation({
          company_id: companyId,
          email: inviteForm.email.trim(),
          relationship_type: inviteForm.role,
          invited_by: user.id,
          status: 'pending'
        });

        if (error) throw error;

        // Send registration invitation
        await sendRegistrationInvitation(inviteForm.email, inviteForm.role);

        toast({
          title: "Success",
          description: `Invitation sent to ${inviteForm.email}. They will be added to the company when they register.`,
        });
      }

      setInviteForm({ email: '', role: 'seller' });
      setShowInviteDialog(false);
      fetchRelationships();
      onRelationshipChange?.();
    } catch (error: any) {
      console.error('Error inviting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to invite user",
        variant: "destructive"
      });
    } finally {
      setInviteLoading(false);
    }
  };

  const sendRegistrationInvitation = async (email: string, role: UserRole) => {
    // This would integrate with your email service
    console.log(`Sending registration invitation to ${email} for role ${role} at company ${companyName}`);
  };

  const sendCompanyRelationshipNotification = async (email: string, role: UserRole) => {
    // This would integrate with your email service
    console.log(`Sending company relationship notification to ${email} for role ${role} at company ${companyName}`);
  };

  const handleUpdateRelationshipStatus = async (relationshipId: string, status: 'active' | 'inactive') => {
    try {
      const { error } = await CompanyService.updateRelationshipStatus(relationshipId, status);
      if (error) throw error;

      toast({
        title: "Success",
        description: `Relationship ${status === 'active' ? 'activated' : 'deactivated'}`,
      });

      fetchRelationships();
      onRelationshipChange?.();
    } catch (error: any) {
      console.error('Error updating relationship status:', error);
      toast({
        title: "Error",
        description: "Failed to update relationship status",
        variant: "destructive"
      });
    }
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
        return <AlertCircle className="w-4 h-4" />;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading relationships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Company Users</h2>
          <p className="text-slate-600">Manage user relationships for {companyName}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite User to {companyName}</DialogTitle>
              <DialogDescription>
                Invite a new user or add an existing user to this company.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@example.com"
                  required
                  disabled={inviteLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={inviteForm.role}
                  onValueChange={(value: UserRole) => setInviteForm(prev => ({ ...prev, role: value }))}
                  disabled={inviteLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="vet">Veterinarian</SelectItem>
                    {/* <SelectItem value="agent">Agent</SelectItem> */}
                    <SelectItem value="load_master">Load Master</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteDialog(false)}
                  disabled={inviteLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteLoading}>
                  {inviteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Invitation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        )}
        </div>
      </div>

      <div className="space-y-4">
        {relationships.map((relationship) => (
          <Card key={relationship.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {relationship.profiles.first_name?.[0] || relationship.profiles.email?.[0] || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">
                      {relationship.profiles.first_name && relationship.profiles.last_name
                        ? `${relationship.profiles.first_name} ${relationship.profiles.last_name}`
                        : relationship.profiles.email
                      }
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4" />
                      <span>{relationship.profiles.email}</span>
                    </div>
                    {relationship.created_at && (
                      <p className="text-xs text-slate-500">
                        Invited {new Date(relationship.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline">
                    {getRoleDisplayName(relationship.relationship_type)}
                  </Badge>
                  <Badge className={getStatusColor(relationship.status)}>
                    {getStatusIcon(relationship.status)}
                    <span className="ml-1 capitalize">{relationship.status}</span>
                  </Badge>
                  
                  {relationship.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateRelationshipStatus(relationship.id, 'active')}
                    >
                      Activate
                    </Button>
                  )}
                  
                  {relationship.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateRelationshipStatus(relationship.id, 'inactive')}
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {relationships.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <UserPlus className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No users yet</h3>
              <p className="text-slate-600 mb-4">
                Start building your team by inviting users to join {companyName}.
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite First User
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyUserRelationshipManager;
