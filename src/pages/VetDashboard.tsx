
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import ProfileCompletion from '@/components/ProfileCompletionForm';

const VetDashboard = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, needsProfileCompletion } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/auth');
    } else if (profile && profile.role !== 'vet') {
      navigate('/');
    }
  }, [user, profile, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (needsProfileCompletion()) {
    return <ProfileCompletion />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Veterinarian Dashboard</h1>
            <p className="text-gray-600">Welcome back, Dr. {profile.first_name}!</p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="w-5 h-5 mr-2" />
                Health Certificates
              </CardTitle>
              <CardDescription>
                Issue and manage livestock health certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Manage Certificates</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Profile Status</CardTitle>
              <CardDescription>
                Your account status: {profile.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600">
                {profile.status === 'pending' && "Your account is pending approval"}
                {profile.status === 'approved' && "Your account is approved and active"}
                {profile.status === 'suspended' && "Your account has been suspended"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VetDashboard;
