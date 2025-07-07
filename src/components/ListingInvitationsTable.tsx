import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

export type ListingInvitation = Tables<'listing_invitations'> & {
  livestock_listings: Pick<Tables<'livestock_listings'>, 'id' | 'status'>[] | null;
  company_name: string | null;
  seller_profile_email: string | null;
};

const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ListingInvitationsTableProps {
  invitations: ListingInvitation[];
  loading: boolean;
  refetch: () => void; // Add refetch prop
}

export const ListingInvitationsTable = ({ invitations, loading, refetch }: ListingInvitationsTableProps) => {
  const navigate = useNavigate();
  // Data fetching is now handled by the parent component (AdminDashboard)
  // We still need a subscription to listen for real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('detailed_listing_invitations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listing_invitations' },
        (payload) => {
          console.log('Real-time change received!', payload);
          refetch(); // Call the refetch function passed from the parent
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  if (loading) {
    return <p>Loading invitations...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Invitations</CardTitle>
        <CardDescription>A list of all livestock listing invitations that have been sent.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference ID</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Invitation Status</TableHead>
              <TableHead>Listing Status</TableHead>
              <TableHead>Date Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.length > 0 ? (
              invitations.map(invitation => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-mono">{invitation.reference_id}</TableCell>
                  <TableCell>
                    <div>{invitation.company_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{invitation.seller_email || invitation.seller_profile_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={invitation.status === 'pending' ? 'secondary' : invitation.status === 'accepted' ? 'default' : 'outline'}
                      className={invitation.status === 'accepted' ? 'bg-blue-100 text-blue-800' : ''}
                    >
                      {formatStatus(invitation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invitation.livestock_listings && invitation.livestock_listings.length > 0 && invitation.livestock_listings[0].status === 'completed' ? 'default' : 'secondary'}>
                      {formatStatus(invitation.livestock_listings && invitation.livestock_listings.length > 0 ? invitation.livestock_listings[0].status : 'Not Started')}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invitation.created_at), 'PPP')}</TableCell>
                   <TableCell>
                    {invitation.livestock_listings && invitation.livestock_listings.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/listing/${invitation.livestock_listings?.[0]?.id}`)}
                      >
                        View Listing
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">No Listing</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No invitations sent yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
