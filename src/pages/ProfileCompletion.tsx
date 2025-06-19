
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
  const { profile, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Common fields
    fullName: '',
    email: '',
    phone: '',
    
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
      
      // If profile is complete or not pending, redirect to home
      if (profile && (profile.status !== 'pending' || profile.phone)) {
        navigate('/');
        return;
      }
    }
  }, [user, profile, loading, navigate]);

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !profile) return;
    
    setSubmitting(true);
    
    try {
      // Update profile with collected information
      const updates = {
        phone: formData.phone,
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
      
      navigate('/');
      
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

        <div>
          <Label htmlFor="responsiblePersonName">Name and surname of person offering the livestock *</Label>
          <Input
            id="responsiblePersonName"
            value={formData.responsiblePersonName}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePersonName: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="responsiblePersonEmail">E-mail address of person offering livestock *</Label>
          <Input
            id="responsiblePersonEmail"
            type="email"
            value={formData.responsiblePersonEmail}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePersonEmail: e.target.value }))}
            required
          />
        </div>

        <div>
          <Label htmlFor="responsiblePersonPhone">Cell phone number of person offering livestock *</Label>
          <Input
            id="responsiblePersonPhone"
            type="tel"
            value={formData.responsiblePersonPhone}
            onChange={(e) => setFormData(prev => ({ ...prev, responsiblePersonPhone: e.target.value }))}
            required
          />
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
            {/* Common fields */}
            <div>
              <Label htmlFor="fullName">Name and Surname *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                placeholder={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder={profile.email}
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Cell Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
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
