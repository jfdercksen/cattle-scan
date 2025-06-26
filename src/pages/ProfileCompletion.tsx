import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignaturePad } from "@/components/SignaturePad";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { profile, user, loading, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [signedLocation, setSignedLocation] = useState('');
  const [formData, setFormData] = useState({
    // File uploads
    idDocument: null as File | null,
    
    // Seller specific
    ownershipType: '',
    entityName: '',
    responsiblePersonTitle: '',
    responsiblePersonName: '',
    responsiblePersonEmail: '',
    responsiblePersonPhone: '',
    brandMark: null as File | null,
    
    // Biosecurity declarations
    declarationNoCloven: false,
    declarationLivestockKeptAway: false,
    declarationNoAnimalOriginFeed: false,
    declarationVeterinaryProductsRegistered: false,
    declarationNoFootMouthDisease: false,
    declarationNoFootMouthDiseaseFarm: false,
    declarationLivestockSouthAfrica: false,
    declarationNoGeneEditing: false,
    
    // Agent specific
    agencyRepresented: '',
    appointmentLetter: null as File | null,
    apacRegistration: null as File | null,
    
    // Vet specific
    practiceLetterHead: null as File | null
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // If profile is already completed, redirect to role-specific page
      if (profile && profile.profile_completed) {
        navigate(getRoleRedirectPath());
        return;
      }
    }
  }, [user, profile, loading, navigate, getRoleRedirectPath]);

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
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
      // Update profile with collected information and mark as completed
      const updates = {
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
        // Add biosecurity fields for sellers
        ...(profile.role === 'seller' && {
          responsible_person_name: formData.responsiblePersonName,
          responsible_person_designation: formData.responsiblePersonTitle,
          declaration_no_cloven_hooved_animals: formData.declarationNoCloven,
          declaration_livestock_kept_away: formData.declarationLivestockKeptAway,
          declaration_no_animal_origin_feed: formData.declarationNoAnimalOriginFeed,
          declaration_veterinary_products_registered: formData.declarationVeterinaryProductsRegistered,
          declaration_no_foot_mouth_disease: formData.declarationNoFootMouthDisease,
          declaration_no_foot_mouth_disease_farm: formData.declarationNoFootMouthDiseaseFarm,
          declaration_livestock_south_africa: formData.declarationLivestockSouthAfrica,
          declaration_no_gene_editing: formData.declarationNoGeneEditing,
          signature_data: signature,
          signature_date: new Date().toISOString(),
          signed_location: signedLocation
        })
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Profile completed successfully! Your account is now pending approval.",
        variant: "default"
      });
      
      // Redirect to role-specific page
      navigate(getRoleRedirectPath());
      
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!profile) return null;

  const renderFileUpload = (label: string, field: string, required = false) => (
    <div>
      <Label htmlFor={field}>{label} {required && '*'}</Label>
      <div className="mt-1 flex items-center space-x-2">
        <Input
          id={field}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileChange(field, e.target.files?.[0] || null)}
          className="flex-1"
          required={required}
        />
        <Upload className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  );

  const renderBiosecurityDeclarations = () => (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-lg font-semibold">Responsible Person Declaration</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="responsiblePersonName">Responsible Person Name *</Label>
          <Input
            id="responsiblePersonName"
            value={formData.responsiblePersonName}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePersonName: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="responsiblePersonDesignation">Designation *</Label>
          <Input
            id="responsiblePersonDesignation"
            value={formData.responsiblePersonTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePersonTitle: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium">I hereby declare that:</h4>
        
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationNoCloven"
              checked={formData.declarationNoCloven}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationNoCloven: !!checked }))}
            />
            <Label htmlFor="declarationNoCloven" className="text-sm leading-5">
              No cloven hooved animals (cattle, sheep, goats, pigs) other than those offered for sale have been on the farm for the past 21 days
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationLivestockKeptAway"
              checked={formData.declarationLivestockKeptAway}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationLivestockKeptAway: !!checked }))}
            />
            <Label htmlFor="declarationLivestockKeptAway" className="text-sm leading-5">
              The livestock offered for sale have been kept away from all other livestock for the past 21 days
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationNoAnimalOriginFeed"
              checked={formData.declarationNoAnimalOriginFeed}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationNoAnimalOriginFeed: !!checked }))}
            />
            <Label htmlFor="declarationNoAnimalOriginFeed" className="text-sm leading-5">
              No feed of animal origin has been fed to the livestock offered for sale
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationVeterinaryProductsRegistered"
              checked={formData.declarationVeterinaryProductsRegistered}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationVeterinaryProductsRegistered: !!checked }))}
            />
            <Label htmlFor="declarationVeterinaryProductsRegistered" className="text-sm leading-5">
              All veterinary products used on the livestock offered for sale are registered
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationNoFootMouthDisease"
              checked={formData.declarationNoFootMouthDisease}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationNoFootMouthDisease: !!checked }))}
            />
            <Label htmlFor="declarationNoFootMouthDisease" className="text-sm leading-5">
              No foot and mouth disease has occurred on the farm for the past 12 months
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationNoFootMouthDiseaseFarm"
              checked={formData.declarationNoFootMouthDiseaseFarm}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationNoFootMouthDiseaseFarm: !!checked }))}
            />
            <Label htmlFor="declarationNoFootMouthDiseaseFarm" className="text-sm leading-5">
              No foot and mouth disease has occurred on neighbouring farms for the past 3 months
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationLivestockSouthAfrica"
              checked={formData.declarationLivestockSouthAfrica}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationLivestockSouthAfrica: !!checked }))}
            />
            <Label htmlFor="declarationLivestockSouthAfrica" className="text-sm leading-5">
              The livestock offered for sale have been in South Africa for at least 21 days
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="declarationNoGeneEditing"
              checked={formData.declarationNoGeneEditing}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, declarationNoGeneEditing: !!checked }))}
            />
            <Label htmlFor="declarationNoGeneEditing" className="text-sm leading-5">
              No gene editing technology has been used on the livestock offered for sale
            </Label>
          </div>
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
            value={formData.ownershipType} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, ownershipType: value }))}
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
          <Label htmlFor="entityName">Name of Entity *</Label>
          <Input
            id="entityName"
            value={formData.entityName}
            onChange={(e) => setFormData(prev => ({ ...prev, entityName: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label>Title of the responsible person:</Label>
          <Select value={formData.responsiblePersonTitle} onValueChange={(value) => setFormData(prev => ({ ...prev, responsiblePersonTitle: value }))}>
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

        {renderFileUpload("Photo of I.D. or drivers licence of person offering livestock", "idDocument", true)}
        {renderFileUpload("Photo of brand mark of livestock owner", "brandMark", true)}
      </div>
      
      {renderBiosecurityDeclarations()}
    </>
  );

  const renderAgentFields = () => (
    <>
      <div>
        <Label htmlFor="agencyRepresented">Agency Represented *</Label>
        <Input
          id="agencyRepresented"
          value={formData.agencyRepresented}
          onChange={(e) => setFormData(prev => ({ ...prev, agencyRepresented: e.target.value }))}
          required
        />
      </div>
      
      {renderFileUpload("Photo of I.D. or drivers licence", "idDocument", true)}
      {renderFileUpload("Photo of agency appointment letter", "appointmentLetter", true)}
      {renderFileUpload("Photo of APAC registration", "apacRegistration", true)}
    </>
  );

  const renderVetFields = () => (
    <>
      {renderFileUpload("Photo of I.D. or drivers licence", "idDocument", true)}
      {renderFileUpload("Photo of practice letter head", "practiceLetterHead", true)}
    </>
  );

  const renderDriverFields = () => (
    <>
      {renderFileUpload("Photo of I.D. or drivers licence", "idDocument", true)}
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
