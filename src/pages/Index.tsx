
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && profile) {
      // If user is logged in but profile is incomplete (no phone means incomplete)
      if (profile.status === 'pending' && !profile.phone) {
        navigate('/profile-completion');
      }
    }
  }, [user, profile, loading, navigate]);

  const handleGetStarted = () => {
    if (user) {
      // User is logged in, check if they need to complete profile
      if (profile?.status === 'pending' && !profile.phone) {
        navigate('/profile-completion');
      } else {
        // Profile is complete, show dashboard or main app
        console.log('User profile is complete');
      }
    } else {
      // User is not logged in, redirect to auth
      navigate('/auth');
    }
  };

  const handleSignOut = async () => {
    const { signOut } = useAuth();
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">Cattle Scan</h1>
        </div>
        
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">
              Welcome, {profile?.first_name || user.email}
              {profile?.status === 'pending' && (
                <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                  Pending Approval
                </span>
              )}
            </span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-slate-900 mb-6">
            Secure Cattle Traceability
          </h2>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            A comprehensive platform for tracking livestock from farm to table, ensuring food safety, 
            quality assurance, and regulatory compliance in the cattle industry.
          </p>
          
          {!user ? (
            <div className="space-x-4">
              <Button size="lg" onClick={handleGetStarted} className="px-8">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          ) : (
            <div className="space-x-4">
              <Button size="lg" onClick={handleGetStarted} className="px-8">
                {profile?.status === 'pending' && !profile.phone ? 'Complete Profile' : 'Continue to Dashboard'}
              </Button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <CardTitle>Secure Tracking</CardTitle>
              <CardDescription>
                End-to-end livestock traceability with blockchain-secured records
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Multi-User Platform</CardTitle>
              <CardDescription>
                Connect sellers, veterinarians, agents, and drivers in one ecosystem
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Compliance Ready</CardTitle>
              <CardDescription>
                Meet regulatory requirements with automated documentation and reporting
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* User Types */}
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-8">Who Can Join</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Sellers</h4>
              <p className="text-sm text-slate-600">Livestock owners and farmers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Veterinarians</h4>
              <p className="text-sm text-slate-600">Health certification and inspection</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Agents</h4>
              <p className="text-sm text-slate-600">Licensed livestock agents</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="font-semibold mb-2">Drivers</h4>
              <p className="text-sm text-slate-600">Transportation and logistics</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
