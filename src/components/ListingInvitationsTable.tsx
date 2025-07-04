import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';

type ListingInvitation = {
  id: string;
  reference_id: string;
  seller_email: string | null;
  status: string;
  created_at: string;
  company_name: string | null;
  seller_profile_email: string | null;
};

interface ListingInvitationsTableProps {
  invitations: ListingInvitation[];
  loading: boolean;
  refetch: () => void; // Add refetch prop
}

export const ListingInvitationsTable = ({ invitations, loading, refetch }: ListingInvitationsTableProps) => {
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
              <TableHead>Status</TableHead>
              <TableHead>Date Sent</TableHead>
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
                      {invitation.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invitation.created_at), 'PPP')}</TableCell>
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
