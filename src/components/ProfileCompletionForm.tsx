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
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;



interface FormData {
  id_document_url: string | null;
  ownership_type: string;
  entity_name: string;
  responsible_person_title: string;
  brand_mark_url: string | null;
  declaration_responsible_person_definition: boolean;
  declaration_no_cloven_hooved_animals: boolean;
  declaration_livestock_kept_away: boolean;
  declaration_no_animal_origin_feed: boolean;
  declaration_veterinary_products_registered: boolean;
  declaration_no_foot_mouth_disease: boolean;
  declaration_no_foot_mouth_disease_farm: boolean;
  declaration_livestock_south_africa: boolean;
  declaration_no_gene_editing: boolean;
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

  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signedLocation, setSignedLocation] = useState('');
  const [formData, setFormData] = useState<FormData>({
    id_document_url: null,
    ownership_type: '',
    entity_name: '',
    responsible_person_title: '',
    brand_mark_url: null,
    declaration_responsible_person_definition: false,
    declaration_no_cloven_hooved_animals: false,
    declaration_livestock_kept_away: false,
    declaration_no_animal_origin_feed: false,
    declaration_veterinary_products_registered: false,
    declaration_no_foot_mouth_disease: false,
    declaration_no_foot_mouth_disease_farm: false,
    declaration_livestock_south_africa: false,
    declaration_no_gene_editing: false,
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
      case 'driver':
        return '/driver-dashboard';
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
        title: "Error",
        description: "Digital signature is required to complete your profile.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Validate required file uploads
      if (!formData.id_document_url) {
        toast({
          title: "Error",
          description: "ID document upload is required.",
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'seller' && !formData.brand_mark_url) {
        toast({
          title: "Error",
          description: "Brand mark photo upload is required for sellers.",
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'vet' && !formData.practice_letter_head_url) {
        toast({
          title: "Error",
          description: "Practice letterhead upload is required for veterinarians.",
          variant: "destructive"
        });
        return;
      }

      if (profile.role === 'agent' && (!formData.appointment_letter_url || !formData.apac_registration_url)) {
        toast({
          title: "Error",
          description: "Appointment letter and APAC registration uploads are required for agents.",
          variant: "destructive"
        });
        return;
      }

      // Update profile with collected information and mark as completed
      const updates = {
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
        id_document_url: formData.id_document_url,
        ...(profile.role === 'seller' && {
          seller_ownership_type: formData.ownership_type,
          seller_entity_name: formData.entity_name,
          responsible_person_designation: formData.responsible_person_title,
          brand_mark_url: formData.brand_mark_url,
          declaration_responsible_person_definition: formData.declaration_responsible_person_definition,
          declaration_no_cloven_hooved_animals: formData.declaration_no_cloven_hooved_animals,
          declaration_livestock_kept_away: formData.declaration_livestock_kept_away,
          declaration_no_animal_origin_feed: formData.declaration_no_animal_origin_feed,
          declaration_veterinary_products_registered: formData.declaration_veterinary_products_registered,
          declaration_no_foot_mouth_disease: formData.declaration_no_foot_mouth_disease,
          declaration_no_foot_mouth_disease_farm: formData.declaration_no_foot_mouth_disease_farm,
          declaration_livestock_south_africa: formData.declaration_livestock_south_africa,
          declaration_no_gene_editing: formData.declaration_no_gene_editing,
          signature_data: signature,
          signature_date: new Date().toISOString(),
          signed_location: signedLocation
        }),
        ...(profile.role === 'agent' && {
          agency_represented: formData.agency_represented,
          appointment_letter_url: formData.appointment_letter_url,
          apac_registration_url: formData.apac_registration_url,
        }),
        ...(profile.role === 'vet' && {
          registration_number: formData.registration_number,
          practice_letter_head_url: formData.practice_letter_head_url,
        }),
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
        title: "Success",
        description: "Profile completed successfully! Redirecting to your dashboard...",
        variant: "default"
      });

      // Redirect to role-specific page
      navigate(getRoleRedirectPath(profile.role));

    } catch (error) {
      console.error('Profile completion error:', error);
      toast({
        title: "Error",
        description: "Failed to complete profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
      <div className="text-center">Could not load profile. Please try again.</div>
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
      <h3 className="text-lg font-semibold">Responsible Person Declaration</h3>

      <div className="space-y-3">
        {renderDeclaration("declaration_responsible_person_definition", "The responsible person is a person who is directly part of the management of daily operations of the farming enterprise and whom can attest to information as required. The responsible person must be 18 years and older.")}

        <h4 className="font-medium pt-4">I hereby declare that:</h4>

        <div className="space-y-2">
          {renderDeclaration("declaration_no_cloven_hooved_animals", "No cloven hooved animals (cattle, sheep, goats, pigs) other than those offered for sale have been on the farm for the past 21 days")}
          {renderDeclaration("declaration_livestock_kept_away", "The livestock offered for sale have been kept away from all other livestock for the past 21 days")}
          {renderDeclaration("declaration_no_animal_origin_feed", "No feed of animal origin has been fed to the livestock offered for sale")}
          {renderDeclaration("declaration_veterinary_products_registered", "All veterinary products used on the livestock offered for sale are registered")}
          {renderDeclaration("declaration_no_foot_mouth_disease", "No foot and mouth disease has occurred on the farm for the past 12 months")}
          {renderDeclaration("declaration_no_foot_mouth_disease_farm", "No foot and mouth disease has occurred on neighbouring farms for the past 3 months")}
          {renderDeclaration("declaration_livestock_south_africa", "The livestock offered for sale have been in South Africa for at least 21 days")}
          {renderDeclaration("declaration_no_gene_editing", "No gene editing technology has been used on the livestock offered for sale")}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="signedLocation">Location where signed *</Label>
          <Input
            id="signedLocation"
            value={signedLocation}
            onChange={(e) => setSignedLocation(e.target.value)}
            placeholder="Enter location"
            required
          />
        </div>

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
        <h3 className="text-lg font-semibold">Livestock Owner Information</h3>

        <div>
          <Label>The livestock is owned by a:</Label>
          <RadioGroup
            value={formData.ownership_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, ownership_type: value }))}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="sole_proprietor" id="sole_proprietor" />
              <Label htmlFor="sole_proprietor">Sole Proprietor</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="partnership" id="partnership" />
              <Label htmlFor="partnership">Partnership</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="trust" id="trust" />
              <Label htmlFor="trust">Trust</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="company" id="company" />
              <Label htmlFor="company">Company</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="entity_name">Name of Entity *</Label>
          <Input
            id="entity_name"
            value={formData.entity_name}
            onChange={(e) => setFormData(prev => ({ ...prev, entity_name: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>Title of the responsible person:</Label>
          <Select value={formData.responsible_person_title} onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_person_title: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
              <SelectItem value="partner">Partner</SelectItem>
              <SelectItem value="trustee">Trustee</SelectItem>
              <SelectItem value="director">Director</SelectItem>
              <SelectItem value="herd_manager">Herd Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <FileUploadManager
          documentType="affidavit"
          label="Photo of I.D. or drivers licence of person offering livestock"
          required={true}
          onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
          currentFileUrl={formData.id_document_url || undefined}
        />
        <FileUploadManager
          documentType="brand_photo"
          label="Photo of brand mark of livestock owner"
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
        <Label htmlFor="agency_represented">Agency Represented *</Label>
        <Input
          id="agency_represented"
          value={formData.agency_represented}
          onChange={(e) => setFormData(prev => ({ ...prev, agency_represented: e.target.value }))}
          required
        />
      </div>

      <FileUploadManager
        documentType="affidavit"
        label="Photo of I.D. or drivers licence"
        required={true}
        onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
        currentFileUrl={formData.id_document_url || undefined}
      />
      <FileUploadManager
        documentType="affidavit"
        label="Photo of agency appointment letter"
        required={true}
        onUploadComplete={(result) => handleFileUpload("appointment_letter_url", result)}
        currentFileUrl={formData.appointment_letter_url || undefined}
      />
      <FileUploadManager
        documentType="affidavit"
        label="Photo of APAC registration"
        required={true}
        onUploadComplete={(result) => handleFileUpload("apac_registration_url", result)}
        currentFileUrl={formData.apac_registration_url || undefined}
      />
    </>
  );

  const renderVetFields = () => (
    <>
      <div>
        <Label htmlFor="registration_number">Registration Number *</Label>
        <Input
          id="registration_number"
          value={formData.registration_number}
          onChange={(e) => setFormData(prev => ({ ...prev, registration_number: e.target.value }))}
          required
        />
      </div>
      <FileUploadManager
        documentType="affidavit"
        label="Photo of I.D. or drivers licence"
        required={true}
        onUploadComplete={(result) => handleFileUpload("id_document_url", result)}
        currentFileUrl={formData.id_document_url || undefined}
      />
      <FileUploadManager
        documentType="vet_letterhead"
        label="Photo of practice letter head"
        required={true}
        onUploadComplete={(result) => handleFileUpload("practice_letter_head_url", result)}
        currentFileUrl={formData.practice_letter_head_url || undefined}
      />
    </>
  );

  const renderDriverFields = () => (
    <>
      <FileUploadManager
        documentType="affidavit"
        label="Photo of I.D. or drivers licence"
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
      case 'driver':
        return renderDriverFields();
      default:
        return null;
    }
  };

  const getRoleTitle = () => {
    switch (profile.role) {
      case 'seller':
        return 'Seller Profile';
      case 'agent':
        return 'Agent Profile';
      case 'vet':
        return 'Vet Profile';
      case 'driver':
        return 'Driver Profile';
      default:
        return 'Profile Completion';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {getRoleTitle()}
            </CardTitle>
            <CardDescription>
              Please complete your profile to proceed with account verification
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* User info display - read-only */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-gray-700">Your Information</h3>
              <p className="text-sm text-gray-600">Name: {profile.first_name} {profile.last_name}</p>
              <p className="text-sm text-gray-600">Email: {profile.email}</p>
              {profile.phone && <p className="text-sm text-gray-600">Phone: {profile.phone}</p>}
            </div>

            {/* Role-specific fields */}
            {getRoleSpecificFields()}
            {profile?.role === 'seller' && renderBiosecurityDeclarations()}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Complete Profile'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileCompletion;
