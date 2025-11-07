import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/companyContext";
import { Building2, ChevronDown, Users } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface CompanySelectorProps {
  showCard?: boolean;
  className?: string;
}

export const CompanySelector: React.FC<CompanySelectorProps> = ({ 
  showCard = false, 
  className = "" 
}) => {
  const { 
    currentCompany, 
    userCompanies, 
    switchCompany, 
    loading 
  } = useCompany();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="animate-pulse bg-slate-200 h-8 w-32 rounded"></div>
      </div>
    );
  }

  if (userCompanies.length === 0) {
    return null;
  }

  const handleCompanyChange = (companyId: string) => {
    switchCompany(companyId);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return t('companySelector', 'roleSuperAdmin');
      case 'admin':
        return t('companySelector', 'roleAdmin');
      case 'seller':
        return t('companySelector', 'roleSeller');
      case 'vet':
        return t('companySelector', 'roleVet');
      case 'agent':
        return t('companySelector', 'roleAgent');
      case 'load_master':
        return t('companySelector', 'roleLoadMaster');
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'seller':
        return 'bg-green-100 text-green-800';
      case 'vet':
        return 'bg-emerald-100 text-emerald-800';
      case 'agent':
        return 'bg-orange-100 text-orange-800';
      case 'load_master':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (showCard) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="w-5 h-5 mr-2" />
            {t('companySelector', 'title')}
          </CardTitle>
          <CardDescription>
            {userCompanies.length === 1 
              ? t('companySelector', 'singleCompanyDescription')
              : t('companySelector', 'multipleCompaniesDescription').replace('{count}', String(userCompanies.length))
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userCompanies.length === 1 ? (
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div className="flex items-center space-x-3">
                <Building2 className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="font-medium text-slate-900">{currentCompany?.companyName}</p>
                  <p className="text-sm text-slate-600">
                    {t('companySelector', 'yourRole').replace('{role}', getRoleDisplayName(currentCompany?.userRole || ''))}
                  </p>
                </div>
              </div>
              <Badge className={getRoleBadgeColor(currentCompany?.userRole || '')}>
                {getRoleDisplayName(currentCompany?.userRole || '')}
              </Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <Select
                value={currentCompany?.companyId || ''}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('companySelector', 'selectPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {userCompanies.map((company) => (
                    <SelectItem key={company.companyId} value={company.companyId}>
                      <div className="flex items-center justify-between w-full">
                        <span>{company.companyName}</span>
                        <Badge 
                          variant="secondary" 
                          className={`ml-2 ${getRoleBadgeColor(company.userRole)}`}
                        >
                          {getRoleDisplayName(company.userRole)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {currentCompany && (
                <div className="p-3 border rounded-lg bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-900">
                        {t('companySelector', 'activeLabel').replace('{company}', currentCompany.companyName)}
                      </span>
                    </div>
                    <Badge className={getRoleBadgeColor(currentCompany.userRole)}>
                      {getRoleDisplayName(currentCompany.userRole)}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Compact selector for header/toolbar use
  if (userCompanies.length === 1) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Building2 className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-900">
          {currentCompany?.companyName}
        </span>
        <Badge 
          variant="secondary" 
          className={getRoleBadgeColor(currentCompany?.userRole || '')}
        >
          {getRoleDisplayName(currentCompany?.userRole || '')}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Building2 className="w-4 h-4 text-slate-600" />
      <Select
        value={currentCompany?.companyId || ''}
        onValueChange={handleCompanyChange}
      >
        <SelectTrigger className="w-auto min-w-[200px] h-8 text-sm">
          <SelectValue placeholder={t('companySelector', 'selectCompactPlaceholder')}>
            {currentCompany && (
              <div className="flex items-center space-x-2">
                <span>{currentCompany.companyName}</span>
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getRoleBadgeColor(currentCompany.userRole)}`}
                >
                  {getRoleDisplayName(currentCompany.userRole)}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {userCompanies.map((company) => (
            <SelectItem key={company.companyId} value={company.companyId}>
              <div className="flex items-center justify-between w-full">
                <span>{company.companyName}</span>
                <Badge 
                  variant="secondary" 
                  className={`ml-2 text-xs ${getRoleBadgeColor(company.userRole)}`}
                >
                  {getRoleDisplayName(company.userRole)}
                </Badge>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CompanySelector;
