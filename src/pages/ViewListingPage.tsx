import { useEffect, useState, ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, Json } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type LivestockListing = Tables<'livestock_listings'>;

interface Address {
  farm_name: string;
  district: string;
  province: string;
}

const formatStatus = (status: string) => {
  if (!status) return '';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const DetailItem = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between py-2 border-b">
    <span className="font-semibold text-gray-600">{label}</span>
    <span className="text-gray-800 text-right">{value}</span>
  </div>
);

const BooleanDisplay = ({ value }: { value: boolean | null | undefined }) => (
  <span className={value ? 'text-green-600' : 'text-red-600'}>{value ? 'Yes' : 'No'}</span>
);

const AddressDisplay = ({ address }: { address: Json | null | undefined }) => {
  if (address && typeof address === 'object' && !Array.isArray(address)) {
    const { farm_name, district, province } = address;
    if (typeof farm_name === 'string' && typeof district === 'string' && typeof province === 'string') {
      return <>{`${farm_name}, ${district}, ${province}`}</>;
    }
  }
  return <>N/A</>;
};

export const ViewListingPage = () => {
  const navigate = useNavigate();
  const { listingId } = useParams<{ listingId: string }>();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;

      try {
        const { data, error } = await supabase
          .from('livestock_listings')
          .select('*')
          .eq('id', listingId)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  if (loading) {
    return <div className="text-center p-4">Loading listing details...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  if (!listing) {
    return <div className="text-center p-4">Listing not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Reference ID: {listing.reference_id}</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <Badge variant={listing.status === 'completed' ? 'default' : 'secondary'}>
                    {formatStatus(listing.status ?? '')}
                </Badge>
                <Button onClick={() => navigate(-1)}>Back</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['item-1', 'item-2', 'item-3', 'item-4', 'item-5']} className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>General Information</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Owner Name" value={listing.owner_name} />
                <DetailItem label="Livestock Type" value={listing.livestock_type} />
                <DetailItem label="Bred or Bought" value={listing.bred_or_bought} />
                <DetailItem label="Breed" value={listing.breed} />
                <DetailItem label="Breeder Name" value={listing.breeder_name} />
                <DetailItem label="Is Breeder the Seller?" value={<BooleanDisplay value={listing.is_breeder_seller} />} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Livestock Details</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Total Livestock Offered" value={listing.total_livestock_offered} />
                <DetailItem label="Number of Heifers" value={listing.number_of_heifers} />
                <DetailItem label="Males Castrated" value={<BooleanDisplay value={listing.males_castrated} />} />
                <DetailItem label="Mother's Status" value={listing.mothers_status} />
                <DetailItem label="Weaned Duration" value={listing.weaned_duration} />
                <DetailItem label="Estimated Average Weight (kg)" value={listing.estimated_average_weight} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>Health & Treatment</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Grazing on Green Feed" value={<BooleanDisplay value={listing.grazing_green_feed} />} />
                <DetailItem label="Growth Implant Used" value={<BooleanDisplay value={listing.growth_implant} />} />
                {listing.growth_implant && <DetailItem label="Growth Implant Type" value={listing.growth_implant_type} />}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Location & Movement</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Birth Farm Address" value={<AddressDisplay address={listing.farm_birth_address} />} />
                <DetailItem label="Location" value={listing.location} />
                <DetailItem label="Is Loading at Birth Farm?" value={<BooleanDisplay value={listing.is_loading_at_birth_farm} />} />
                {!listing.is_loading_at_birth_farm && <DetailItem label="Loading Farm Address" value={<AddressDisplay address={listing.farm_loading_address} />} />}
                <DetailItem label="Livestock Moved Out of Boundaries" value={<BooleanDisplay value={listing.livestock_moved_out_of_boundaries} />} />
                {listing.livestock_moved_out_of_boundaries && <DetailItem label="Moved Location" value={<AddressDisplay address={listing.livestock_moved_location} />} />}
                <DetailItem label="Weighing Location" value={listing.weighing_location} />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Declarations</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="No other cloven-hooved animals on the truck" value={<BooleanDisplay value={listing.declaration_no_cloven_hooved_animals} />} />
                <DetailItem label="Livestock kept away from others" value={<BooleanDisplay value={listing.declaration_livestock_kept_away} />} />
                <DetailItem label="No animal origin feed" value={<BooleanDisplay value={listing.declaration_no_animal_origin_feed} />} />
                <DetailItem label="Veterinary products registered" value={<BooleanDisplay value={listing.declaration_veterinary_products_registered} />} />
                <DetailItem label="No Foot and Mouth Disease symptoms" value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease} />} />
                <DetailItem label="No Foot and Mouth Disease on farm" value={<BooleanDisplay value={listing.declaration_no_foot_mouth_disease_farm} />} />
                <DetailItem label="Livestock from South Africa" value={<BooleanDisplay value={listing.declaration_livestock_south_africa} />} />
                <DetailItem label="No gene editing or cloning" value={<BooleanDisplay value={listing.declaration_no_gene_editing} />} />
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-6">
              <AccordionTrigger>Loading Information</AccordionTrigger>
              <AccordionContent>
                <DetailItem label="Number of Cattle Loaded" value={listing.number_cattle_loaded} />
                <DetailItem label="Number of Sheep Loaded" value={listing.number_sheep_loaded} />
                <DetailItem label="Truck Registration Number" value={listing.truck_registration_number} />
                {listing.signature_data && (
                  <div className="py-2">
                    <span className="font-semibold text-gray-600">Signature</span>
                    <div className="mt-2 border rounded-md p-2 bg-gray-50">
                      <img src={listing.signature_data as string} alt="Signature" className="mx-auto" />
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};
