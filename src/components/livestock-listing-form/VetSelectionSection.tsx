import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';
import { useAuth } from '@/contexts/auth';
import { useCompany } from '@/contexts/companyContext';
import { CompanyService } from '@/services/companyService';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

type Profile = Tables<'profiles'>;
type CompanyUser = { profiles: Profile };

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
}

export const VetSelectionSection = () => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const form = useFormContext<LivestockListingFormData>();
  const { t } = useTranslation();
  const [vets, setVets] = useState<CompanyUser[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [invitationSent, setInvitationSent] = useState(false);

  useEffect(() => {
    const fetchVets = async () => {
      if (!currentCompany) {
        setIsLoadingVets(false);
        return;
      }
      
      setIsLoadingVets(true);
      try {
        // For sellers, we'll fetch vets differently since they don't have admin access
        // We'll get vets from the profiles table with approved status and vet role
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('role', 'vet')
          .eq('status', 'approved');

        if (error) throw error;
        
        // Transform to match the expected CompanyUser structure
        const transformedVets = (data || []).map(vet => ({
          profiles: {
            id: vet.id,
            first_name: vet.first_name,
            last_name: vet.last_name,
            email: vet.email
          }
        }));
        
        setVets(transformedVets as CompanyUser[]);
      } catch (error) {
        console.error('Error fetching vets:', error);
        toast({
          title: t('common', 'errorTitle'),
          description: t('vetSelection', 'loadVetsErrorDescription'),
          variant: 'destructive',
        });
      } finally {
        setIsLoadingVets(false);
      }
    };
    
    fetchVets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany]);

  const handleInviteVet = async () => {
    const email = form.getValues('invited_vet_email');
    if (!email || !user || !currentCompany) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('vetSelection', 'missingEmailDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsInviting(true);
    try {
      await CompanyService.inviteUser(
        currentCompany.companyId,
        email,
        'vet'
      );

      toast({
        title: t('common', 'successTitle'),
        description: t('vetSelection', 'inviteSuccessDescription'),
      });

      // Mark invitation as sent (keep email field populated for validation)
      setInvitationSent(true);
      setShowInvite(false);
      
      // Refresh the vets list to include any existing users that were just invited
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('role', 'vet')
        .eq('status', 'approved');

      if (!error) {
        const transformedVets = (data || []).map(vet => ({
          profiles: {
            id: vet.id,
            first_name: vet.first_name,
            last_name: vet.last_name,
            email: vet.email
          }
        }));
        setVets(transformedVets as CompanyUser[]);
      }
    } catch (error) {
      console.error('Error inviting vet:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('vetSelection', 'inviteErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{t('vetSelection', 'heading')}</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="assigned_vet_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('vetSelection', 'selectLabel')}</FormLabel>
              <Select onValueChange={field.onChange}
                value={field.value}
                disabled={isLoadingVets}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('vetSelection', 'selectPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVets ? (
                    <SelectItem value="loading" disabled>
                      {t('vetSelection', 'loadingOption')}
                    </SelectItem>
                  ) : vets.length > 0 ? (
                    vets.map((vet) => (
                      <SelectItem key={vet.profiles.id} value={vet.profiles.id}>
                        {`${vet.profiles.first_name || ''} ${vet.profiles.last_name || ''}`.trim() || t('vetSelection', 'unnamedVet')} ({vet.profiles.email})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-vets" disabled>
                      {t('vetSelection', 'noVetsOption')}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="button" variant="outline" onClick={() => setShowInvite(!showInvite)}>
          {showInvite
            ? t('vetSelection', 'inviteToggleCancel')
            : t('vetSelection', 'inviteToggleInvite')}
        </Button>

        {showInvite && (
          <div className="space-y-4 p-4 border rounded-md bg-gray-50">
            <FormField
              control={form.control}
              name="invited_vet_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('vetSelection', 'inviteSectionTitle')}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder={t('vetSelection', 'emailPlaceholder')}
                        {...field}
                        disabled={invitationSent}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      onClick={handleInviteVet}
                      disabled={isInviting || !field.value || invitationSent}
                    >
                      {invitationSent
                        ? t('vetSelection', 'invitationSentButton')
                        : isInviting
                          ? t('common', 'sending')
                          : t('vetSelection', 'sendInviteButton')}
                    </Button>
                  </div>
                  {invitationSent && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {t('vetSelection', 'invitationSentMessage').replace('{email}', field.value)}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
