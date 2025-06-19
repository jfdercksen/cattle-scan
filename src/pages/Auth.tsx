import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn, user } = useAuth();
  const { toast } = useToast();
  
  const [language, setLanguage] = useState<'en' | 'af'>('en');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signin');
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'seller');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Check if this is buyer signup (hidden route)
  const isBuyerSignup = searchParams.get('buyer') === 'true';

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Enhanced input validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const content = {
    en: {
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      companyName: 'Company Name',
      role: 'Role',
      language: 'Language',
      backToHome: 'Back to Home',
      signInTitle: 'Welcome Back',
      signInDescription: 'Sign in to your Cattle Scan account',
      signUpTitle: 'Create Account',
      signUpDescription: 'Join the Cattle Scan platform',
      buyerSignUpTitle: 'Buyer Registration',
      buyerSignUpDescription: 'Register as a buyer to access the platform',
      roles: {
        seller: 'Seller',
        vet: 'Veterinarian',
        agent: 'Agent',
        driver: 'Driver'
      }
    },
    af: {
      signIn: 'Teken In',
      signUp: 'Registreer',
      email: 'E-pos',
      password: 'Wagwoord',
      confirmPassword: 'Bevestig Wagwoord',
      firstName: 'Voornaam',
      lastName: 'Van',
      phone: 'Telefoonnommer',
      companyName: 'Maatskappy Naam',
      role: 'Rol',
      language: 'Taal',
      backToHome: 'Terug na Tuis',
      signInTitle: 'Welkom Terug',
      signInDescription: 'Teken in by jou Cattle Scan rekening',
      signUpTitle: 'Skep Rekening',
      signUpDescription: 'Sluit aan by die Cattle Scan platform',
      buyerSignUpTitle: 'Koper Registrasie',
      buyerSignUpDescription: 'Registreer as \'n koper om toegang tot die platform te kry',
      roles: {
        seller: 'Verkoper',
        vet: 'Veearts',
        agent: 'Agent',
        driver: 'Bestuurder'
      }
    }
  };

  const t = content[language];

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Enhanced client-side validation
    if (!validateEmail(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (!validatePhone(phone)) {
      toast({
        title: "Error",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      toast({
        title: "Error",
        description: "First name and last name are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(email, password, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: isBuyerSignup ? 'admin' : role, // This will be converted to 'super_admin' in useAuth
        language: language,
        phone: phone.trim() || null,
        company_name: companyName.trim() || null
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: isBuyerSignup 
            ? "Account created successfully! You are now the super admin."
            : "Account created successfully! Please wait for approval.",
          variant: "default"
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Link>
            <div className="flex items-center space-x-2">
              <Button
                variant={language === 'en' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
              <Button
                variant={language === 'af' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLanguage('af')}
              >
                AF
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isBuyerSignup ? t.buyerSignUpTitle : (activeTab === 'signin' ? t.signInTitle : t.signUpTitle)}
            </CardTitle>
            <CardDescription>
              {isBuyerSignup ? t.buyerSignUpDescription : (activeTab === 'signin' ? t.signInDescription : t.signUpDescription)}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {isBuyerSignup ? (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t.firstName}</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t.lastName}</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    maxLength={50}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={20}
                />
              </div>
              
              <div>
                <Label htmlFor="companyName">{t.companyName}</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  maxLength={100}
                />
              </div>
              
              <div>
                <Label htmlFor="password">{t.password}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : t.signUp}
              </Button>
            </form>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t.signIn}</TabsTrigger>
                <TabsTrigger value="signup">{t.signUp}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div>
                    <Label htmlFor="signin-email">{t.email}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signin-password">{t.password}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : t.signIn}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="signup-firstName">{t.firstName}</Label>
                      <Input
                        id="signup-firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        maxLength={50}
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-lastName">{t.lastName}</Label>
                      <Input
                        id="signup-lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        maxLength={50}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-email">{t.email}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-role">{t.role}</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seller">{t.roles.seller}</SelectItem>
                        <SelectItem value="vet">{t.roles.vet}</SelectItem>
                        <SelectItem value="agent">{t.roles.agent}</SelectItem>
                        <SelectItem value="driver">{t.roles.driver}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-phone">{t.phone}</Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={20}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-companyName">{t.companyName}</Label>
                    <Input
                      id="signup-companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      maxLength={100}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-password">{t.password}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="signup-confirmPassword">{t.confirmPassword}</Label>
                    <Input
                      id="signup-confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : t.signUp}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
