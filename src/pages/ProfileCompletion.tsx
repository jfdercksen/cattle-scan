import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileCompletion = () => {
  const navigate = useNavigate();
  const { profile, user, loading, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
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
    
    setSubmitting(true);
    
    try {
      // Update profile with collected information and mark as completed
      const updates = {
        profile_completed: true,
        profile_completed_at: new Date().toISOString(),
        // Add other fields as needed based on role
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
