import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { nanoid } from 'nanoid';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

const invitationSchema = z.object({
  seller_id: z.string().optional(),
  seller_email: z.string().email('Invalid email address').optional(),
}).refine(data => data.seller_id || data.seller_email, {
  message: 'Either select a seller or enter an email',
  path: ['seller_id'],
});

type InvitationFormData = z.infer<typeof invitationSchema>;

interface ListingInvitationFormProps {
  onSuccess: () => void;
}

export const ListingInvitationForm = ({ onSuccess }: ListingInvitationFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sellers, setSellers] = useState<Profile[]>([]);
  const [loadingSellers, setLoadingSellers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [referenceId, setReferenceId] = useState(() => nanoid(10).toUpperCase());

  const form = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
  });

  useEffect(() => {
    const fetchSellers = async () => {
      setLoadingSellers(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'seller')
          .eq('status', 'approved')
          .order('company_name', { ascending: true });
        if (error) throw error;
        setSellers(data || []);
      } catch (error) {
        console.error('Error fetching sellers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load sellers.',
          variant: 'destructive',
        });
      } finally {
        setLoadingSellers(false);
      }
    };
    fetchSellers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data: InvitationFormData) => {
    if (!user) {
      toast({ title: 'Authentication Error', description: 'You must be logged in to create an invitation.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('listing_invitations')
        .insert({
          seller_id: data.seller_id || null,
          seller_email: data.seller_email || null,
          reference_id: referenceId,
          created_by: user.id,
          status: 'pending',
        });

      if (error) throw error;

      toast({ title: 'Success', description: 'Invitation sent successfully.' });
      onSuccess();
      form.reset();
      setReferenceId(nanoid(10).toUpperCase());
    } catch (error) {
      console.error('Error creating invitation:', error);
      toast({ title: 'Error', description: 'Failed to send invitation.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Listing Invitation</CardTitle>
        <CardDescription>Invite a seller to list their livestock. A unique reference ID will be generated.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Reference ID</Label>
          <Input type="text" value={referenceId} readOnly className="font-mono" />
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="seller_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select an Existing Seller</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingSellers}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a registered seller" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sellers.map(seller => (
                        <SelectItem key={seller.id} value={seller.id}>
                          {seller.company_name || 'Unnamed Seller'} ({seller.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center my-4 font-semibold">OR</div>

            <FormField
              control={form.control}
              name="seller_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite a New Seller by Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter seller's email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Sending Invitation...' : 'Send Invitation'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
