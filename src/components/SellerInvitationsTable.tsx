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
import { useTranslation } from '@/i18n/useTranslation';

type ListingInvitation = Tables<'listing_invitations'>;
type LivestockListing = Tables<'livestock_listings'>;

type InvitationWithListing = ListingInvitation & {
  livestock_listings: Pick<LivestockListing, 'id' | 'status'>[];
};

export const SellerInvitationsTable = () => {
  const [invitations, setInvitations] = useState<InvitationWithListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const ensureHasFarms = async () => {
    if (!user) return false;
    const { count, error } = await supabase
      .from('farms')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);
    if (error) {
      console.error('Error checking farms:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('sellerDashboard', 'toastDashboardError'),
        variant: "destructive",
      });
      return false;
    }
    const hasFarms = (count ?? 0) > 0;
    if (!hasFarms) {
      toast({
        title: t('sellerDashboard', 'farmRequiredTitle'),
        description: t('sellerDashboard', 'pleaseCreateFarmFirst'),
        variant: "destructive",
      });
      navigate('/seller-dashboard?tab=farms&showFarmPrompt=true');
    }
    return hasFarms;
  };

  const formatInvitationStatus = (status: string | null | undefined) => {
    if (!status) return '';
    const normalized = status.toLowerCase();
    switch (normalized) {
      case 'pending':
        return t('sellerInvitations', 'statusPending');
      case 'accepted':
        return t('sellerInvitations', 'statusAccepted');
      case 'declined':
        return t('sellerInvitations', 'statusDeclined');
      case 'cancelled':
      case 'canceled':
        return t('sellerInvitations', 'statusCancelled');
      case 'expired':
        return t('sellerInvitations', 'statusExpired');
      default:
        return status
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  const formatListingStatus = (status: string | null | undefined) => {
    const resolved = status ?? 'Not Started';
    const normalized = resolved.toLowerCase().replace(/\s+/g, '_');

    switch (normalized) {
      case 'not_started':
        return t('sellerInvitations', 'listingStatusNotStarted');
      case 'draft':
        return t('sellerInvitations', 'listingStatusDraft');
      case 'submitted_to_vet':
        return t('sellerInvitations', 'listingStatusSubmittedToVet');
      case 'in_progress':
        return t('sellerInvitations', 'listingStatusInProgress');
      case 'completed':
        return t('sellerInvitations', 'listingStatusCompleted');
      case 'approved':
        return t('sellerInvitations', 'listingStatusApproved');
      case 'rejected':
        return t('sellerInvitations', 'listingStatusRejected');
      default:
        return resolved
          .replace(/_/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  useEffect(() => {
    const fetchInvitations = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('listing_invitations')
          .select('*, livestock_listings!livestock_listings_invitation_id_fkey(id, status)')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setInvitations(data as InvitationWithListing[] || []);
      } catch (error) {
        console.error('Error fetching invitations:', error);
        toast({
          title: t('sellerInvitations', 'fetchErrorTitle'),
          description: t('sellerInvitations', 'fetchErrorDescription'),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAcceptInvitation = async (invitation: ListingInvitation) => {
    const hasFarms = await ensureHasFarms();
    if (!hasFarms) return;
    try {
      const { error } = await supabase
        .from('listing_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      if (error) throw error;

      toast({
        title: t('sellerInvitations', 'toastSuccessTitle'),
        description: t('sellerInvitations', 'toastSuccessDescription')
      });
      
      navigate(`/seller/create-listing/${invitation.id}`);

    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: t('sellerInvitations', 'toastErrorTitle'),
        description: t('sellerInvitations', 'toastErrorDescription'),
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">{t('sellerInvitations', 'loading')}</div>
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
        <CardTitle>{t('sellerInvitations', 'title')}</CardTitle>
        <CardDescription>
          {t('sellerInvitations', 'description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('sellerInvitations', 'tableReference')}</TableHead>
              <TableHead>{t('sellerInvitations', 'tableDateSent')}</TableHead>
              <TableHead>{t('sellerInvitations', 'tableStatus')}</TableHead>
              <TableHead>{t('sellerInvitations', 'tableActions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((invitation) => {
              const listing = invitation.livestock_listings?.[0];
              const status = listing?.status || invitation.status;
              const isViewOnly = status === 'completed' || status === 'submitted_to_vet';

              return (
                <TableRow key={invitation.id}>
                  <TableCell className="font-mono">{invitation.reference_id}</TableCell>
                  <TableCell>
                    {new Date(invitation.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={status === 'pending' ? 'default' : 'secondary'}>
                      {formatInvitationStatus(invitation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invitation.status === 'pending' && !listing ? (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAcceptInvitation(invitation)}
                      >
                        {t('sellerInvitations', 'acceptInvitation')}
                      </Button>
                    ) : isViewOnly ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const hasFarms = await ensureHasFarms();
                          if (hasFarms) {
                            navigate(`/seller/listing/${listing?.id}`);
                          }
                        }}
                      >
                        {t('sellerInvitations', 'viewListing')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const hasFarms = await ensureHasFarms();
                          if (hasFarms) {
                            navigate(`/seller/create-listing/${invitation.id}`);
                          }
                        }}
                      >
                        {t('sellerInvitations', 'editListing')}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
