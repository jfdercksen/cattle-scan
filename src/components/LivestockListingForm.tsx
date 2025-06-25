
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const livestockListingSchema = z.object({
  owner_name: z.string().min(1, 'Owner name is required'),
  bred_or_bought: z.enum(['BRED', 'BOUGHT IN']),
  location: z.string().min(1, 'Location is required'),
  weighing_location: z.string().min(1, 'Weighing location is required'),
  loading_points_1: z.number().min(0).default(0),
  loading_points_2: z.number().min(0).default(0),
  loading_points_3: z.number().min(0).default(0),
  loading_points_4: z.number().min(0).default(0),
  loading_points_5: z.number().min(0).default(0),
  livestock_at_loading_point_1: z.number().min(0).default(0),
  livestock_at_loading_point_2: z.number().min(0).default(0),
  livestock_at_loading_point_3: z.number().min(0).default(0),
  livestock_at_loading_point_4: z.number().min(0).default(0),
  livestock_at_loading_point_5: z.number().min(0).default(0),
  total_livestock_offered: z.number().min(1, 'Must offer at least 1 livestock'),
  number_of_heifers: z.number().min(0).default(0),
  males_castrated: z.boolean().default(false),
  mothers_status: z.enum(['WITH MOTHERS', 'ALREADY WEANED']).optional(),
  weaned_duration: z.string().optional(),
  grazing_green_feed: z.boolean().default(false),
  growth_implant: z.boolean().default(false),
  growth_implant_type: z.string().optional(),
  estimated_average_weight: z.number().min(0).optional(),
  breed: z.string().min(1, 'Breed is required'),
});

type LivestockListingFormData = z.infer<typeof livestockListingSchema>;

interface LivestockListingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LivestockListingForm = ({ onClose, onSuccess }: LivestockListingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<LivestockListingFormData>({
    resolver: zodResolver(livestockListingSchema),
    defaultValues: {
      owner_name: '',
      bred_or_bought: 'BRED',
      location: '',
      weighing_location: '',
      loading_points_1: 0,
      loading_points_2: 0,
      loading_points_3: 0,
      loading_points_4: 0,
      loading_points_5: 0,
      livestock_at_loading_point_1: 0,
      livestock_at_loading_point_2: 0,
      livestock_at_loading_point_3: 0,
      livestock_at_loading_point_4: 0,
      livestock_at_loading_point_5: 0,
      total_livestock_offered: 0,
      number_of_heifers: 0,
      males_castrated: false,
      grazing_green_feed: false,
      growth_implant: false,
      breed: '',
    },
  });

  const onSubmit = async (data: LivestockListingFormData) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a listing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for insertion, ensuring all required fields are present
      const insertData = {
        seller_id: user.id,
        owner_name: data.owner_name,
        bred_or_bought: data.bred_or_bought,
        location: data.location,
        weighing_location: data.weighing_location,
        loading_points_1: data.loading_points_1,
        loading_points_2: data.loading_points_2,
        loading_points_3: data.loading_points_3,
        loading_points_4: data.loading_points_4,
        loading_points_5: data.loading_points_5,
        livestock_at_loading_point_1: data.livestock_at_loading_point_1,
        livestock_at_loading_point_2: data.livestock_at_loading_point_2,
        livestock_at_loading_point_3: data.livestock_at_loading_point_3,
        livestock_at_loading_point_4: data.livestock_at_loading_point_4,
        livestock_at_loading_point_5: data.livestock_at_loading_point_5,
        total_livestock_offered: data.total_livestock_offered,
        number_of_heifers: data.number_of_heifers,
        males_castrated: data.males_castrated,
        mothers_status: data.mothers_status || null,
        weaned_duration: data.weaned_duration || null,
        grazing_green_feed: data.grazing_green_feed,
        growth_implant: data.growth_implant,
        growth_implant_type: data.growth_implant_type || null,
        estimated_average_weight: data.estimated_average_weight || null,
        breed: data.breed,
      };

      const { error } = await supabase
        .from('livestock_listings')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Livestock listing submitted successfully!",
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting livestock listing:', error);
      toast({
        title: "Error",
        description: "Failed to submit livestock listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Livestock Listing</CardTitle>
        <CardDescription>
          Submit your livestock details to sell to Chelmar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="owner_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter owner name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bred_or_bought"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bred or Bought</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="BRED" id="bred" />
                          <Label htmlFor="bred">BRED</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="BOUGHT IN" id="bought" />
                          <Label htmlFor="bought">BOUGHT IN</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weighing_location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weighing Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter weighing location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Loading Points */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Loading Points</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((point) => (
                  <div key={point} className="space-y-2">
                    <FormField
                      control={form.control}
                      name={`loading_points_${point}` as keyof LivestockListingFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Point {point}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={field.value as number}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`livestock_at_loading_point_${point}` as keyof LivestockListingFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Livestock at Point {point}</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              value={field.value as number}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Livestock Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="total_livestock_offered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Livestock Offered</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="number_of_heifers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Heifers</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        value={field.value}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="breed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breed</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter breed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimated_average_weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Average Weight (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Options */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="males_castrated"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Males Castrated</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mothers_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mothers Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-row space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="WITH MOTHERS" id="with-mothers" />
                          <Label htmlFor="with-mothers">WITH MOTHERS</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="ALREADY WEANED" id="weaned" />
                          <Label htmlFor="weaned">ALREADY WEANED</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weaned_duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weaned Duration (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter weaned duration" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grazing_green_feed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Grazing Green Feed</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="growth_implant"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Growth Implant</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="growth_implant_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Growth Implant Type (if applicable)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter growth implant type" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
