import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCompany } from "@/contexts/companyContext";
import { Building2, ChevronDown, Users } from "lucide-react";

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
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'seller':
        return 'Seller';
      case 'vet':
        return 'Veterinarian';
      case 'agent':
        return 'Agent';
      case 'load_master':
        return 'Load Master';
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
            Company Context
          </CardTitle>
          <CardDescription>
            {userCompanies.length === 1 
              ? 'You are associated with one company'
              : `Switch between your ${userCompanies.length} companies`
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
                    Your role: {getRoleDisplayName(currentCompany?.userRole || '')}
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
                  <SelectValue placeholder="Select a company" />
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
                        Active: {currentCompany.companyName}
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
          <SelectValue placeholder="Select company">
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
