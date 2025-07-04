import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { LivestockListingForm } from '@/components/LivestockListingForm';
import { useAuth } from '@/contexts/auth';
import type { Tables } from '@/integrations/supabase/types';

const CreateListingPage = () => {
  const { invitationId } = useParams<{ invitationId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invitation, setInvitation] = useState<Tables<'listing_invitations'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!invitationId || !user) {
        setLoading(false);
        return;
      }

      try {
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
          setError('Invitation not found or you do not have permission to view it.');
        }
      } catch (err: unknown) {
        setError('Failed to fetch invitation details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [invitationId, user]);

  const handleSuccess = () => {
    navigate('/seller-dashboard');
  };

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  if (!invitation) {
    return <div className="container mx-auto p-4">Invitation not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Livestock Listing</h1>
      <p className="mb-4">Complete the form below to create your listing for reference: <span className="font-mono bg-gray-100 p-1 rounded">{invitation.reference_id}</span></p>
      <LivestockListingForm invitationId={invitation.id} referenceId={invitation.reference_id} onSuccess={handleSuccess} />
    </div>
  );
};

export default CreateListingPage;
