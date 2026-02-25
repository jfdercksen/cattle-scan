import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { useCompany } from '@/contexts/companyContext';
import { CompanyService } from '@/services/companyService';
import { InvitationManager } from '@/services/invitationManager';
import { nanoid } from 'nanoid';
import type { Tables } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

type Profile = Tables<'profiles'>;

type CompanyUserOption = {
  profiles: {
    id: string;
    email: string | null;
    status?: string | null;
    seller_entity_name?: string | null;
  };
};

type TranslationFn = ReturnType<typeof useTranslation>['t'];

const buildInvitationSchema = (t: TranslationFn) =>
  z
    .object({
      seller_id: z.string().optional(),
      seller_email: z
        .string()
        .optional()
        .refine(
          (value) => {
            if (!value || value.trim() === '') {
              return true;
            }
            return /.+@.+\..+/.test(value.trim());
          },
          { message: t('adminInvitations', 'validationEmail') }
        ),
    })
    .refine(
      (data) => {
        const hasSellerId = !!data.seller_id;
        const hasEmail = !!data.seller_email && data.seller_email.trim() !== '';
        return hasSellerId || hasEmail;
      },
      {
        message: t('adminInvitations', 'validationSelectOrEmail'),
        path: ['seller_id'],
      }
    );

type InvitationFormData = z.infer<ReturnType<typeof buildInvitationSchema>>;

interface ListingInvitationFormProps {
  onSuccess: () => void;
}

export const ListingInvitationForm = ({ onSuccess }: ListingInvitationFormProps) => {
  const { user } = useAuth();
  const { currentCompany } = useCompany();
  const { toast } = useToast();
  const { t } = useTranslation();
  const invitationSchema = useMemo(() => buildInvitationSchema(t), [t]);
  const [sellers, setSellers] = useState<CompanyUserOption[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState(() => nanoid(10).toUpperCase());

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      seller_id: undefined,
      seller_email: '',
    },
  });

  useEffect(() => {
    const fetchSellers = async () => {
      if (!currentCompany) {
        setLoadingSellers(false);
        return;
      }
      
      setLoadingSellers(true);
      try {
        // Get all company users and filter for sellers with approved status
        const { data, error } = await CompanyService.getCompanyUsers(currentCompany.companyId);
        if (error) throw error;
        
        const approvedSellers = (data || [])
          .filter((user) =>
            user.relationship_type === 'seller' &&
            user.profiles?.status === 'approved' &&
            user.profiles?.id
          )
          .map((user) => ({
            profiles: {
              id: user.profiles!.id,
              email: user.profiles!.email ?? null,
              status: user.profiles!.status,
              seller_entity_name: user.profiles!.seller_entity_name,
            },
          }));

        setSellers(approvedSellers);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        toast({
          title: t('common', 'errorTitle'),
          description: t('adminInvitations', 'loadSellersError'),
          variant: 'destructive',
        });
      } finally {
        setLoadingSellers(false);
      }
    };
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCompany]);

  const onSubmit = async (data: InvitationFormData) => {
    if (!user) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('adminInvitations', 'authErrorDescription'),
        variant: 'destructive',
      });
      return;
    }

    if (!currentCompany) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('adminInvitations', 'companyRequiredDescription'),
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedSellerEmail =
        data.seller_email?.trim() ||
        sellers.find((seller) => seller.profiles.id === data.seller_id)?.profiles.email ||
        '';

      if (!selectedSellerEmail) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('adminInvitations', 'validationEmail'),
          variant: 'destructive',
        });
        return;
      }

      const { error } = await InvitationManager.createInvitation({
        seller_email: selectedSellerEmail,
        company_id: currentCompany.companyId,
        invited_by: user.id,
        reference_id: referenceId,
        listing_id: null,
      });

      if (error) throw error;

      toast({
        title: t('common', 'successTitle'),
        description: t('adminInvitations', 'invitationSuccess'),
      });
      onSuccess();
      form.reset({ seller_id: undefined, seller_email: '' });
      setReferenceId(nanoid(10).toUpperCase());
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('adminInvitations', 'invitationError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('adminInvitations', 'formTitle')}</CardTitle>
        <CardDescription>{t('adminInvitations', 'formDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>{t('adminInvitations', 'referenceLabel')}</Label>
          <Input type="text" value={referenceId} readOnly className="font-mono" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="seller_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('adminInvitations', 'selectExistingSellerLabel')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingSellers}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('adminInvitations', 'selectSellerPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sellers.map((seller) => (
                        <SelectItem key={seller.profiles.id} value={seller.profiles.id}>
                          {seller.profiles.seller_entity_name || t('adminInvitations', 'unnamedSeller')} ({seller.profiles.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center my-4 font-semibold">{t('adminInvitations', 'orSeparator')}</div>

            <FormField
              control={form.control}
              name="seller_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('adminInvitations', 'inviteByEmailLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('adminInvitations', 'emailPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? t('adminInvitations', 'submittingLabel') : t('adminInvitations', 'submitButton')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
