import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { LivestockListingFormData } from '@/lib/schemas/livestockListingSchema';

interface VetProfile {
  id: string;
  first_name: string;
  last_name: string;
}

export const VetSelectionSection = () => {
  const form = useFormContext<LivestockListingFormData>();
  const [vets, setVets] = useState<VetProfile[]>([]);
  const [isLoadingVets, setIsLoadingVets] = useState(false);
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    const fetchVets = async () => {
      setIsLoadingVets(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'vet');

        if (error) {
          throw error;
        }
        setVets(data || []);
      } catch (error) {
        console.error('Error fetching vets:', error);
      } finally {
        setIsLoadingVets(false);
      }
    };

    fetchVets();
  }, []);

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Assign Veterinarian</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="assigned_vet_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a Veterinarian</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingVets}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingVets ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : vets.length > 0 ? (
                    vets.map((vet) => (
                      <SelectItem key={vet.id} value={vet.id}>
                        {`${vet.first_name} ${vet.last_name}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-vets" disabled>No vets available to select.</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="button" variant="outline" onClick={() => setShowInvite(!showInvite)}>
          {showInvite ? 'Cancel Invitation' : 'Invite a New Vet'}
        </Button>

        {showInvite && (
          <FormField
            control={form.control}
            name="invited_vet_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vet's Email to Invite</FormLabel>
                <FormControl>
                  <Input placeholder="Enter vet's email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
      </div>
    </div>
  );
};
