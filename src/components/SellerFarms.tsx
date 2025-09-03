import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Trash2 } from 'lucide-react';

// The farms.address will be stored as: FarmName|District|Province|PostalCode|Country
// We'll assemble the pipe-separated structure when inserting so we can populate required columns (city, province)

type Farm = Tables<'farms'>;

function buildPipedAddress(
  farmName: string,
  district: string,
  province: string,
  postalCode: string,
  country: string
) {
  return [farmName, district, province, postalCode, country].map(p => (p ?? '').trim()).join('|');
}

function displayAddress(address: string) {
  return address
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
}

export default function SellerFarms() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [addrFarmName, setAddrFarmName] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  // If the structured farm name is empty, default it from the main Name field for convenience
  useEffect(() => {
    if (!addrFarmName && name) {
      setAddrFarmName(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    const loadFarms = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('farms')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setFarms(data || []);
      } catch (err) {
        console.error('Failed to load farms', err);
        toast({ title: 'Error', description: 'Failed to load your farms.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
  }, [user, toast]);

  const handleDeleteFarm = async (farm: Farm) => {
    if (!user) return;
    const confirmed = window.confirm(`Delete farm "${farm.name}"? This cannot be undone.`);
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farm.id)
        .eq('owner_id', user.id);
      if (error) throw error;
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
      toast({ title: 'Deleted', description: 'Farm removed.' });
    } catch (err) {
      console.error('Failed to delete farm', err);
      toast({ title: 'Error', description: 'Failed to delete farm.', variant: 'destructive' });
    }
  };

  const onAddFarm = async () => {
    if (!user) return;
    const usedFarmName = (addrFarmName || name).trim();
    if (!name.trim()) {
      toast({ title: 'Missing info', description: 'Please provide Farm Name.', variant: 'destructive' });
      return;
    }
    if (!usedFarmName || !district.trim() || !province.trim() || !postalCode.trim() || !country.trim()) {
      toast({ title: 'Missing info', description: 'Please fill all address fields.', variant: 'destructive' });
      return;
    }

    const assembledAddress = buildPipedAddress(usedFarmName, district, province, postalCode, country);

    setSaving(true);
    try {
      const { error } = await supabase.from('farms').insert({
        owner_id: user.id,
        name: name.trim(),
        address: assembledAddress,
        city: district,
        province: province,
        postal_code: postalCode || null,
      });
      if (error) throw error;
      toast({ title: 'Saved', description: 'Farm captured successfully.' });
      setName('');
      setAddrFarmName('');
      setDistrict('');
      setProvince('');
      setPostalCode('');
      setCountry('');
      // refresh
      const { data, error: reloadErr } = await supabase
        .from('farms')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      if (reloadErr) throw reloadErr;
      setFarms(data || []);
    } catch (err) {
      console.error('Failed to save farm', err);
      toast({ title: 'Error', description: 'Failed to save farm.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Farms</CardTitle>
          <CardDescription>
            Capture your main farm and additional grazing locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="farm-name">Farm Name</Label>
              <Input id="farm-name" placeholder="e.g. My Farm Name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label className="block mb-2">Address Fields</Label>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="addr-farm-name" className="text-xs">Farm Name</Label>
                  <Input id="addr-farm-name" placeholder="e.g. My Farm Name" value={addrFarmName} onChange={(e) => setAddrFarmName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="addr-district" className="text-xs">District</Label>
                  <Input id="addr-district" placeholder="e.g. Sandton" value={district} onChange={(e) => setDistrict(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="addr-province" className="text-xs">Province</Label>
                  <Input id="addr-province" placeholder="e.g. Gauteng" value={province} onChange={(e) => setProvince(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="addr-postal" className="text-xs">Postal Code</Label>
                  <Input id="addr-postal" placeholder="e.g. 2196" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="addr-country" className="text-xs">Country</Label>
                  <Input id="addr-country" placeholder="e.g. South Africa" value={country} onChange={(e) => setCountry(e.target.value)} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={onAddFarm} disabled={saving}>
              {saving ? 'Saving...' : 'Add Grazing Location'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Captured Farms</CardTitle>
          <CardDescription>Your saved farms and grazing locations.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : farms.length === 0 ? (
            <div className="text-sm text-muted-foreground">No farms captured yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[60px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farms.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>
                      <span className="text-xs">{displayAddress(f.address)}</span>
                    </TableCell>
                    <TableCell>{new Date(f.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteFarm(f)} aria-label="Delete farm" title="Delete farm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
