
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, FileText } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { supabase } from '@/integrations/supabase/client';
import { VeterinaryDeclarationForm } from '@/components/VeterinaryDeclarationForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tables } from '@/integrations/supabase/types';

const VetDashboard = () => {
  const [assignments, setAssignments] = useState<Tables<'livestock_listings'>[]>([]);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, profile, loading, signOut, needsProfileCompletion } = useAuth();

  const fetchAssignments = useCallback(async () => {
    if (!profile) return;
    const { data, error } = await supabase
      .from('livestock_listings')
      .select('*')
      .eq('assigned_vet_id', profile.id)
      .eq('status', 'submitted_to_vet');

    if (error) {
      console.error('Error fetching assignments:', error);
    } else {
      setAssignments(data || []);
    }
  }, [profile]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'vet') {
      navigate('/');
    } else if (user && profile) {
      fetchAssignments();
    }
  }, [user, profile, loading, navigate, fetchAssignments]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeclarationSuccess = () => {
    setSelectedListingId(null);
    fetchAssignments();
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  if (selectedListingId) {
    return <VeterinaryDeclarationForm listingId={selectedListingId} onSuccess={handleDeclarationSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veterinarian Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {profile.first_name}!</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Pending Declarations
              </CardTitle>
              <CardDescription>
                Livestock listings requiring your veterinary declaration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference ID</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell>{listing.reference_id}</TableCell>
                        <TableCell>{listing.owner_name}</TableCell>
                        <TableCell>{listing.location}</TableCell>
                        <TableCell className="text-right">
                          <Button onClick={() => setSelectedListingId(listing.id)}>Complete Declaration</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No pending declarations.</p>
              )}
            </CardContent>
          </Card>

          
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
