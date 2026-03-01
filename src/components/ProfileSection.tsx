import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "@/i18n/useTranslation";
import { User, Settings } from "lucide-react";
import FileUploadManager, { type UploadResult } from "@/components/FileUploadManager";

const ProfileSection = () => {
  const { user, profile, refreshProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Profile form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [language, setLanguage] = useState<'en' | 'af'>('en');
  const [sellerOwnershipType, setSellerOwnershipType] = useState('');
  const [sellerEntityName, setSellerEntityName] = useState('');
  const [responsiblePersonTitle, setResponsiblePersonTitle] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [brandMarkUrl, setBrandMarkUrl] = useState<string | null>(null);
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (profile) {
      const fallbackPhone = user?.user_metadata?.phone as string | undefined;
      const fallbackCompanyName = profile.company_name || profile.seller_entity_name || profile.entity_name || '';
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || fallbackPhone || '');
      setCompanyName(fallbackCompanyName);
      setSellerEntityName(profile.seller_entity_name || profile.entity_name || '');
      setSellerOwnershipType(profile.seller_ownership_type || '');
      setResponsiblePersonTitle(profile.responsible_person_designation || '');
      setIdDocumentUrl(profile.id_document_url || null);
      setBrandMarkUrl(profile.brand_mark_url || null);
      setAddress(profile.address || '');
      setCity(profile.city || '');
      setProvince(profile.province || '');
      setPostalCode(profile.postal_code || '');
      setLanguage(profile.language_preference || 'en');
    }
  }, [profile, user]);

  if (authLoading || !profile) {
    return (
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" aria-label={t('profileSection', 'loadingTitle')}></div>
            <div className="h-4 bg-slate-200 rounded w-3/4 animate-pulse mt-2" aria-label={t('profileSection', 'loadingDescription')}></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-slate-200 rounded w-full animate-pulse" aria-label={t('profileSection', 'loadingField')}></div>
            <div className="h-10 bg-slate-200 rounded w-full animate-pulse" aria-label={t('profileSection', 'loadingField')}></div>
            <div className="h-10 bg-slate-200 rounded w-1/4 animate-pulse ml-auto" aria-label={t('profileSection', 'loadingField')}></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileSection', 'errorMissingNames'),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      if (!user) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('profileSection', 'errorUnexpected'),
          variant: "destructive"
        });
        return;
      }

      const profileUpdates = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || null,
        company_name: companyName.trim() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        province: province.trim() || null,
        postal_code: postalCode.trim() || null,
        language_preference: language as 'en' | 'af',
        ...(profile.role === 'seller'
          ? {
              seller_entity_name: sellerEntityName.trim() || companyName.trim() || null,
              seller_ownership_type: sellerOwnershipType || null,
              responsible_person_designation: responsiblePersonTitle || null,
              id_document_url: idDocumentUrl,
              brand_mark_url: brandMarkUrl,
            }
          : {}),
      };

      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);

      if (error) {
        toast({
          title: t('common', 'errorTitle'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        await refreshProfile();
        toast({
          title: t('common', 'successTitle'),
          description: t('profileSection', 'toastProfileSuccess'),
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileSection', 'errorUnexpected'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileSection', 'errorPasswordShort'),
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileSection', 'errorPasswordMismatch'),
        variant: "destructive"
      });
      return;
    }

    setPasswordLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: t('common', 'errorTitle'),
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t('common', 'successTitle'),
          description: t('profileSection', 'toastPasswordSuccess'),
          variant: "default"
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileSection', 'errorUnexpected'),
        variant: "destructive"
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value as 'en' | 'af');
  };

  const handleFileUpload = (field: 'id_document_url' | 'brand_mark_url', result: UploadResult) => {
    if (!result.success) return;
    if (field === 'id_document_url') {
      setIdDocumentUrl(result.fileUrl || null);
    }
    if (field === 'brand_mark_url') {
      setBrandMarkUrl(result.fileUrl || null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <CardTitle>{t('profileSection', 'profileCardTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('profileSection', 'profileCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t('profileSection', 'labelFirstName')}</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="lastName">{t('profileSection', 'labelLastName')}</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  maxLength={50}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">{t('profileSection', 'labelEmail')}</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-gray-500 mt-1">{t('profileSection', 'emailHint')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">{t('profileSection', 'labelPhone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
              <div>
                <Label htmlFor="companyName">{t('profileSection', 'labelCompany')}</Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="address">{t('profileSection', 'labelAddress')}</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                maxLength={200}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">{t('profileSection', 'labelCity')}</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="province">{t('profileSection', 'labelProvince')}</Label>
                <Input
                  id="province"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  maxLength={50}
                />
              </div>
              <div>
                <Label htmlFor="postalCode">{t('profileSection', 'labelPostalCode')}</Label>
                <Input
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="language">{t('profileSection', 'labelLanguage')}</Label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('profileSection', 'labelLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('profileSection', 'languageEnglish')}</SelectItem>
                  <SelectItem value="af">{t('profileSection', 'languageAfrikaans')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? t('profileSection', 'buttonUpdating') : t('profileSection', 'buttonUpdateProfile')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {profile.role === 'seller' && (
        <Card>
          <CardHeader>
            <CardTitle>{t('profileCompletionForm', 'sellerSectionTitle')}</CardTitle>
            <CardDescription>{t('profileCompletionForm', 'cardDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>{t('profileCompletionForm', 'ownershipQuestion')}</Label>
                <RadioGroup
                  value={sellerOwnershipType}
                  onValueChange={setSellerOwnershipType}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sole_proprietor" id="seller-sole-proprietor" />
                    <Label htmlFor="seller-sole-proprietor">{t('profileCompletionForm', 'ownershipSoleProprietor')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="partnership" id="seller-partnership" />
                    <Label htmlFor="seller-partnership">{t('profileCompletionForm', 'ownershipPartnership')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="trust" id="seller-trust" />
                    <Label htmlFor="seller-trust">{t('profileCompletionForm', 'ownershipTrust')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="company" id="seller-company" />
                    <Label htmlFor="seller-company">{t('profileCompletionForm', 'ownershipCompany')}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="seller-entity-name">{t('profileCompletionForm', 'entityNameLabel')}</Label>
                <Input
                  id="seller-entity-name"
                  value={sellerEntityName}
                  onChange={(e) => setSellerEntityName(e.target.value)}
                  maxLength={120}
                />
              </div>

              <div>
                <Label>{t('profileCompletionForm', 'responsibleTitleLabel')}</Label>
                <Select value={responsiblePersonTitle} onValueChange={setResponsiblePersonTitle}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('profileCompletionForm', 'selectTitlePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sole_proprietor">{t('profileCompletionForm', 'titleSoleProprietor')}</SelectItem>
                    <SelectItem value="partner">{t('profileCompletionForm', 'titlePartner')}</SelectItem>
                    <SelectItem value="trustee">{t('profileCompletionForm', 'titleTrustee')}</SelectItem>
                    <SelectItem value="director">{t('profileCompletionForm', 'titleDirector')}</SelectItem>
                    <SelectItem value="herd_manager">{t('profileCompletionForm', 'titleHerdManager')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <FileUploadManager
                documentType="affidavit"
                label={t('profileCompletionForm', 'idUploadLabelSeller')}
                required={false}
                onUploadComplete={(result) => handleFileUpload('id_document_url', result)}
                currentFileUrl={idDocumentUrl || undefined}
              />

              <FileUploadManager
                documentType="brand_photo"
                label={t('profileCompletionForm', 'brandMarkUploadLabel')}
                required={false}
                onUploadComplete={(result) => handleFileUpload('brand_mark_url', result)}
                currentFileUrl={brandMarkUrl || undefined}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Password Update */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <CardTitle>{t('profileSection', 'passwordCardTitle')}</CardTitle>
          </div>
          <CardDescription>
            {t('profileSection', 'passwordCardDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="newPassword">{t('profileSection', 'labelNewPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">{t('profileSection', 'labelConfirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? t('profileSection', 'buttonUpdatingPassword') : t('profileSection', 'buttonUpdatePassword')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSection;
