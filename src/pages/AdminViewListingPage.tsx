import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type LivestockListing = Tables<'livestock_listings'>;
type VeterinaryDeclaration = Tables<'veterinary_declarations'>;

const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const DetailItem = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div className="grid grid-cols-2 gap-4">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-sm text-gray-900">{value ?? 'N/A'}</p>
  </div>
);

const formatLocation = (location: string | null | undefined): string => {
  if (!location) return 'N/A';
  return location.split('|').join(', ');
};

const formatFarmAddress = (address: string | null | undefined): string => {
  if (!address) return 'N/A';
  try {
    const parsedAddress = JSON.parse(address);
    const { farm_name, district, province } = parsedAddress;
    return [farm_name, district, province].filter(Boolean).join(', ');
  } catch (error) {
    // Fallback for improperly formatted JSON or plain string
    return address;
  }
};

const YesNoDisplay = ({ label, value }: { label: string; value: boolean | null | undefined }) => (
    <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <Badge variant={value ? 'default' : 'destructive'}>{value ? 'Yes' : 'No'}</Badge>
    </div>
);

export const AdminViewListingPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<LivestockListing | null>(null);
  const [declaration, setDeclaration] = useState<VeterinaryDeclaration | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListingAndDeclaration = async () => {
      if (!listingId) return;

      setLoading(true);

      const { data: listingData, error: listingError } = await supabase
        .from('livestock_listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) {
        console.error('Error fetching listing:', listingError);
      } else {
        setListing(listingData);
      }

      const { data: declarationData, error: declarationError } = await supabase
        .from('veterinary_declarations')
        .select('*')
        .eq('reference_id', listingId)
        .single();

      if (declarationError && declarationError.code !== 'PGRST116') { // Ignore 'single row not found' error
        console.error('Error fetching declaration:', declarationError);
      } else {
        setDeclaration(declarationData);
      }

      setLoading(false);
    };

    fetchListingAndDeclaration();
  }, [listingId]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!listing) {
    return <div className="p-6">Listing not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8">
      <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Listing Details</CardTitle>
              <CardDescription>Reference ID: {listing.reference_id}</CardDescription>
            </div>
            <Badge variant="outline">{formatStatus(listing.status)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
            <DetailItem label="Owner Name" value={listing.owner_name} />
            <DetailItem label="Location" value={formatLocation(listing.location)} />
            <DetailItem label="Farm Loading Address" value={formatFarmAddress(listing.farm_loading_address)} />
            <Separator />
            <DetailItem label="Cattle Loaded" value={listing.number_cattle_loaded} />
            <DetailItem label="Sheep Loaded" value={listing.number_sheep_loaded} />
        </CardContent>
      </Card>

      {declaration ? (
        <Card>
          <CardHeader>
            <CardTitle>Veterinary Declaration</CardTitle>
            <CardDescription>Declaration submitted for this listing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <DetailItem label="Veterinarian Name" value={declaration.veterinarian_name} />
            <DetailItem label="Registration Number" value={declaration.veterinarian_registration_number} />
            <Separator />
            <YesNoDisplay label="Cattle Visually Inspected" value={declaration.cattle_visually_inspected} />
            <YesNoDisplay label="Cattle Mouthed" value={declaration.cattle_mouthed} />
            <YesNoDisplay label="Sheep Visually Inspected" value={declaration.sheep_visually_inspected} />
            <YesNoDisplay label="Sheep Mouthed" value={declaration.sheep_mouthed} />
            <Separator />
            <YesNoDisplay label="Foot and Mouth Symptoms" value={declaration.foot_and_mouth_symptoms} />
            <YesNoDisplay label="Lumpy Skin Disease Symptoms" value={declaration.lumpy_skin_disease_symptoms} />
            <YesNoDisplay label="No Foot and Mouth case in 10km" value={declaration.foot_and_mouth_case_in_10km} />
            <YesNoDisplay label="No Rift Valley Fever case in 10km" value={declaration.rift_valley_fever_case_in_10km} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Veterinary Declaration</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No veterinary declaration has been submitted for this listing yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
