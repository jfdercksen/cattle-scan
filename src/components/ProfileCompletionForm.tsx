import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YesNoSwitch } from "@/components/ui/YesNoSwitch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Upload } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignaturePad } from "@/components/SignaturePad";
import FileUploadManager, { type UploadResult } from "@/components/FileUploadManager";
import type { Tables, TablesUpdate, Enums } from '@/integrations/supabase/types';
import { useTranslation } from '@/i18n/useTranslation';

type Profile = Tables<'profiles'>;



interface FormData {
  id_document_url: string | null;
  ownership_type: string;
  entity_name: string;
  responsible_person_title: string;
  brand_mark_url: string | null;
  declaration_responsible_person_definition: boolean;
  agency_represented: string;
  appointment_letter_url: string | null;
  apac_registration_url: string | null;
  practice_letter_head_url: string | null;
  registration_number: string | null;
}

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    id_document_url: null,
    ownership_type: '',
    entity_name: '',
    responsible_person_title: '',
    brand_mark_url: null,
    declaration_responsible_person_definition: false,
    agency_represented: '',
    appointment_letter_url: null,
    apac_registration_url: null,
    practice_letter_head_url: null,
    registration_number: null,
  });

  useEffect(() => {
    if (user) {
      setProfileLoading(true);
      supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
          } else {
            setProfile(data);
          }
          setProfileLoading(false);
        });
    } else if (!authLoading) {
      setProfileLoading(false);
    }
  }, [user, authLoading]);

  const getRoleRedirectPath = (role: string | undefined | null) => {
    switch (role) {
      case 'seller':
        return '/seller-dashboard';
      case 'admin':
        return '/admin-dashboard';
      case 'vet':
        return '/vet-dashboard';
      case 'agent':
        return '/agent-dashboard';
      case 'load_master':
        return '/load-master-dashboard';
      default:
        return '/';
    }
  };

  useEffect(() => {
    if (authLoading || profileLoading) return;

    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile && profile.profile_completed) {
      navigate(getRoleRedirectPath(profile.role));
      return;
    }
  }, [user, profile, authLoading, profileLoading, navigate]);

  const handleFileUpload = (field: keyof FormData, result: UploadResult) => {
    if (result.success && result.fileUrl) {
      setFormData(prev => ({ ...prev, [field]: result.fileUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !profile) return;

    // Validate signature for sellers
    if (profile.role === 'seller' && !signature) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileCompletionForm', 'toastSignatureRequired'),
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Validate required file uploads
      if (!formData.id_document_url) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('profileCompletionForm', 'toastIdRequired'),
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'seller' && !formData.brand_mark_url) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('profileCompletionForm', 'toastBrandMarkRequired'),
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'vet' && !formData.practice_letter_head_url) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('profileCompletionForm', 'toastVetLetterheadRequired'),
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'agent' && (!formData.appointment_letter_url || !formData.apac_registration_url)) {
        toast({
          title: t('common', 'errorTitle'),
          description: t('profileCompletionForm', 'toastAgentDocumentsRequired'),
          variant: "destructive"
        });
        return;
      }

      // Update profile with collected information and mark as completed
      const updates: TablesUpdate<'profiles'> = {
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
        status: 'approved' as Enums<'user_status'>,
        approved_at: new Date().toISOString(),
        approved_by: user.id,
        id_document_url: formData.id_document_url,
        ...(profile.role === 'seller'
          ? {
              seller_ownership_type: formData.ownership_type,
              seller_entity_name: formData.entity_name,
              responsible_person_designation: formData.responsible_person_title,
              brand_mark_url: formData.brand_mark_url,
              declaration_responsible_person_definition: formData.declaration_responsible_person_definition,
              signature_data: signature,
              signature_date: new Date().toISOString(),
            }
          : {}),
        ...(profile.role === 'agent'
          ? {
              agency_represented: formData.agency_represented,
              appointment_letter_url: formData.appointment_letter_url,
              apac_registration_url: formData.apac_registration_url,
            }
          : {}),
        ...(profile.role === 'vet'
          ? {
              registration_number: formData.registration_number,
              practice_letter_head_url: formData.practice_letter_head_url,
            }
          : {}),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Refresh the AuthProvider's profile state
      await refreshProfile();

      toast({
        title: t('common', 'successTitle'),
        description: t('profileCompletionForm', 'toastSuccessDescription'),
        variant: "default"
      });

      // Redirect to role-specific page
      navigate(getRoleRedirectPath(profile.role));

    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: t('common', 'errorTitle'),
        description: t('profileCompletionForm', 'toastErrorDescription'),
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">{t('common', 'loading')}</div>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">{t('profileCompletionForm', 'loadProfileError')}</div>
    </div>
  );

  const renderFileUpload = (label: string, field: keyof FormData, documentType: 'brand_photo' | 'vet_letterhead' | 'affidavit', required = false) => (
    <FileUploadManager
      documentType={documentType}
      label={label}
      required={required}
      onUploadComplete={(result) => handleFileUpload(field, result)}
      currentFileUrl={formData[field] as string || undefined}
    />
  );

  const renderDeclaration = (field: keyof FormData, label: string) => (
    <div className="flex items-center justify-between py-2 border-b">
      <Label htmlFor={field as string} className="text-sm leading-5 flex-1 pr-4">
        {label}
      </Label>
      <YesNoSwitch
        value={!!formData[field]}
        onChange={(checked) => setFormData(prev => ({ ...prev, [field]: checked }))}
      />
    </div>
  );

  const renderBiosecurityDeclarations = () => (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">{t('profileCompletionForm', 'biosecuritySectionTitle')}</h3>

      <div className="space-y-3">
        {renderDeclaration("declaration_responsible_person_definition", t('profileCompletionForm', 'declarationResponsiblePerson'))}
      </div>

      <div className="space-y-4">
        <SignaturePad
          onSignatureChange={setSignature}
          signature={signature}
        />
      </div>
    </div>
  );

  const renderSellerFields = () => (
    <>
      <div className="space-y-4 border-t pt-4">
        <h3 className="text-lg font-semibold">{t('profileCompletionForm', 'sellerSectionTitle')}</h3>

        <div>
          <Label>{t('profileCompletionForm', 'ownershipQuestion')}</Label>
          <RadioGroup
            value={formData.ownership_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ownership_type: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sole_proprietor" id="sole_proprietor" />
              <Label htmlFor="sole_proprietor">{t('profileCompletionForm', 'ownershipSoleProprietor')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partnership" id="partnership" />
              <Label htmlFor="partnership">{t('profileCompletionForm', 'ownershipPartnership')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trust" id="trust" />
              <Label htmlFor="trust">{t('profileCompletionForm', 'ownershipTrust')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company">{t('profileCompletionForm', 'ownershipCompany')}</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="entity_name">{t('profileCompletionForm', 'entityNameLabel')}</Label>
          <Input
            id="entity_name"
            value={formData.entity_name}
            onChange={(e) => setFormData(prev => ({ ...prev, entity_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>{t('profileCompletionForm', 'responsibleTitleLabel')}</Label>
          <Select value={formData.responsible_person_title} onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_person_title: value }))}>
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
          required={true}
          onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
          currentFileUrl={formData.id_document_url || undefined}
        />
        <FileUploadManager
          documentType="brand_photo"
          label={t('profileCompletionForm', 'brandMarkUploadLabel')}
          required={true}
          onUploadComplete={(result) => handleFileUpload("brand_mark_url", result)}
          currentFileUrl={formData.brand_mark_url || undefined}
        />
      </div>

    </>
  );

  const renderAgentFields = () => (
    <>
      <div>
        <Label htmlFor="agency_represented">{t('profileCompletionForm', 'agencyRepresentedLabel')}</Label>
        <Input
          id="agency_represented"
          value={formData.agency_represented}
          onChange={(e) => setFormData(prev => ({ ...prev, agency_represented: e.target.value }))}
          required
        />
      </div>

      <FileUploadManager
        documentType="affidavit"
        label={t('profileCompletionForm', 'idUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
        currentFileUrl={formData.id_document_url || undefined}
      />
      <FileUploadManager
        documentType="affidavit"
        label={t('profileCompletionForm', 'appointmentLetterUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("appointment_letter_url", result)}
        currentFileUrl={formData.appointment_letter_url || undefined}
      />
      <FileUploadManager
        documentType="affidavit"
        label={t('profileCompletionForm', 'apacUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("apac_registration_url", result)}
        currentFileUrl={formData.apac_registration_url || undefined}
      />
    </>
  );

  const renderVetFields = () => (
    <>
      <div>
        <Label htmlFor="registration_number">{t('profileCompletionForm', 'registrationNumberLabel')}</Label>
        <Input
          id="registration_number"
          value={formData.registration_number}
          onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
          required
        />
      </div>
      <FileUploadManager
        documentType="affidavit"
        label={t('profileCompletionForm', 'idUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
        currentFileUrl={formData.id_document_url || undefined}
      />
      <FileUploadManager
        documentType="vet_letterhead"
        label={t('profileCompletionForm', 'practiceLetterheadUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("practice_letter_head_url", result)}
        currentFileUrl={formData.practice_letter_head_url || undefined}
      />
    </>
  );

  const renderLoadMasterFields = () => (
    <>
      <FileUploadManager
        documentType="affidavit"
        label={t('profileCompletionForm', 'idUploadLabel')}
        required={true}
        onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
        currentFileUrl={formData.id_document_url || undefined}
      />
    </>
  );

  const getRoleSpecificFields = () => {
    switch (profile.role) {
      case 'seller':
        return renderSellerFields();
      case 'agent':
        return renderAgentFields();
      case 'vet':
        return renderVetFields();
      case 'load_master':
        return renderLoadMasterFields();
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch (profile.role) {
      case 'seller':
        return t('profileCompletionForm', 'sellerTitle');
      case 'agent':
        return t('profileCompletionForm', 'agentTitle');
      case 'vet':
        return t('profileCompletionForm', 'vetTitle');
      case 'load_master':
        return t('profileCompletionForm', 'loadMasterTitle');
      default:
        return t('profileCompletionForm', 'defaultTitle');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {getRoleTitle()}
            </CardTitle>
            <CardDescription>
              {t('profileCompletionForm', 'cardDescription')}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User info display - read-only */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-gray-700">{t('profileCompletionForm', 'userInfoHeading')}</h3>
              <p className="text-sm text-gray-600">{`${t('profileCompletionForm', 'nameLabel')}: ${profile.first_name} ${profile.last_name}`}</p>
              <p className="text-sm text-gray-600">{`${t('profileCompletionForm', 'emailLabel')}: ${profile.email}`}</p>
              {profile.phone && <p className="text-sm text-gray-600">{`${t('profileCompletionForm', 'phoneLabel')}: ${profile.phone}`}</p>}
            </div>

            {/* Role-specific fields */}
            {getRoleSpecificFields()}
            {profile?.role === 'seller' && renderBiosecurityDeclarations()}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t('profileCompletionForm', 'buttonSubmitting') : t('profileCompletionForm', 'buttonSubmit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
