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
import { useTranslation } from "@/i18n/useTranslation";

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
  const { t } = useTranslation();

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
        title: t('common', 'errorTitle'),
        description: t('companyRegistration', 'loginRequired'),
        variant: "destructive"
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: t('common', 'errorTitle'),
        description: t('companyRegistration', 'nameRequired'),
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
        throw new Error(t('companyRegistration', 'createFailed'));
      }

      toast({
        title: t('common', 'successTitle'),
        description: t('companyRegistration', 'successDescription').replace('{company}', company.name),
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
    } catch (error: unknown) {
      console.error('Error creating company:', error);
      const fallback = t('companyRegistration', 'createFailed');
      const description = error instanceof Error && error.message && error.message !== fallback
        ? error.message
        : fallback;
      toast({
        title: t('common', 'errorTitle'),
        description,
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
          {isFirstTimeSetup
            ? t('companyRegistration', 'firstTimeTitle')
            : t('companyRegistration', 'defaultTitle')}
        </CardTitle>
        <CardDescription>
          {isFirstTimeSetup 
            ? t('companyRegistration', 'firstTimeDescription')
            : t('companyRegistration', 'defaultDescription')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              {t('companyRegistration', 'companyNameLabel')}
              <span className="text-red-500"> *</span>
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder={t('companyRegistration', 'companyNamePlaceholder')}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('companyRegistration', 'descriptionLabel')}</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={t('companyRegistration', 'descriptionPlaceholder')}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t('companyRegistration', 'phoneLabel')}</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('companyRegistration', 'phonePlaceholder')}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_number">{t('companyRegistration', 'registrationLabel')}</Label>
              <Input
                id="registration_number"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleInputChange}
                placeholder={t('companyRegistration', 'registrationPlaceholder')}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">{t('companyRegistration', 'addressLabel')}</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder={t('companyRegistration', 'addressPlaceholder')}
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
                {t('common', 'cancel')}
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isFirstTimeSetup
                ? t('companyRegistration', 'submitSetup')
                : t('companyRegistration', 'submitCreate')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CompanyRegistrationForm;
