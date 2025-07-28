import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvitationManager } from '@/services/invitationManager';
import { CompanyService } from '@/services/companyService';
import type { Tables } from '@/integrations/supabase/types';

interface LoadMasterAssignmentProps {
  listingId: string;
  companyId: string;
  currentStatus: string;
  assignedLoadMasterId?: string | null;
  onAssignmentComplete?: () => void;
}

type LoadMaster = Tables<'profiles'> & {
  company_user_relationships?: Array<{
    status: string;
  }>;
};

export const LoadMasterAssignment = ({ 
  listingId, 
  companyId, 
  currentStatus, 
  assignedLoadMasterId,
  onAssignmentComplete 
}: LoadMasterAssignmentProps) => {
  const { toast } = useToast();
  const [availableLoadMasters, setAvailableLoadMasters] = useState<LoadMaster[]>([]);
  const [assignedLoadMaster, setAssignedLoadMaster] = useState<LoadMaster | null>(null);
  const [selectedLoadMaster, setSelectedLoadMaster] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);

  // Check if Load Master assignment is available (vet has completed declaration)
  const canAssignLoadMaster = currentStatus === 'completed' || currentStatus === 'vet_completed' || currentStatus === 'available_for_loading';
  
  // Check if a load master is already assigned
  const isLoadMasterAssigned = currentStatus === 'assigned_to_load_master' && assignedLoadMasterId;

  const fetchAvailableLoadMasters = useCallback(async () => {
    try {
      // Get Load Masters associated with this company
      const { data: relationships, error } = await supabase
        .from('company_user_relationships')
        .select(`
          profiles (
            id,
            email,
            first_name,
            last_name,
            role,
            status
          )
        `)
        .eq('company_id', companyId)
        .eq('relationship_type', 'load_master')
        .eq('status', 'active');

      if (error) throw error;

      const loadMasters = relationships
        ?.map(rel => (rel as any).profiles)
        .filter(profile => profile && profile.role === 'load_master' && profile.status === 'approved') || [];

      setAvailableLoadMasters(loadMasters);
    } catch (error) {
      console.error('Error fetching Load Masters:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available Load Masters.',
        variant: 'destructive',
      });
    }
  }, [companyId, toast]);

  const fetchAssignedLoadMaster = useCallback(async () => {
    if (!assignedLoadMasterId) return;
    
    try {
      const { data: loadMasterData, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, role, status')
        .eq('id', assignedLoadMasterId)
        .single();

      if (error) throw error;
      
      setAssignedLoadMaster(loadMasterData as LoadMaster);
    } catch (error) {
      console.error('Error fetching assigned Load Master:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch assigned Load Master information.',
        variant: 'destructive',
      });
    }
  }, [assignedLoadMasterId, toast]);

  useEffect(() => {
    if (canAssignLoadMaster) {
      fetchAvailableLoadMasters();
    }
    if (isLoadMasterAssigned && assignedLoadMasterId) {
      fetchAssignedLoadMaster();
    }
  }, [canAssignLoadMaster, isLoadMasterAssigned, companyId, assignedLoadMasterId, fetchAvailableLoadMasters, fetchAssignedLoadMaster]);

  const handleAssignLoadMaster = async () => {
    if (!selectedLoadMaster) {
      toast({
        title: 'Error',
        description: 'Please select a Load Master to assign.',
        variant: 'destructive',
      });
      return;
    }

    setIsAssigning(true);
    try {
      // Update the listing to assign the Load Master
      const { error: updateError } = await supabase
        .from('livestock_listings')
        .update({
          assigned_load_master_id: selectedLoadMaster,
          status: 'assigned_to_load_master'
        })
        .eq('id', listingId);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Load Master assigned successfully.',
      });

      if (onAssignmentComplete) {
        onAssignmentComplete();
      }
    } catch (error) {
      console.error('Error assigning Load Master:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign Load Master. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleInviteLoadMaster = async () => {
    if (!inviteEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);
    try {
      // Get current user for invitation
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create invitation for Load Master
      const { error } = await InvitationManager.createInvitation({
        seller_email: inviteEmail,
        company_id: companyId,
        invited_by: user.id,
        reference_id: listingId,
        listing_id: listingId
      });

      if (error) throw error;

      // Also create a company relationship for the Load Master role
      const userCheck = await InvitationManager.checkUserExists(inviteEmail, companyId);
      
      if (userCheck.exists && userCheck.user) {
        // Create Load Master relationship
        await CompanyService.createCompanyUserRelationship({
          company_id: companyId,
          user_id: userCheck.user.id,
          relationship_type: 'load_master',
          invited_by: user.id,
          status: 'pending'
        });
      }

      toast({
        title: 'Success',
        description: 'Load Master invitation sent successfully.',
      });

      setInviteEmail('');
      setShowInviteForm(false);
      fetchAvailableLoadMasters(); // Refresh the list
    } catch (error) {
      console.error('Error inviting Load Master:', error);
      toast({
        title: 'Error',
        description: 'Failed to send Load Master invitation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Show assigned load master info when already assigned
  if (isLoadMasterAssigned) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Load Master Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-md bg-green-50">
              <div>
                <h4 className="font-medium text-green-800">Load Master Assigned</h4>
                {assignedLoadMaster ? (
                  <div className="text-sm text-green-600">
                    <p><strong>Name:</strong> {assignedLoadMaster.first_name} {assignedLoadMaster.last_name}</p>
                    <p><strong>Email:</strong> {assignedLoadMaster.email}</p>
                  </div>
                ) : (
                  <p className="text-sm text-green-600">Loading load master information...</p>
                )}
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800">
                Assigned
              </Badge>
            </div>
            <Badge variant="outline" className="w-full justify-center">
              Current Status: {currentStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show message when assignment is not yet available
  if (!canAssignLoadMaster) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Load Master Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-gray-500">
              Load Master assignment will be available after veterinary declaration is completed.
            </p>
            <Badge variant="outline" className="mt-2">
              Current Status: {currentStatus?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Truck className="w-5 h-5 mr-2" />
          Load Master Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableLoadMasters.length > 0 ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="load-master-select">Select Load Master</Label>
              <Select value={selectedLoadMaster} onValueChange={setSelectedLoadMaster}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a Load Master..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLoadMasters.map((loadMaster) => (
                    <SelectItem key={loadMaster.id} value={loadMaster.id}>
                      {loadMaster.first_name} {loadMaster.last_name} ({loadMaster.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleAssignLoadMaster} 
              disabled={!selectedLoadMaster || isAssigning}
              className="w-full"
            >
              {isAssigning ? 'Assigning...' : 'Assign Load Master'}
            </Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-4">
              No Load Masters available for this company.
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          {!showInviteForm ? (
            <Button 
              variant="outline" 
              onClick={() => setShowInviteForm(true)}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite New Load Master
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-email">Load Master Email</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="Enter Load Master email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleInviteLoadMaster} 
                  disabled={isInviting}
                  className="flex-1"
                >
                  {isInviting ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteEmail('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};