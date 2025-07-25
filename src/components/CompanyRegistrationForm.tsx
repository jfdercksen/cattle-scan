import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CompanyService } from "@/services/companyService";
import { useAuth } from "@/contexts/auth";
import { Building2, Loader2 } from "lucide-react";

interface CompanyRegistrationFormProps {
  onSuccess?: (companyId: string) => void;
  onCancel?: () => void;
  isFirstTimeSetup?: boolean;
}

export const CompanyRegistrationForm: React.FC<CompanyRegistrationFormProps> = ({
  onSuccess,
  onCancel,
  isFirstTimeSetup = false
}) => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    registration_number: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a company",
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Company name is required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const companySettings = {
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        registration_number: formData.registration_number
      };

      const { data: company, error } = await CompanyService.createCompany({
        name: formData.name,
        admin_user_id: user.id,
        settings: companySettings
      });

      if (error) {
        throw error;
      }

      if (!company) {
        throw new Error('Failed to create company');
      }

      toast({
        title: "Success",
        description: `Company "${company.name}" has been created successfully`,
      });

      // Refresh user profile to update any role changes
      await refreshProfile();

      if (onSuccess) {
        onSuccess(company.id);
      } else {
        // Navigate to appropriate dashboard based on setup type
        if (isFirstTimeSetup) {
          navigate('/admin-dashboard');
        } else {
          navigate('/company-management');
        }
      }
    } catch (error: any) {
      console.error('Error creating company:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create company",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building2 className="w-5 h-5 mr-2" />
          {isFirstTimeSetup ? 'Welcome! Set up your company' : 'Create New Company'}
        </CardTitle>
        <CardDescription>
          {isFirstTimeSetup 
            ? 'As the first user, you\'ll become a super admin. Let\'s set up your company to get started.'
            : 'Create a new livestock trading company and become its administrator.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Chalma Beef, Sparta Beef Master"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of your livestock trading company"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+27 XX XXX XXXX"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input
                id="registration_number"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                placeholder="Company registration number"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Business Address</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="Full business address including city and postal code"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-4">
            {!isFirstTimeSetup && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onCancel ? onCancel() : navigate(-1)}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isFirstTimeSetup ? 'Set Up Company' : 'Create Company'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyRegistrationForm;
