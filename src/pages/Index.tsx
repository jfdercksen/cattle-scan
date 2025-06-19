
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beef, Shield, Users, Stethoscope, Truck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading, signOut, needsProfileCompletion, getRoleRedirectPath } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      if (needsProfileCompletion()) {
        navigate('/profile-completion');
        return;
      }
      
      // User is logged in and profile is complete, but we're still on index
      // This means they navigated here directly or were redirected here
      // Don't auto-redirect, let them choose to go to dashboard
    }
  }, [user, profile, loading, navigate, needsProfileCompletion]);

  const handleGoToDashboard = () => {
    if (profile) {
      navigate(getRoleRedirectPath());
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // User is signed in and has completed profile
  if (user && profile && !needsProfileCompletion()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Beef className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Welcome back!</CardTitle>
            <CardDescription>
              You're already signed in to Cattle Scan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGoToDashboard} className="w-full" size="lg">
              Go to Dashboard
            </Button>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Signed in as {profile.first_name}</span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User is not signed in or needs profile completion
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Beef className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Cattle Scan</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Digital Livestock
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600">
              Management Platform
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Streamline your cattle operations with our comprehensive digital platform for farmers, agents, veterinarians, and transporters.
          </p>
          <div className="space-x-4">
            <Button onClick={() => navigate('/auth')} size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700">
              Get Started
            </Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Beef className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>Sellers</CardTitle>
              <CardDescription>
                Manage your livestock inventory and connect with buyers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Agents</CardTitle>
              <CardDescription>
                Facilitate transactions and provide market expertise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Veterinarians</CardTitle>
              <CardDescription>
                Monitor animal health and provide medical services
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Drivers</CardTitle>
              <CardDescription>
                Handle livestock transportation and logistics
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
