import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import type { Tables } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type ListingInvitation = Tables<'listing_invitations'>;

export const SellerInvitationsTable = () => {
  const [invitations, setInvitations] = useState<ListingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('listing_invitations')
          .select('*')
          .eq('seller_id', user.id)
          // .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvitations(data || []);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        toast({
          title: "Error",
          description: "Failed to load invitations.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [user, toast]);

  const handleAcceptInvitation = async (invitation: ListingInvitation) => {
    try {
      const { error } = await supabase
        .from('listing_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation accepted. Please complete the livestock listing."
      });
      
      navigate(`/seller/create-listing/${invitation.id}`);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept the invitation.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading invitations...</div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Livestock Invitations</CardTitle>
        <CardDescription>
          Manage your invitations to list livestock.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference ID</TableHead>
              <TableHead>Date Sent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => (
              <TableRow key={invitation.id}>
                <TableCell className="font-mono">{invitation.reference_id}</TableCell>
                <TableCell>
                  {new Date(invitation.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={invitation.status === 'pending' ? 'default' : 'secondary'}>
                    {invitation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {invitation.status === 'pending' ? (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAcceptInvitation(invitation)}
                    >
                      Accept Invitation
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/seller/create-listing/${invitation.id}`)}
                    >
                      Edit Listing
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
