import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, LogOut, Package, Calendar, User, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadMasterLoadingDetailsForm } from "@/components/load-master/LoadMasterLoadingDetailsForm";
// Using local derived totals from loading_points.details
import ProfileCompletion from '@/components/ProfileCompletionForm';
import type { Tables } from '@/integrations/supabase/types';

type LivestockListing = Tables<'livestock_listings'> & {
    profiles?: {
        first_name: string | null;
        last_name: string | null;
        email: string;
    } | null;
    companies?: {
        name: string;
    } | null;
};

// Helpers to parse new loading_points structure and compute totals consistently
type LoadingPointDetails = {
    livestock_type?: 'CATTLE' | 'SHEEP';
    number_of_males?: number;
    number_of_females?: number;
};
type LoadingPoint = { details?: LoadingPointDetails };
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
        return {
            details: details ? {
                livestock_type: details.livestock_type === 'CATTLE' || details.livestock_type === 'SHEEP' ? details.livestock_type as 'CATTLE' | 'SHEEP' : undefined,
                number_of_males: typeof details.number_of_males === 'number' ? details.number_of_males as number : Number(details.number_of_males ?? 0) || 0,
                number_of_females: typeof details.number_of_females === 'number' ? details.number_of_females as number : Number(details.number_of_females ?? 0) || 0,
            } : undefined,
        };
    });
};
const computeTotalsFromLoadingPoints = (lp: unknown): { totalCattle: number; totalSheep: number } => {
    const points = parseLoadingPoints(lp);
    return points.reduce((acc, p) => {
        const d = p.details;
        const males = d?.number_of_males ?? 0;
        const females = d?.number_of_females ?? 0;
        const count = males + females;
        if (d?.livestock_type === 'CATTLE') acc.totalCattle += count;
        if (d?.livestock_type === 'SHEEP') acc.totalSheep += count;
        return acc;
    }, { totalCattle: 0, totalSheep: 0 });
};

const LoadMasterDashboard = () => {
    const navigate = useNavigate();
    const { user, profile, loading, signOut, needsProfileCompletion } = useAuth();
    const { toast } = useToast();

    const [assignedListings, setAssignedListings] = useState<LivestockListing[]>([]);
    const [completedListings, setCompletedListings] = useState<LivestockListing[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedListing, setSelectedListing] = useState<LivestockListing | null>(null);
    const [showLoadingForm, setShowLoadingForm] = useState(false);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            navigate('/auth');
        } else if (profile && profile.role !== 'load_master') {
            navigate('/');
        }
    }, [user, profile, loading, navigate]);

    // Fetch assigned listings for the Load Master
    useEffect(() => {
        if (user && profile?.role === 'load_master') {
            fetchAssignedListings();
        }
    }, [user, profile]);

    // Auto-refresh listings every 30 seconds
    useEffect(() => {
        if (user && profile?.role === 'load_master') {
            const interval = setInterval(() => {
                fetchAssignedListings();
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [user, profile]);

    const fetchAssignedListings = async () => {
        try {
            setLoadingData(true);

            // Get listings where Load Master is assigned and vet has completed
            const { data: listings, error } = await supabase
                .from('livestock_listings')
                .select('*')
                .eq('assigned_load_master_id', user?.id)
                .in('status', ['vet_completed', 'available_for_loading', 'assigned_to_load_master', 'loading_completed'])
                .not('assigned_vet_id', 'is', null) // Ensure vet is assigned
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch related data separately to avoid join issues
            const processedListings = await Promise.all(
                (listings || []).map(async (listing) => {
                    // Fetch seller profile
                    const { data: sellerProfile } = await supabase
                        .from('profiles')
                        .select('first_name, last_name, email')
                        .eq('id', listing.seller_id)
                        .single();

                    // Fetch company data
                    const { data: company } = listing.company_id ? await supabase
                        .from('companies')
                        .select('name')
                        .eq('id', listing.company_id)
                        .single() : { data: null };

                    return {
                        ...listing,
                        profiles: sellerProfile || null,
                        companies: company || null
                    };
                })
            );

            const assigned = processedListings.filter(l => l.status !== 'loading_completed');
            const completed = processedListings.filter(l => l.status === 'loading_completed');

            setAssignedListings(assigned);
            setCompletedListings(completed);
        } catch (error) {
            console.error('Error fetching assigned listings:', error);
            toast({
                title: 'Error',
                description: 'Failed to load assigned listings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoadingData(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const handleStartLoading = (listing: LivestockListing) => {
        setSelectedListing(listing);
        setShowLoadingForm(true);
    };

    const handleLoadingComplete = () => {
        setShowLoadingForm(false);
        setSelectedListing(null);
        fetchAssignedListings(); // Refresh the listings
        toast({
            title: 'Success',
            description: 'Loading completed successfully!',
        });
    };

    const getListingStatusBadge = (status: string) => {
        switch (status) {
            case 'vet_completed':
                return <Badge variant="secondary">Ready for Loading</Badge>;
            case 'available_for_loading':
                return <Badge variant="default">Available for Loading</Badge>;
            case 'assigned_to_load_master':
                return <Badge variant="default">Assigned to You</Badge>;
            case 'loading_completed':
                return <Badge variant="outline">Loading Completed</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatLoadingPoints = (loadingPoints: any) => {
        try {
            const parsed = parseLoadingPoints(loadingPoints);
            if (parsed.length > 0) {
                return parsed.map((point, index) => {
                    const d = point.details;
                    const total = (d?.number_of_males ?? 0) + (d?.number_of_females ?? 0);
                    if (!d?.livestock_type || total <= 0) return `Point ${index + 1}: 0`;
                    const label = d.livestock_type === 'CATTLE' ? 'cattle' : 'sheep';
                    return `Point ${index + 1}: ${total} ${label}`;
                }).join('; ');
            }
        } catch (error) {
            console.error('Error parsing loading points:', error);
        }
        return 'No loading points';
    };

    if (loading || !profile) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    if (needsProfileCompletion()) {
        return <ProfileCompletion />;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Load Master Dashboard</h1>
                        <p className="text-gray-600">Welcome back, {profile.first_name}!</p>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Package className="w-5 h-5 mr-2" />
                                Assigned Listings
                            </CardTitle>
                            <CardDescription>
                                Listings ready for loading
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{assignedListings.length}</div>
                            <p className="text-sm text-gray-600">Ready for loading</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Truck className="w-5 h-5 mr-2" />
                                Completed Loadings
                            </CardTitle>
                            <CardDescription>
                                Successfully completed loadings
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedListings.length}</div>
                            <p className="text-sm text-gray-600">Completed this period</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Status</CardTitle>
                            <CardDescription>
                                Your account status: {profile.status}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-gray-600">
                                {profile.status === 'pending' && "Your account is pending approval"}
                                {profile.status === 'approved' && "Your account is approved and active"}
                                {profile.status === 'suspended' && "Your account has been suspended"}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Listings Table */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Assigned Listings - Ready for Loading
                                </CardTitle>
                                <CardDescription>
                                    Livestock listings that have been vet-approved and assigned to you for loading
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchAssignedListings}
                                disabled={loadingData}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loadingData ? (
                            <div className="text-center py-8">Loading assigned listings...</div>
                        ) : assignedListings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No listings currently assigned for loading
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference ID</TableHead>
                                        <TableHead>Seller</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Livestock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {assignedListings.map((listing) => {
                                        const { totalCattle, totalSheep } = computeTotalsFromLoadingPoints(listing.loading_points);

                                        return (
                                            <TableRow key={listing.id}>
                                                <TableCell className="font-medium">{listing.reference_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-2" />
                                                        {listing.profiles?.first_name} {listing.profiles?.last_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{listing.companies?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {totalCattle > 0 && <div>{totalCattle} Cattle</div>}
                                                        {totalSheep > 0 && <div>{totalSheep} Sheep</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getListingStatusBadge(listing.status)}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {new Date(listing.created_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleStartLoading(listing)}
                                                        disabled={listing.status === 'loading_completed'}
                                                    >
                                                        <Truck className="w-4 h-4 mr-2" />
                                                        Start Loading
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Completed Listings Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Truck className="w-5 h-5 mr-2" />
                            Completed Loadings
                        </CardTitle>
                        <CardDescription>
                            Recently completed loading operations
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {completedListings.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No completed loadings yet
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference ID</TableHead>
                                        <TableHead>Seller</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Livestock</TableHead>
                                        <TableHead>Truck Registration</TableHead>
                                        <TableHead>Completed</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {completedListings.map((listing) => {
                                        const { totalCattle, totalSheep } = computeTotalsFromLoadingPoints(listing.loading_points);

                                        return (
                                            <TableRow key={listing.id}>
                                                <TableCell className="font-medium">{listing.reference_id}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center">
                                                        <User className="w-4 h-4 mr-2" />
                                                        {listing.profiles?.first_name} {listing.profiles?.last_name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{listing.companies?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="text-sm">
                                                        {totalCattle > 0 && <div>{totalCattle} Cattle</div>}
                                                        {totalSheep > 0 && <div>{totalSheep} Sheep</div>}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{listing.truck_registration_number || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {new Date(listing.updated_at).toLocaleDateString()}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Loading Details Dialog */}
                <Dialog open={showLoadingForm} onOpenChange={setShowLoadingForm}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Complete Loading Details</DialogTitle>
                        </DialogHeader>
                        {selectedListing && (
                            <LoadMasterLoadingDetailsForm
                                listingId={selectedListing.id}
                                listing={selectedListing}
                                onSuccess={handleLoadingComplete}
                                onCancel={() => setShowLoadingForm(false)}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default LoadMasterDashboard;