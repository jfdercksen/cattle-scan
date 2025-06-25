
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
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

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
  listing?: LivestockListing | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const LivestockListingForm = ({ listing, onClose, onSuccess }: LivestockListingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(listing?.signature_data || null);
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const isEditing = !!listing;

  const form = useForm<LivestockListingFormData>({
    resolver: zodResolver(livestockListingSchema),
    defaultValues: {
      owner_name: listing?.owner_name || '',
      bred_or_bought: (listing?.bred_or_bought as 'BRED' | 'BOUGHT IN') || 'BRED',
      location: listing?.location || '',
      weighing_location: listing?.weighing_location || '',
      loading_points_1: listing?.loading_points_1 || 0,
      loading_points_2: listing?.loading_points_2 || 0,
      loading_points_3: listing?.loading_points_3 || 0,
      loading_points_4: listing?.loading_points_4 || 0,
      loading_points_5: listing?.loading_points_5 || 0,
      livestock_at_loading_point_1: listing?.livestock_at_loading_point_1 || 0,
      livestock_at_loading_point_2: listing?.livestock_at_loading_point_2 || 0,
      livestock_at_loading_point_3: listing?.livestock_at_loading_point_3 || 0,
      livestock_at_loading_point_4: listing?.livestock_at_loading_point_4 || 0,
      livestock_at_loading_point_5: listing?.livestock_at_loading_point_5 || 0,
      total_livestock_offered: listing?.total_livestock_offered || 0,
      number_of_heifers: listing?.number_of_heifers || 0,
      males_castrated: listing?.males_castrated || false,
      mothers_status: (listing?.mothers_status as 'WITH MOTHERS' | 'ALREADY WEANED') || undefined,
      weaned_duration: listing?.weaned_duration || '',
      grazing_green_feed: listing?.grazing_green_feed || false,
      growth_implant: listing?.growth_implant || false,
      growth_implant_type: listing?.growth_implant_type || '',
      estimated_average_weight: listing?.estimated_average_weight || undefined,
      breed: listing?.breed || '',
      
      // New biosecurity fields
      breeder_name: listing?.breeder_name || '',
      is_breeder_seller: listing?.is_breeder_seller || false,
      farm_birth_address: listing?.farm_birth_address || '',
      farm_loading_address: listing?.farm_loading_address || '',
      livestock_moved_out_of_boundaries: listing?.livestock_moved_out_of_boundaries || false,
      livestock_moved_location: listing?.livestock_moved_location || '',
      
      // Declarations
      declaration_no_cloven_hooved_animals: listing?.declaration_no_cloven_hooved_animals || false,
      declaration_livestock_kept_away: listing?.declaration_livestock_kept_away || false,
      declaration_no_animal_origin_feed: listing?.declaration_no_animal_origin_feed || false,
      declaration_veterinary_products_registered: listing?.declaration_veterinary_products_registered || false,
      declaration_no_foot_mouth_disease: listing?.declaration_no_foot_mouth_disease || false,
      declaration_no_foot_mouth_disease_farm: listing?.declaration_no_foot_mouth_disease_farm || false,
      declaration_livestock_south_africa: listing?.declaration_livestock_south_africa || false,
      declaration_no_gene_editing: listing?.declaration_no_gene_editing || false,
      
      // Loading details
      number_cattle_loaded: listing?.number_cattle_loaded || 0,
      number_sheep_loaded: listing?.number_sheep_loaded || 0,
      truck_registration_number: listing?.truck_registration_number || '',
      
      // Signature
      signature_data: listing?.signature_data || '',
      signed_location: listing?.signed_location || '',
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
      // Prepare data for insertion/update with new biosecurity fields
      const submitData = {
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
        signature_date: isEditing ? listing.signature_date : new Date().toISOString(),
        signed_location: data.signed_location,
      };

      let error;
      if (isEditing) {
        // Update existing listing
        ({ error } = await supabase
          .from('livestock_listings')
          .update(submitData)
          .eq('id', listing.id));
      } else {
        // Create new listing
        ({ error } = await supabase
          .from('livestock_listings')
          .insert(submitData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Livestock listing ${isEditing ? 'updated' : 'submitted'} successfully!`,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'submitting'} livestock listing:`, error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'submit'} livestock listing. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit' : 'Create'} Livestock Listing</CardTitle>
        <CardDescription>
          {isEditing ? 'Update your livestock details and biosecurity attestation' : 'Submit your livestock details and biosecurity attestation to sell to Chelmar'}
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

            <Separator />

            {/* Livestock Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Livestock Details</h3>
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

              <div className="space-y-4 mt-4">
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
            </div>

            <Separator />

            {/* Biosecurity Declarations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Responsible Person Declarations</h3>
              <p className="text-sm text-gray-600 mb-4">
                I, the responsible person, hereby declare and affirm that:
              </p>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="declaration_no_cloven_hooved_animals"
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
                        <FormLabel className="text-sm">
                          No cloven-hooved animals other than cattle have been kept on the property during the past 12 months.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_livestock_kept_away"
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
                        <FormLabel className="text-sm">
                          The livestock have been kept away from other livestock for at least 21 days prior to dispatch.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_no_animal_origin_feed"
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
                        <FormLabel className="text-sm">
                          No feed of animal origin has been fed to the livestock.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_veterinary_products_registered"
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
                        <FormLabel className="text-sm">
                          Only veterinary products registered in terms of Act 36 of 1947 have been used on these animals.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_no_foot_mouth_disease"
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
                        <FormLabel className="text-sm">
                          No case of foot-and-mouth disease has occurred on this property during the past 12 months.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_no_foot_mouth_disease_farm"
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
                        <FormLabel className="text-sm">
                          The farm is situated outside a foot-and-mouth disease control area.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_livestock_south_africa"
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
                        <FormLabel className="text-sm">
                          The livestock have been born and raised in South Africa.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="declaration_no_gene_editing"
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
                        <FormLabel className="text-sm">
                          No gene editing or genetic modification has been performed on these animals.
                        </FormLabel>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                {isSubmitting ? (isEditing ? 'Updating...' : 'Submitting...') : (isEditing ? 'Update Listing' : 'Submit Listing')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
