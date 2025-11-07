
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ProfileCompletion from '@/components/ProfileCompletionForm';
import { useTranslation } from '@/i18n/useTranslation';

const AgentDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, initialized, signOut, needsProfileCompletion } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (loading || !initialized) return;
    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'agent') {
      navigate('/');
    }
  }, [user, profile, loading, initialized, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusLabel = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return t('agentDashboard', 'statusLabelPending');
      case 'approved':
        return t('agentDashboard', 'statusLabelApproved');
      case 'suspended':
        return t('agentDashboard', 'statusLabelSuspended');
      default:
        return t('agentDashboard', 'statusLabelUnknown');
    }
  };

  const getStatusMessage = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return t('agentDashboard', 'statusPendingMessage');
      case 'approved':
        return t('agentDashboard', 'statusApprovedMessage');
      case 'suspended':
        return t('agentDashboard', 'statusSuspendedMessage');
      default:
        return t('agentDashboard', 'statusUnknownMessage');
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">{t('agentDashboard', 'loading')}</div>
      </div>
    );
  }

  if (needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('agentDashboard', 'pageTitle')}</h1>
            <p className="text-gray-600">{t('agentDashboard', 'welcomeMessage').replace('{name}', profile.first_name || '')}</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            {t('common', 'signOut')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="w-5 h-5 mr-2" />
                {t('agentDashboard', 'clientCardTitle')}
              </CardTitle>
              <CardDescription>
                {t('agentDashboard', 'clientCardDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">{t('agentDashboard', 'clientCardButton')}</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('agentDashboard', 'profileStatusTitle')}</CardTitle>
              <CardDescription>
                {t('agentDashboard', 'profileStatusDescription').replace('{status}', getStatusLabel(profile.status))}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {getStatusMessage(profile.status)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
