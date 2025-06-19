
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, CheckCircle, Globe } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, needsProfileCompletion, getRoleRedirectPath } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      console.log('Index: User is authenticated, checking profile completion status');
      console.log('Profile completion needed:', needsProfileCompletion());
      console.log('Profile completed flag:', profile.profile_completed);
      
      if (needsProfileCompletion()) {
        console.log('Redirecting to profile completion');
        navigate('/profile-completion');
      } else {
        console.log('Redirecting to role-specific dashboard:', getRoleRedirectPath());
        navigate(getRoleRedirectPath());
      }
    }
  }, [user, profile, loading, navigate, needsProfileCompletion, getRoleRedirectPath]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Redirecting...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Cattle Scan</span>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">Cattle Scan</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            The comprehensive platform for livestock management, connecting sellers, agents, veterinarians, and drivers in one secure ecosystem.
          </p>
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
              Get Started Today
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto text-emerald-600 mb-4" />
              <CardTitle>For Sellers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                List and manage your livestock with comprehensive health tracking and documentation.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Shield className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <CardTitle>For Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Connect buyers and sellers with verified livestock and streamlined transactions.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <CardTitle>For Veterinarians</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Provide health certifications and manage livestock medical records digitally.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="w-12 h-12 mx-auto text-purple-600 mb-4" />
              <CardTitle>For Drivers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Coordinate livestock transportation with real-time tracking and documentation.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-6">Why Choose Cattle Scan?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Secure & Verified</h3>
              <p className="text-slate-600">All users are verified and transactions are secure with comprehensive audit trails.</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Health Tracking</h3>
              <p className="text-slate-600">Complete livestock health records with veterinary certifications and vaccination tracking.</p>
            </div>
            <div>
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connected Ecosystem</h3>
              <p className="text-slate-600">Bringing together all stakeholders in the livestock industry on one platform.</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Cattle Scan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
