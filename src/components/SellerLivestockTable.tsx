
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Beef } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

interface SellerLivestockTableProps {
  onViewListing: (listing: LivestockListing) => void;
  onEditListing: (listing: LivestockListing) => void;
}

export const SellerLivestockTable = ({ onViewListing, onEditListing }: SellerLivestockTableProps) => {
  const [listings, setListings] = useState<LivestockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) {
        setListings([]);
        return;
      }
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('livestock_listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);
      } catch (error) {
        console.error('Error fetching livestock listings:', error);
        toast({
          title: "Error",
          description: "Failed to load livestock listings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, toast]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const checkIfCanEdit = async (listing: LivestockListing) => {
    // Check if listing has any offers
    const { data: offers, error } = await supabase
      .from('livestock_offers')
      .select('id')
      .eq('listing_id', listing.id)
      .limit(1);

    if (error) {
      console.error('Error checking offers:', error);
      return false;
    }

    // Can edit if no offers exist
    return offers.length === 0;
  };

  const handleEdit = async (listing: LivestockListing) => {
    const canEdit = await checkIfCanEdit(listing);
    if (canEdit) {
      onEditListing(listing);
    } else {
      toast({
        title: "Cannot Edit",
        description: "This listing cannot be edited because it has received offers",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading livestock listings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Beef className="w-5 h-5 mr-2" />
          My Livestock Listings
        </CardTitle>
        <CardDescription>
          View and manage your livestock listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No livestock listings found. Create your first listing to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Owner Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Total Livestock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    {listing.owner_name}
                  </TableCell>
                  <TableCell>{listing.location}</TableCell>
                  <TableCell>{listing.breed}</TableCell>
                  <TableCell>{listing.total_livestock_offered}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary" 
                      className={getStatusBadgeColor(listing.status)}
                    >
                      {listing.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(listing.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewListing(listing)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(listing)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
