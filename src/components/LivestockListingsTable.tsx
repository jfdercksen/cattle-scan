
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'>;

interface LivestockListingsTableProps {
  onViewListing: (listing: LivestockListing) => void;
}

export const LivestockListingsTable = ({ onViewListing }: LivestockListingsTableProps) => {
  const [listings, setListings] = useState<LivestockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('livestock_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching livestock listings:', error);
      toast({
        title: "Error",
        description: "Failed to load livestock listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

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
        <CardTitle>Livestock Listings</CardTitle>
        <CardDescription>
          Manage livestock listings from sellers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {listings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No livestock listings found
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewListing(listing)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
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
