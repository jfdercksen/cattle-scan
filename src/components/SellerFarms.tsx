import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

// The farms.address will be stored as: FarmName|District|Province|Country
// We'll assemble the pipe-separated structure when inserting so we can populate required columns (city, province)

type Farm = Tables<'farms'>;
type FarmWithGln = Farm & {
  has_gln?: boolean | null;
  gln_number?: string | null;
  gln_document_url?: string | null;
};

function buildPipedAddress(
  farmName: string,
  district: string,
  province: string,
  country: string
) {
  return [farmName, district, province, country].map((p) => (p ?? '').trim()).join('|');
}

function displayAddress(address: string) {
  return address
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean)
    .join(', ');
}

function parsePipedAddress(address: string) {
  const [farmName = '', district = '', province = '', country = ''] = address.split('|').map((p) => p.trim());
  return { farmName, district, province, country };
}

type SellerFarmsProps = {
  onFarmCreated?: () => void;
};

export default function SellerFarms({ onFarmCreated }: SellerFarmsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [addrFarmName, setAddrFarmName] = useState('');
  const [district, setDistrict] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('');
  const [saving, setSaving] = useState(false);
  const [farms, setFarms] = useState<FarmWithGln[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFarmId, setEditingFarmId] = useState<string | null>(null);
  const [hasGln, setHasGln] = useState(false);
  const [glnNumber, setGlnNumber] = useState('');
  const [glnDocumentFile, setGlnDocumentFile] = useState<File | null>(null);
  const [glnDocumentUrl, setGlnDocumentUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();

  const GLN_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
  const GLN_MAX_BYTES = 10 * 1024 * 1024;

  const availableCountries = [
    { value: 'South Africa', labelKey: 'countrySouthAfrica' },
    { value: 'Botswana', labelKey: 'countryBotswana' },
    { value: 'Namibia', labelKey: 'countryNamibia' },
  ] as const;

  // If the structured farm name is empty, default it from the main Name field for convenience
  useEffect(() => {
    if (!addrFarmName && name) {
      setAddrFarmName(name);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!hasGln) {
      setGlnNumber('');
      setGlnDocumentFile(null);
      setGlnDocumentUrl(null);
    }
  }, [hasGln]);

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
        toast({
          title: t('common', 'errorTitle'),
          description: t('sellerFarms', 'toastLoadErrorDescription'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    loadFarms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDeleteFarm = async (farm: Farm) => {
    if (!user) return;
    const confirmed = window.confirm(
      t('sellerFarms', 'confirmDelete').replace('{name}', farm.name)
    );
    if (!confirmed) return;
    try {
      const { error } = await supabase
        .from('farms')
        .delete()
        .eq('id', farm.id)
        .eq('owner_id', user.id);
      if (error) throw error;
      setFarms((prev) => prev.filter((f) => f.id !== farm.id));
      toast({
        title: t('sellerFarms', 'toastDeleteSuccessTitle'),
        description: t('sellerFarms', 'toastDeleteSuccessDescription'),
      });
    } catch (err) {
      console.error('Failed to delete farm', err);
      toast({
        title: t('common', 'errorTitle'),
        description: t('sellerFarms', 'toastDeleteErrorDescription'),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setName('');
    setAddrFarmName('');
    setDistrict('');
    setProvince('');
    setCountry('');
    setHasGln(false);
    setGlnNumber('');
    setGlnDocumentFile(null);
    setGlnDocumentUrl(null);
    setEditingFarmId(null);
  };

  const handleEditFarm = (farm: FarmWithGln) => {
    setEditingFarmId(farm.id);
    setName(farm.name ?? '');
    const { farmName, district: farmDistrict, province: farmProvince, country: farmCountry } = parsePipedAddress(farm.address);
    setAddrFarmName(farmName || farm.name || '');
    setDistrict(farmDistrict);
    setProvince(farmProvince);
    setCountry(farmCountry);
    setHasGln(Boolean(farm.has_gln));
    setGlnNumber(farm.gln_number ?? '');
    setGlnDocumentUrl(farm.gln_document_url ?? null);
    setGlnDocumentFile(null);
  };

  const handleGlnFileSelect = (file: File) => {
    if (!GLN_ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastInvalidGlnFileType'),
        variant: 'destructive',
      });
      return;
    }
    if (file.size > GLN_MAX_BYTES) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastInvalidGlnFileSize'),
        variant: 'destructive',
      });
      return;
    }
    setGlnDocumentFile(file);
    setGlnDocumentUrl(null);
  };

  const uploadGlnDocument = async (file: File) => {
    const fileName = `farm_gln_${user?.id}_${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('farm-documents')
      .upload(fileName, file, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    const { data: publicUrlData } = supabase.storage
      .from('farm-documents')
      .getPublicUrl(data.path);
    return publicUrlData.publicUrl;
  };

  const onSaveFarm = async () => {
    if (!user) return;
    const usedFarmName = (addrFarmName || name).trim();
    if (!name.trim()) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastMissingNameDescription'),
        variant: 'destructive',
      });
      return;
    }
    if (!usedFarmName || !district.trim() || !province.trim() || !country.trim()) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastMissingAddressDescription'),
        variant: 'destructive',
      });
      return;
    }
    if (hasGln && !glnNumber.trim()) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastMissingGlnNumberDescription'),
        variant: 'destructive',
      });
      return;
    }
    if (hasGln && !glnDocumentFile && !glnDocumentUrl) {
      toast({
        title: t('sellerFarms', 'toastMissingInfoTitle'),
        description: t('sellerFarms', 'toastMissingGlnDocumentDescription'),
        variant: 'destructive',
      });
      return;
    }

    const assembledAddress = buildPipedAddress(usedFarmName, district, province, country);

    setSaving(true);
    try {
      let uploadedGlnUrl = glnDocumentUrl;
      if (hasGln && glnDocumentFile) {
        uploadedGlnUrl = await uploadGlnDocument(glnDocumentFile);
      }

      if (editingFarmId) {
        const { error } = await supabase.from('farms')
          .update({
            name: name.trim(),
            address: assembledAddress,
            city: district,
            province: province,
            postal_code: null,
            has_gln: hasGln,
            gln_number: hasGln ? glnNumber.trim() : null,
            gln_document_url: hasGln ? uploadedGlnUrl : null,
          } as Record<string, unknown>)
          .eq('id', editingFarmId)
          .eq('owner_id', user.id);
        if (error) throw error;
        toast({
          title: t('sellerFarms', 'toastSaveSuccessTitle'),
          description: t('sellerFarms', 'toastSaveSuccessDescription'),
        });
      } else {
        const { error } = await supabase.from('farms').insert({
          owner_id: user.id,
          name: name.trim(),
          address: assembledAddress,
          city: district,
          province: province,
          postal_code: null,
          has_gln: hasGln,
          gln_number: hasGln ? glnNumber.trim() : null,
          gln_document_url: hasGln ? uploadedGlnUrl : null,
        } as Record<string, unknown>);
        if (error) throw error;
        toast({
          title: t('sellerFarms', 'toastSaveSuccessTitle'),
          description: t('sellerFarms', 'toastSaveSuccessDescription'),
        });
        onFarmCreated?.();
      }
      resetForm();
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
      toast({
        title: t('common', 'errorTitle'),
        description: t('sellerFarms', 'toastSaveErrorDescription'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('sellerFarms', 'title')}</CardTitle>
          <CardDescription>
            {t('sellerFarms', 'description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="farm-name">{t('sellerFarms', 'farmNameLabel')}</Label>
              <Input
                id="farm-name"
                placeholder={t('sellerFarms', 'farmNamePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label className="block mb-2">{t('sellerFarms', 'addressFieldsLabel')}</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="addr-farm-name" className="text-xs">{t('sellerFarms', 'addressFarmNameLabel')}</Label>
                  <Input
                    id="addr-farm-name"
                    placeholder={t('sellerFarms', 'addressFarmNamePlaceholder')}
                    value={addrFarmName}
                    onChange={(e) => setAddrFarmName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addr-district" className="text-xs">{t('sellerFarms', 'districtLabel')}</Label>
                  <Input
                    id="addr-district"
                    placeholder={t('sellerFarms', 'districtPlaceholder')}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addr-province" className="text-xs">{t('sellerFarms', 'provinceLabel')}</Label>
                  <Input
                    id="addr-province"
                    placeholder={t('sellerFarms', 'provincePlaceholder')}
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="addr-country" className="text-xs">{t('sellerFarms', 'countryLabel')}</Label>
                  <select
                    id="addr-country"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="" disabled>
                      {t('sellerFarms', 'countryPlaceholder')}
                    </option>
                    {availableCountries.map((c) => (
                      <option key={c.value} value={c.value}>
                        {t('sellerFarms', c.labelKey)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-4 border-t pt-6">
            <div>
              <Label className="block mb-2">{t('sellerFarms', 'glnSectionTitle')}</Label>
              <p className="text-sm text-muted-foreground mb-3">{t('sellerFarms', 'glnSectionDescription')}</p>
              <div className="flex gap-2">
                <Button type="button" variant={hasGln ? 'default' : 'outline'} size="sm" onClick={() => setHasGln(true)}>
                  {t('sellerFarms', 'glnYes')}
                </Button>
                <Button type="button" variant={!hasGln ? 'default' : 'outline'} size="sm" onClick={() => setHasGln(false)}>
                  {t('sellerFarms', 'glnNo')}
                </Button>
              </div>
            </div>

            {hasGln && (
              <>
                <div>
                  <Label htmlFor="gln-number">{t('sellerFarms', 'glnNumberLabel')}</Label>
                  <Input
                    id="gln-number"
                    placeholder={t('sellerFarms', 'glnNumberPlaceholder')}
                    value={glnNumber}
                    onChange={(e) => setGlnNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="block mb-2">{t('sellerFarms', 'glnDocumentLabel')}</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {t('sellerFarms', 'glnChooseFile')}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => cameraInputRef.current?.click()}>
                      {t('sellerFarms', 'glnTakePhoto')}
                    </Button>
                    {glnDocumentFile && (
                      <span className="text-xs text-muted-foreground">{glnDocumentFile.name}</span>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={GLN_ALLOWED_TYPES.join(',')}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGlnFileSelect(file);
                    }}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    className="hidden"
                    accept={GLN_ALLOWED_TYPES.join(',')}
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleGlnFileSelect(file);
                    }}
                  />
                  {glnDocumentUrl && !glnDocumentFile && (
                    <div className="mt-2 text-xs">
                      <a href={glnDocumentUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        {t('sellerFarms', 'glnViewDocument')}
                      </a>
                      <Button type="button" variant="link" size="sm" onClick={() => setGlnDocumentUrl(null)}>
                        {t('sellerFarms', 'glnReplaceDocument')}
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="mt-4">
            <div className="flex gap-2">
              <Button onClick={onSaveFarm} disabled={saving}>
                {saving ? t('common', 'saving') : editingFarmId ? t('sellerFarms', 'updateFarm') : t('sellerFarms', 'addGrazingLocation')}
              </Button>
              {editingFarmId && (
                <Button type="button" variant="outline" onClick={resetForm} disabled={saving}>
                  {t('sellerFarms', 'cancelEdit')}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('sellerFarms', 'cardCapturedTitle')}</CardTitle>
          <CardDescription>{t('sellerFarms', 'cardCapturedDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>{t('sellerFarms', 'loading')}</div>
          ) : farms.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t('sellerFarms', 'emptyState')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sellerFarms', 'tableName')}</TableHead>
                  <TableHead>{t('sellerFarms', 'tableAddress')}</TableHead>
                  <TableHead>{t('sellerFarms', 'tableCreated')}</TableHead>
                  <TableHead className="w-[60px] text-right">{t('sellerFarms', 'tableActions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {farms.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>{f.name}</span>
                        {f.has_gln && (
                          <Badge variant="outline">✓ GLN</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs">{displayAddress(f.address)}</span>
                    </TableCell>
                    <TableCell>{new Date(f.created_at).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditFarm(f)}
                        aria-label={t('sellerFarms', 'editActionLabel')}
                        title={t('sellerFarms', 'editActionLabel')}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFarm(f)}
                        aria-label={t('sellerFarms', 'deleteActionLabel')}
                        title={t('sellerFarms', 'deleteActionLabel')}
                      >
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
