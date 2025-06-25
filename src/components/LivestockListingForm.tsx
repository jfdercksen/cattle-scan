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
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SignaturePad } from './SignaturePad';

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
  
  // New biosecurity fields
  breeder_name: z.string().min(1, 'Breeder name is required'),
  is_breeder_seller: z.boolean().default(false),
  farm_birth_address: z.string().min(1, 'Farm birth address is required'),
  farm_loading_address: z.string().min(1, 'Farm loading address is required'),
  livestock_moved_out_of_boundaries: z.boolean().default(false),
  livestock_moved_location: z.string().optional(),
  
  // Responsible person declarations
  declaration_no_cloven_hooved_animals: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_livestock_kept_away: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_animal_origin_feed: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_veterinary_products_registered: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_foot_mouth_disease: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_foot_mouth_disease_farm: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_livestock_south_africa: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  declaration_no_gene_editing: z.boolean().refine(val => val === true, 'This declaration must be accepted'),
  
  // Livestock loading details
  number_cattle_loaded: z.number().min(0).default(0),
  number_sheep_loaded: z.number().min(0).default(0),
  truck_registration_number: z.string().min(1, 'Truck registration number is required'),
  
  // Signature validation
  signature_data: z.string().min(1, 'Digital signature is required'),
  signed_location: z.string().min(1, 'Signed location is required'),
});

type LivestockListingFormData = z.infer<typeof livestockListingSchema>;

interface LivestockListingFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LivestockListingForm = ({ onClose, onSuccess }: LivestockListingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const { user, profile } = useAuth();
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
      
      // New biosecurity fields
      breeder_name: '',
      is_breeder_seller: false,
      farm_birth_address: '',
      farm_loading_address: '',
      livestock_moved_out_of_boundaries: false,
      livestock_moved_location: '',
      
      // Declarations
      declaration_no_cloven_hooved_animals: false,
      declaration_livestock_kept_away: false,
      declaration_no_animal_origin_feed: false,
      declaration_veterinary_products_registered: false,
      declaration_no_foot_mouth_disease: false,
      declaration_no_foot_mouth_disease_farm: false,
      declaration_livestock_south_africa: false,
      declaration_no_gene_editing: false,
      
      // Loading details
      number_cattle_loaded: 0,
      number_sheep_loaded: 0,
      truck_registration_number: '',
      
      // Signature
      signature_data: '',
      signed_location: '',
    },
  });

  const onSubmit = async (data: LivestockListingFormData) => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a listing",
        variant: "destructive",
      });
      return;
    }

    if (!signature) {
      toast({
        title: "Error",
        description: "Digital signature is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for insertion with new biosecurity fields
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
        
        // New biosecurity fields
        responsible_person_name: `${profile.first_name} ${profile.last_name}`,
        responsible_person_designation: profile.role,
        breeder_name: data.breeder_name,
        is_breeder_seller: data.is_breeder_seller,
        farm_birth_address: data.farm_birth_address,
        farm_loading_address: data.farm_loading_address,
        livestock_moved_out_of_boundaries: data.livestock_moved_out_of_boundaries,
        livestock_moved_location: data.livestock_moved_location || null,
        
        // Declarations
        declaration_no_cloven_hooved_animals: data.declaration_no_cloven_hooved_animals,
        declaration_livestock_kept_away: data.declaration_livestock_kept_away,
        declaration_no_animal_origin_feed: data.declaration_no_animal_origin_feed,
        declaration_veterinary_products_registered: data.declaration_veterinary_products_registered,
        declaration_no_foot_mouth_disease: data.declaration_no_foot_mouth_disease,
        declaration_no_foot_mouth_disease_farm: data.declaration_no_foot_mouth_disease_farm,
        declaration_livestock_south_africa: data.declaration_livestock_south_africa,
        declaration_no_gene_editing: data.declaration_no_gene_editing,
        
        // Loading details
        number_cattle_loaded: data.number_cattle_loaded,
        number_sheep_loaded: data.number_sheep_loaded,
        truck_registration_number: data.truck_registration_number,
        
        // Signature
        signature_data: signature,
        signature_date: new Date().toISOString(),
        signed_location: data.signed_location,
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
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>Create Livestock Listing</CardTitle>
        <CardDescription>
          Submit your livestock details and biosecurity attestation to sell to Chelmar
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Responsible Person Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Responsible Person Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-700">{profile?.first_name} {profile?.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Designation</Label>
                  <p className="text-sm text-gray-700">{profile?.role}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Company</Label>
                  <p className="text-sm text-gray-700">{profile?.company_name || 'Not specified'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-700">{profile?.email}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Basic Livestock Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
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
            </div>

            {/* Supplier Identity & Location */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Supplier Identity & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breeder_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breeder Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter breeder name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_breeder_seller"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Is the breeder the seller?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="farm_birth_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Birth Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter farm birth address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="farm_loading_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Farm Loading Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter farm loading address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="livestock_moved_out_of_boundaries"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mt-1"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Has livestock been moved out of property boundaries?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('livestock_moved_out_of_boundaries') && (
                  <FormField
                    control={form.control}
                    name="livestock_moved_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location where livestock was moved</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location details" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <Separator />

            {/* Livestock Loading Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Livestock Loading Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="number_cattle_loaded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Cattle Loaded</FormLabel>
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

                <FormField
                  control={form.control}
                  name="number_sheep_loaded"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Sheep Loaded</FormLabel>
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

                <FormField
                  control={form.control}
                  name="truck_registration_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Truck Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter truck registration" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Signature Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Digital Signature</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SignaturePad 
                    onSignatureChange={(sig) => {
                      setSignature(sig);
                      form.setValue('signature_data', sig || '');
                    }}
                    signature={signature}
                  />
                </div>
                <div>
                  <FormField
                    control={form.control}
                    name="signed_location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location of Signing</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location where signed" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !signature}>
                {isSubmitting ? 'Submitting...' : 'Submit Listing'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
