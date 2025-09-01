import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Form } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { LivestockCalculations } from '@/lib/calculationEngine';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

 // Types and helpers for parsing/loading points (aligned with View/Admin pages)
 type AddressLike = {
   farm_name?: string;
   district?: string;
   province?: string;
 };

 type LoadingPointDetails = {
   livestock_type?: 'CATTLE' | 'SHEEP';
   bred_or_bought?: 'BRED' | 'BOUGHT IN';
   number_of_males?: number;
   number_of_females?: number;
   males_castrated?: boolean;
 };

 type LoadingPoint = {
   details?: LoadingPointDetails;
   biosecurity?: {
     breeder_name?: string;
     is_breeder_seller?: boolean;
   };
   loading_address?: AddressLike;
   is_loading_same_as_current?: boolean;
 };

 const parseLoadingPoints = (lp: unknown): LoadingPoint[] => {
   if (!lp) return [];
   let raw: unknown = lp;
   if (typeof lp === 'string') {
     try { raw = JSON.parse(lp); } catch { return []; }
   }
   if (!Array.isArray(raw)) return [];
   return (raw as unknown[]).map((p): LoadingPoint => {
     const obj = (p && typeof p === 'object') ? (p as Record<string, unknown>) : {};
     const details = (obj.details && typeof obj.details === 'object') ? (obj.details as Record<string, unknown>) : undefined;
     const biosecurity = (obj.biosecurity && typeof obj.biosecurity === 'object') ? (obj.biosecurity as Record<string, unknown>) : undefined;
     return {
       details: details ? {
         livestock_type: details.livestock_type === 'CATTLE' || details.livestock_type === 'SHEEP' ? details.livestock_type as 'CATTLE' | 'SHEEP' : undefined,
         bred_or_bought: details.bred_or_bought === 'BRED' || details.bred_or_bought === 'BOUGHT IN' ? details.bred_or_bought as 'BRED' | 'BOUGHT IN' : undefined,
         number_of_males: typeof details.number_of_males === 'number' ? details.number_of_males as number : Number(details.number_of_males ?? 0) || 0,
         number_of_females: typeof details.number_of_females === 'number' ? details.number_of_females as number : Number(details.number_of_females ?? 0) || 0,
         males_castrated: typeof details.males_castrated === 'boolean' ? details.males_castrated as boolean : false,
       } : undefined,
       biosecurity: biosecurity ? {
         breeder_name: typeof biosecurity.breeder_name === 'string' ? biosecurity.breeder_name as string : undefined,
         is_breeder_seller: typeof biosecurity.is_breeder_seller === 'boolean' ? biosecurity.is_breeder_seller as boolean : undefined,
       } : undefined,
       loading_address: obj.loading_address as AddressLike | undefined,
       is_loading_same_as_current: typeof obj.is_loading_same_as_current === 'boolean' ? obj.is_loading_same_as_current as boolean : undefined,
     };
   });
 };

// Schema for Load Master loading details form
const loadingDetailsSchema = z.object({
  truck_registration_number: z.string().min(1, 'Truck registration number is required'),
  loading_notes: z.string().optional(),
  livestock_condition: z.string().optional(),
  actual_loading_time: z.string().optional(),
});

type LoadingDetailsFormData = z.infer<typeof loadingDetailsSchema>;

interface LoadMasterLoadingDetailsFormProps {
  listingId: string;
  listing: Tables<'livestock_listings'>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LoadMasterLoadingDetailsForm = ({ 
  listingId, 
  listing, 
  onSuccess, 
  onCancel 
}: LoadMasterLoadingDetailsFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: string;
  } | null>(null);

  const form = useForm<LoadingDetailsFormData>({
    resolver: zodResolver(loadingDetailsSchema),
    defaultValues: {
      truck_registration_number: listing.truck_registration_number || '',
      loading_notes: '',
      livestock_condition: '',
      actual_loading_time: new Date().toISOString().slice(0, 16), // Current datetime for input
    },
  });

  // Capture geolocation for loading completion
  const captureLocation = async () => {
    setIsCapturingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const locationInfo = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date().toISOString()
      };

      setLocationData(locationInfo);
      toast({
        title: 'Location Captured',
        description: `Location captured with ${Math.round(position.coords.accuracy)}m accuracy`,
      });
    } catch (error) {
      console.error('Error capturing location:', error);
      toast({
        title: 'Location Error',
        description: 'Failed to capture location. You can still complete the loading without location data.',
        variant: 'destructive',
      });
    } finally {
      setIsCapturingLocation(false);
    }
  };

  // Parse loading points and derive totals using new structure
  const parsedLoadingPoints = parseLoadingPoints(listing.loading_points as unknown);
  const totals = parsedLoadingPoints.reduce(
    (acc, p) => {
      const d = p.details;
      const males = d?.number_of_males ?? 0;
      const females = d?.number_of_females ?? 0;
      const count = males + females;
      if (d?.livestock_type === 'CATTLE') acc.totalCattle += count;
      if (d?.livestock_type === 'SHEEP') acc.totalSheep += count;
      return acc;
    },
    { totalCattle: 0, totalSheep: 0 }
  );
  const totalCattle = totals.totalCattle;
  const totalSheep = totals.totalSheep;
  const totalLivestock = totalCattle + totalSheep;
  
  const livestockType = LivestockCalculations.determineLivestockType(totalCattle, totalSheep);

  const onSubmit = async (data: LoadingDetailsFormData) => {
    setIsSubmitting(true);
    try {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      // Validate that the listing is in the correct state for loading completion
      if (!['vet_completed', 'available_for_loading', 'assigned_to_load_master'].includes(listing.status)) {
        throw new Error(`Cannot complete loading for listing with status: ${listing.status}`);
      }

      // Validate that the current user is the assigned Load Master
      if (listing.assigned_load_master_id !== currentUser?.id) {
        throw new Error('You are not authorized to complete loading for this listing');
      }
      
      // Prepare loading completion data
      const loadingCompletionData = {
        loading_notes: data.loading_notes,
        livestock_condition: data.livestock_condition,
        actual_loading_time: data.actual_loading_time,
        completed_by: currentUser?.id,
        completed_at: new Date().toISOString(),
        geolocation: locationData,
      };

      // Update the livestock listing with loading details
      const { error: updateError } = await supabase
        .from('livestock_listings')
        .update({
          truck_registration_number: data.truck_registration_number,
          status: 'loading_completed',
          loading_completion_data: loadingCompletionData
        })
        .eq('id', listingId)
        .eq('assigned_load_master_id', currentUser?.id); // Additional security check

      if (updateError) throw updateError;

      // Send notification to relevant parties (seller, admin, vet)
      await sendLoadingCompletionNotifications(listing, loadingCompletionData);

      toast({
        title: 'Success',
        description: 'Loading completed successfully. All parties have been notified.',
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting loading details:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete loading. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Send notifications when loading is completed
  const sendLoadingCompletionNotifications = async (listing: Tables<'livestock_listings'>, completionData: any) => {
    try {
      // Get company details for notification context
      const { data: company } = await supabase
        .from('companies')
        .select('name, admin_user_id')
        .eq('id', listing.company_id)
        .single();

      // Get seller details
      const { data: seller } = await supabase
        .from('profiles')
        .select('email, first_name, last_name')
        .eq('id', listing.seller_id)
        .single();

      // Get vet details if assigned
      let vet = null;
      if (listing.assigned_vet_id) {
        const { data: vetData } = await supabase
          .from('profiles')
          .select('email, first_name, last_name')
          .eq('id', listing.assigned_vet_id)
          .single();
        vet = vetData;
      }

      // Prepare notification data
      const notificationData = {
        reference_id: listing.reference_id,
        company_name: company?.name || 'Unknown Company',
        seller_name: `${seller?.first_name} ${seller?.last_name}`,
        seller_email: seller?.email,
        vet_email: vet?.email,
        truck_registration: completionData.truck_registration_number,
        completion_time: completionData.completed_at,
        loading_location: completionData.geolocation ? 
          `${completionData.geolocation.latitude}, ${completionData.geolocation.longitude}` : 
          'Location not captured'
      };

      // Log notification details (in production, this would send actual emails)
      console.log('Loading completion notifications:', {
        type: 'loading_completed',
        data: notificationData,
        recipients: {
          seller: seller?.email,
          vet: vet?.email,
          admin: company?.admin_user_id
        }
      });

      // In a production environment, you would:
      // 1. Send email to seller about loading completion
      // 2. Notify company admin about completed loading
      // 3. Notify vet about loading completion
      // 4. Create audit log entries
      // 5. Update any external tracking systems

      // Example of how this might work with Supabase Edge Functions:
      /*
      await supabase.functions.invoke('send-loading-completion-notification', {
        body: {
          type: 'loading_completed',
          ...notificationData,
          recipients: {
            seller: seller?.email,
            vet: vet?.email,
            admin_user_id: company?.admin_user_id
          }
        }
      });
      */

    } catch (error) {
      console.error('Error sending loading completion notifications:', error);
      // Don't throw error here as the main operation succeeded
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loading Details - {listing.reference_id}</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Livestock Summary */}
          <div className="mb-6 p-4 border rounded-md bg-gray-50">
            <h4 className="text-lg font-semibold mb-3">Livestock Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {totalCattle > 0 && (
                <div>
                  <p><strong>Total Cattle:</strong> {totalCattle}</p>
                </div>
              )}

              {totalSheep > 0 && (
                <div>
                  <p><strong>Total Sheep:</strong> {totalSheep}</p>
                </div>
              )}

              <div>
                <Badge variant="outline">
                  {livestockType || "No livestock"}
                </Badge>
              </div>
            </div>

            {/* Loading Points Information */}
            {parsedLoadingPoints.length > 0 && (
              <div className="mt-4">
                <h5 className="font-medium mb-3">Loading Points</h5>
                <div className="space-y-2">
                  {parsedLoadingPoints.map((point, index) => {
                    const d = point.details;
                    const males = d?.number_of_males ?? 0;
                    const females = d?.number_of_females ?? 0;
                    const total = males + females;
                    if (total <= 0) return null;
                    const isCattle = d?.livestock_type === 'CATTLE';
                    const isSheep = d?.livestock_type === 'SHEEP';
                    return (
                      <div key={index} className="p-3 bg-white border rounded-md">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium text-sm">Loading Point {index + 1}</h6>
                          <div className="flex gap-2">
                            {isCattle && (
                              <Badge variant="secondary" className="text-xs">
                                {total} Cattle
                              </Badge>
                            )}
                            {isSheep && (
                              <Badge variant="secondary" className="text-xs">
                                {total} Sheep
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          <strong>Counts:</strong> Males {males} • Females {females}
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Loading Address:</strong>{' '}
                          {point.is_loading_same_as_current
                            ? 'Same as current address'
                            : `${point.loading_address?.farm_name || 'N/A'}, ${point.loading_address?.district || 'N/A'}, ${point.loading_address?.province || 'N/A'}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Loading Details Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="truck_registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Truck Registration Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter truck registration number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actual_loading_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Loading Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>



              {/* Livestock Condition */}
              <FormField
                control={form.control}
                name="livestock_condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Livestock Condition</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the condition of the livestock during loading..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Loading Notes */}
              <FormField
                control={form.control}
                name="loading_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loading Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional notes about the loading process..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Geolocation Section */}
              <div className="border rounded-md p-4 bg-gray-50">
                <h4 className="text-sm font-medium mb-3">Location Verification</h4>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {locationData ? (
                      <div className="text-sm text-green-600">
                        ✓ Location captured: {locationData.latitude.toFixed(6)}, {locationData.longitude.toFixed(6)}
                        <br />
                        <span className="text-gray-500">
                          Accuracy: {Math.round(locationData.accuracy)}m | {new Date(locationData.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        Capture your current location to verify loading completion
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={captureLocation}
                    disabled={isCapturingLocation}
                  >
                    {isCapturingLocation ? 'Capturing...' : locationData ? 'Update Location' : 'Capture Location'}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                {onCancel && (
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Completing Loading...' : 'Complete Loading'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};