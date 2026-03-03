import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LivestockListingForm } from '@/components/LivestockListingForm';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

const CreateListingPage = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<Tables<'listing_invitations'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId || !user) {
        setLoading(false);
        return;
      }

      try {
        if (user.email) {
          try {
            await supabase.rpc('link_listing_invitations_for_user' as any, {
              user_id: user.id,
              user_email: user.email,
            });
          } catch (linkError) {
            console.warn('Failed to link invitations by email:', linkError);
          }
        }

        const { count, error: farmError } = await supabase
          .from('farms')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', user.id);
        if (farmError) throw farmError;
        if ((count ?? 0) === 0) {
          toast({
            title: t('sellerDashboard', 'farmRequiredTitle'),
            description: t('sellerDashboard', 'farmRequiredDescription'),
            variant: "destructive",
          });
          navigate('/seller-dashboard?tab=farms&showFarmPrompt=true');
          return;
        }

        const { data, error } = await supabase
          .from('listing_invitations')
          .select('*')
          .eq('id', invitationId)
          .eq('seller_id', user.id) // Security check: ensure the invitation belongs to the current user
          .single();

        if (error) throw new Error(error.message);
        
        if (data) {
          setInvitation(data);
        } else {
          setError(t('createListingPage', 'invitationNotFound'));
        }
      } catch (err: unknown) {
        setError(t('createListingPage', 'fetchError'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, user, navigate, toast, t]);

  const handleSuccess = () => {
    navigate('/seller-dashboard');
  };

  if (loading) {
    return <div className="container mx-auto p-4">{t('common', 'loading')}</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-red-500">
        {t('common', 'error')}: {error}
      </div>
    );
  }

  if (!invitation) {
    return <div className="container mx-auto p-4">{t('createListingPage', 'invitationMissing')}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t('createListingPage', 'title')}</h1>
      <p className="mb-4">
        {t('createListingPage', 'description').replace('{reference}', invitation.reference_id)}{' '}
        <span className="font-mono bg-gray-100 p-1 rounded">{invitation.reference_id}</span>
      </p>
      <LivestockListingForm invitationId={invitation.id} referenceId={invitation.reference_id} onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateListingPage;
