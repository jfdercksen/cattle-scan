import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './auth';
import { MultiTenantDashboardController, type CompanyContext } from '@/services/multiTenantDashboardController';
import { CompanyService, type Company } from '@/services/companyService';
import { supabase } from '@/integrations/supabase/client';

interface CompanyContextType {
  // Current company context
  currentCompany: CompanyContext | null;
  setCurrentCompany: (company: CompanyContext | null) => void;
  
  // Available companies for the user
  userCompanies: CompanyContext[];
  
  // Company data
  companies: Company[];
  
  // Loading states
  loading: boolean;
  
  // Methods
  refreshCompanies: () => Promise<void>;
  switchCompany: (companyId: string) => void;
  canAccessCompany: (companyId: string) => boolean;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const { user, profile, initialized } = useAuth();
  
  const [currentCompany, setCurrentCompany] = useState<CompanyContext | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyContext[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize company context when user changes
  useEffect(() => {
    if (!initialized) {
      return;
    }
    
    if (user && profile) {
      initializeCompanyContext();
    } else {
      // Reset state when user logs out
      setCurrentCompany(null);
      setUserCompanies([]);
      setCompanies([]);
      setLoading(false);
    }
  }, [user, profile, initialized]);

  const initializeCompanyContext = async () => {
    if (!user || !profile) return;

    setLoading(true);
    try {
      if (profile.role === 'super_admin') {
        // Super admin can access all companies
        await loadAllCompanies();
      } else {
        // Regular users load their associated companies
        await loadUserCompanies();
      }
    } catch (error) {
      console.error('Error initializing company context:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllCompanies = async () => {
    if (!user) return;

    try {
      // Get all companies for super admin
      const { data: allCompanies, error: companiesError } = await CompanyService.getCompanies();
      if (companiesError) throw companiesError;

      const companyIds = (allCompanies || []).map(company => company.id);
      const settingsMap = await fetchCompanySettingsMap(companyIds);
      const companiesWithSettings = (allCompanies || []).map(company => ({
        ...company,
        name: settingsMap.get(company.id) ?? company.name,
      }));
      setCompanies(companiesWithSettings);

      // Create contexts for all companies (super admin has access to all)
      const contexts: CompanyContext[] = (allCompanies || []).map(company => ({
        companyId: company.id,
        companyName: settingsMap.get(company.id) ?? company.name,
        userRole: 'super_admin'
      }));

      setUserCompanies(contexts);

      // Set first company as current if none selected
      if (!currentCompany && contexts.length > 0) {
        setCurrentCompany(contexts[0]);
      }
    } catch (error) {
      console.error('Error loading all companies:', error);
    }
  };

  const loadUserCompanies = async () => {
    if (!user) return;

    try {
      // Get user's company contexts
      const { data: contexts, error: contextsError } = await MultiTenantDashboardController.getUserCompanyContexts(user.id);
      if (contextsError) throw contextsError;

      const companyIds = contexts?.map(c => c.companyId) || [];
      const settingsMap = await fetchCompanySettingsMap(companyIds);
      const contextsWithSettings = (contexts || []).map(ctx => ({
        ...ctx,
        companyName: settingsMap.get(ctx.companyId) ?? ctx.companyName
      }));
      setUserCompanies(contextsWithSettings);

      // Get company details
      if (companyIds.length > 0) {
        const { data: userCompaniesData, error: companiesError } = await CompanyService.getUserCompanies(user.id);
        if (companiesError) throw companiesError;
        const companiesWithSettings = (userCompaniesData || []).map(company => ({
          ...company,
          name: settingsMap.get(company.id) ?? company.name,
        }));
        setCompanies(companiesWithSettings);
      }

      // Set first company as current if none selected
      if (!currentCompany && contexts && contexts.length > 0) {
        setCurrentCompany(contexts[0]);
      }
    } catch (error) {
      console.error('Error loading user companies:', error);
    }
  };

  const refreshCompanies = async () => {
    await initializeCompanyContext();
  };

  const fetchCompanySettingsMap = async (companyIds: string[]) => {
    if (!companyIds.length) return new Map<string, string>();
    const { data, error } = await supabase
      .from('company_settings')
      .select('company_id, registered_name')
      .in('company_id', companyIds);

    if (error) {
      console.error('Error fetching company settings names:', error);
      return new Map<string, string>();
    }

    const map = new Map<string, string>();
    (data || []).forEach((row: { company_id: string; registered_name: string | null }) => {
      if (row.registered_name) {
        map.set(row.company_id, row.registered_name);
      }
    });
    return map;
  };

  const switchCompany = (companyId: string) => {
    const company = userCompanies.find(c => c.companyId === companyId);
    if (company) {
      setCurrentCompany(company);
      // Store in localStorage for persistence
      localStorage.setItem('selectedCompanyId', companyId);
    }
  };

  const canAccessCompany = (companyId: string): boolean => {
    if (profile?.role === 'super_admin') return true;
    return userCompanies.some(c => c.companyId === companyId);
  };

  // Load persisted company selection on init
  useEffect(() => {
    const savedCompanyId = localStorage.getItem('selectedCompanyId');
    if (savedCompanyId && userCompanies.length > 0) {
      const savedCompany = userCompanies.find(c => c.companyId === savedCompanyId);
      if (savedCompany) {
        setCurrentCompany(savedCompany);
      }
    }
  }, [userCompanies]);

  const value: CompanyContextType = {
    currentCompany,
    setCurrentCompany,
    userCompanies,
    companies,
    loading,
    refreshCompanies,
    switchCompany,
    canAccessCompany
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export default CompanyProvider;
