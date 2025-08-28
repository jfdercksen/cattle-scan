import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import type { Tables } from '@/integrations/supabase/types';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';

export type ListingInvitation = Tables<'listing_invitations'> & {
  livestock_listings: Pick<Tables<'livestock_listings'>, 'id' | 'status'>[] | null;
  company_name: string | null;
  seller_profile_email: string | null;
};

const formatStatus = (status: string | null | undefined): string => {
  if (!status) return 'N/A';
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ListingInvitationsTableProps {
  invitations: ListingInvitation[];
  loading: boolean;
  refetch: () => void; // Add refetch prop
}

export const ListingInvitationsTable = ({ invitations, loading, refetch }: ListingInvitationsTableProps) => {
  const navigate = useNavigate();
  // Data fetching is now handled by the parent component (AdminDashboard)
  // We still need a subscription to listen for real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('detailed_listing_invitations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'listing_invitations' },
        (payload) => {
          console.log('Real-time change received!', payload);
          refetch(); // Call the refetch function passed from the parent
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filters, search, and pagination state
  const [search, setSearch] = useState('');
  const [invitationStatus, setInvitationStatus] = useState<string>('all');
  const [listingStatus, setListingStatus] = useState<string>('all');
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  type SortKey = 'reference' | 'seller' | 'invitation_status' | 'listing_status' | 'date';
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  };

  // Build dynamic status options from data for robustness
  const invitationStatusOptions = useMemo(() => {
    const values = new Set<string>();
    invitations.forEach((i) => {
      if (i.status) values.add(i.status);
    });
    return Array.from(values).sort();
  }, [invitations]);

  const listingStatusOptions = useMemo(() => {
    const values = new Set<string>();
    invitations.forEach((i) => {
      const st = i.livestock_listings && i.livestock_listings.length > 0 ? i.livestock_listings[0].status ?? undefined : 'Not Started';
      if (st) values.add(st);
    });
    return Array.from(values).sort();
  }, [invitations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invitations.filter((i) => {
      // Text search across reference, company, and seller emails
      if (q) {
        const hay = `${i.reference_id ?? ''} ${(i.company_name ?? '')} ${(i.seller_email ?? '')} ${(i.seller_profile_email ?? '')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      // Invitation status filter
      if (invitationStatus !== 'all' && i.status !== invitationStatus) return false;
      // Listing status filter
      const rowListingStatus = i.livestock_listings && i.livestock_listings.length > 0 ? i.livestock_listings[0].status ?? undefined : 'Not Started';
      if (listingStatus !== 'all' && rowListingStatus !== listingStatus) return false;
      return true;
    });
  }, [invitations, search, invitationStatus, listingStatus]);

  const sorted = useMemo(() => {
    const getListingStatus = (i: ListingInvitation) => (i.livestock_listings && i.livestock_listings.length > 0 ? i.livestock_listings[0].status ?? undefined : 'Not Started');
    const getSeller = (i: ListingInvitation) => i.seller_email || i.seller_profile_email || '';
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      switch (sortKey) {
        case 'reference':
          av = a.reference_id ?? '';
          bv = b.reference_id ?? '';
          break;
        case 'seller':
          av = getSeller(a);
          bv = getSeller(b);
          break;
        case 'invitation_status':
          av = a.status ?? '';
          bv = b.status ?? '';
          break;
        case 'listing_status':
          av = getListingStatus(a) ?? '';
          bv = getListingStatus(b) ?? '';
          break;
        case 'date':
          av = new Date(a.created_at).getTime();
          bv = new Date(b.created_at).getTime();
          break;
      }
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));

  // Reset to first page when filters change or rows per page changes
  useEffect(() => {
    setPage(1);
  }, [search, invitationStatus, listingStatus, rowsPerPage]);

  // Clamp page when total pages changes
  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  if (loading) {
    return <p>Loading invitations...</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sent Invitations</CardTitle>
        <CardDescription>A list of all livestock listing invitations that have been sent.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Toolbar: search and filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Input
              placeholder="Search by reference, company, or seller email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-[360px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label className="text-sm">Invitation</Label>
              <Select value={invitationStatus} onValueChange={setInvitationStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Invitation status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {invitationStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Listing</Label>
              <Select value={listingStatus} onValueChange={setListingStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Listing status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {listingStatusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatStatus(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">Rows</Label>
              <Select value={String(rowsPerPage)} onValueChange={(v) => setRowsPerPage(Number(v))}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto font-semibold hover:bg-transparent"
                  onClick={() => toggleSort('reference')}
                >
                  Reference ID
                  {sortKey === 'reference' ? (
                    sortDir === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto font-semibold hover:bg-transparent"
                  onClick={() => toggleSort('seller')}
                >
                  Seller
                  {sortKey === 'seller' ? (
                    sortDir === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto font-semibold hover:bg-transparent"
                  onClick={() => toggleSort('invitation_status')}
                >
                  Invitation Status
                  {sortKey === 'invitation_status' ? (
                    sortDir === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto font-semibold hover:bg-transparent"
                  onClick={() => toggleSort('listing_status')}
                >
                  Listing Status
                  {sortKey === 'listing_status' ? (
                    sortDir === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-0 h-auto font-semibold hover:bg-transparent"
                  onClick={() => toggleSort('date')}
                >
                  Date Sent
                  {sortKey === 'date' ? (
                    sortDir === 'asc' ? <ChevronUp className="ml-2 h-3.5 w-3.5" /> : <ChevronDown className="ml-2 h-3.5 w-3.5" />
                  ) : (
                    <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length > 0 ? (
              paginated.map(invitation => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-mono">{invitation.reference_id}</TableCell>
                  <TableCell>
                    <div>{invitation.company_name || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">{invitation.seller_email || invitation.seller_profile_email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={invitation.status === 'pending' ? 'secondary' : invitation.status === 'accepted' ? 'default' : 'outline'}
                      className={invitation.status === 'accepted' ? 'bg-blue-100 text-blue-800' : ''}
                    >
                      {formatStatus(invitation.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={invitation.livestock_listings && invitation.livestock_listings.length > 0 && invitation.livestock_listings[0].status === 'completed' ? 'default' : 'secondary'}>
                      {formatStatus(invitation.livestock_listings && invitation.livestock_listings.length > 0 ? invitation.livestock_listings[0].status : 'Not Started')}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(invitation.created_at), 'PPP')}</TableCell>
                   <TableCell>
                    {invitation.livestock_listings && invitation.livestock_listings.length > 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/listing/${invitation.livestock_listings?.[0]?.id}`)}
                      >
                        View Listing
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-500">No Listing</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No invitations found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {/* Pagination controls */}
        {totalItems > 0 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="px-2 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
