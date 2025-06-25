
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, UserCheck, UserX, ArrowLeft, Users, Clock, CheckCircle, XCircle, Ban, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

const Admin = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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
      console.log('Fetching profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }
      
      console.log('Fetched profiles:', data);
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

  const handleAction = async (profileId: string, action: 'approved' | 'rejected' | 'suspended') => {
    if (!user || !selectedProfile) return;
    
    setActionLoading(true);
    
    try {
      console.log(`${action} user:`, profileId);
      
      // Update profile status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          status: action,
          approved_by: action === 'approved' ? user.id : null,
          approved_at: action === 'approved' ? new Date().toISOString() : null
        })
        .eq('id', profileId);
      
      if (updateError) {
        console.error('Update error:', updateError);
        throw updateError;
      }
      
      // Log the action
      const { error: logError } = await supabase
        .from('approval_actions')
        .insert({
          profile_id: profileId,
          action_by: user.id,
          action: action,
          reason: reason || null
        });
      
      if (logError) {
        console.error('Log error:', logError);
        throw logError;
      }
      
      const actionText = action === 'approved' ? 'approved' : action === 'rejected' ? 'rejected' : 'suspended';
      toast({
        title: "Success",
        description: `User ${actionText} successfully`,
        variant: "default"
      });
      
      // Refresh profiles
      await fetchProfiles();
      setSelectedProfile(null);
      setReason('');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (profileId: string) => {
    if (!user) return;
    
    setActionLoading(true);
    
    try {
      console.log('Deleting user:', profileId);
      
      // Delete the profile (this will cascade and delete the auth user due to foreign key)
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId);
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }
      
      toast({
        title: "Success",
        description: "User deleted successfully",
        variant: "default"
      });
      
      // Refresh profiles
      await fetchProfiles();
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'suspended':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800"><Ban className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      super_admin: 'bg-purple-100 text-purple-800',
      admin: 'bg-blue-100 text-blue-800',
      seller: 'bg-green-100 text-green-800',
      vet: 'bg-teal-100 text-teal-800',
      agent: 'bg-orange-100 text-orange-800',
      driver: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <Badge variant="secondary" className={colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading || loadingProfiles) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  const pendingProfiles = profiles.filter(p => p.status === 'pending');
  const approvedProfiles = profiles.filter(p => p.status === 'approved');
  const rejectedProfiles = profiles.filter(p => p.status === 'rejected');
  const suspendedProfiles = profiles.filter(p => p.status === 'suspended');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin-dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
                <p className="text-sm text-slate-600">User Management & Approval</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Pending Approval</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-2xl font-bold text-slate-800">{pendingProfiles.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Approved Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-slate-800">{approvedProfiles.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Rejected Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-2xl font-bold text-slate-800">{rejectedProfiles.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Suspended Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Ban className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-slate-800">{suspendedProfiles.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-2xl font-bold text-slate-800">{profiles.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Profiles</CardTitle>
            <CardDescription>Review and manage user registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {profile.first_name && profile.last_name 
                            ? `${profile.first_name} ${profile.last_name}`
                            : 'No name provided'
                          }
                        </div>
                        {profile.phone && (
                          <div className="text-sm text-slate-500">{profile.phone}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{getRoleBadge(profile.role)}</TableCell>
                    <TableCell>{getStatusBadge(profile.status)}</TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {profile.status === 'pending' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => setSelectedProfile(profile)}
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Approve
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Approve User</DialogTitle>
                                  <DialogDescription>
                                    Approve {profile.first_name} {profile.last_name} ({profile.email}) as a {profile.role}?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="approve-reason">Approval Notes (Optional)</Label>
                                    <Textarea
                                      id="approve-reason"
                                      placeholder="Add any notes about this approval..."
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleAction(profile.id, 'approved')}
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? 'Processing...' : 'Approve User'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => setSelectedProfile(profile)}
                                >
                                  <UserX className="w-3 h-3 mr-1" />
                                  Reject
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Reject User</DialogTitle>
                                  <DialogDescription>
                                    Reject {profile.first_name} {profile.last_name} ({profile.email})?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reject-reason">Rejection Reason</Label>
                                    <Textarea
                                      id="reject-reason"
                                      placeholder="Please provide a reason for rejection..."
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive"
                                    onClick={() => handleAction(profile.id, 'rejected')}
                                    disabled={actionLoading || !reason.trim()}
                                  >
                                    {actionLoading ? 'Processing...' : 'Reject User'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                        
                        {profile.status === 'approved' && profile.role !== 'super_admin' && (
                          <>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                  onClick={() => setSelectedProfile(profile)}
                                >
                                  <Ban className="w-3 h-3 mr-1" />
                                  Suspend
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Suspend User</DialogTitle>
                                  <DialogDescription>
                                    Suspend {profile.first_name} {profile.last_name} ({profile.email})? This will block their access to the platform.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="suspend-reason">Suspension Reason</Label>
                                    <Textarea
                                      id="suspend-reason"
                                      placeholder="Please provide a reason for suspension..."
                                      value={reason}
                                      onChange={(e) => setReason(e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    className="bg-orange-600 hover:bg-orange-700"
                                    onClick={() => handleAction(profile.id, 'suspended')}
                                    disabled={actionLoading || !reason.trim()}
                                  >
                                    {actionLoading ? 'Processing...' : 'Suspend User'}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to permanently delete {profile.first_name} {profile.last_name} ({profile.email})? This action cannot be undone and will remove all their data from the system.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteUser(profile.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={actionLoading}
                                  >
                                    {actionLoading ? 'Deleting...' : 'Delete User'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {profile.status === 'suspended' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => setSelectedProfile(profile)}
                              >
                                <UserCheck className="w-3 h-3 mr-1" />
                                Reactivate
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reactivate User</DialogTitle>
                                <DialogDescription>
                                  Reactivate {profile.first_name} {profile.last_name} ({profile.email})? This will restore their access to the platform.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reactivate-reason">Reactivation Notes (Optional)</Label>
                                  <Textarea
                                    id="reactivate-reason"
                                    placeholder="Add any notes about this reactivation..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setSelectedProfile(null)}>
                                  Cancel
                                </Button>
                                <Button 
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleAction(profile.id, 'approved')}
                                  disabled={actionLoading}
                                >
                                  {actionLoading ? 'Processing...' : 'Reactivate User'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {(profile.status === 'rejected' || (profile.status === 'approved' && profile.role === 'super_admin')) && (
                          <Badge variant="outline" className="text-xs">
                            {profile.status === 'approved' ? 'Super Admin' : 'Rejected'}
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
      </div>
    </div>
  );
};

export default Admin;
