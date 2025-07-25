
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/languageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InvitationManager } from "@/services/invitationManager";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, signIn, user, profile, needsProfileCompletion, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('view') || 'signin');
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState(searchParams.get('role') || 'seller');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Pending invitation state
  const [pendingInvitation, setPendingInvitation] = useState<{
    id: string;
    relationship_type: string;
    companies: { id: string; name: string };
  } | null>(null);
  const [isCompanyNameLocked, setIsCompanyNameLocked] = useState(false);

  // Helper function to determine if signup should be allowed
  const isSignupAllowed = () => {
    // Allow signup if using special admin/buyer link
    if (isBuyerSignup) {
      return true;
    }
    // Allow signup if user has a valid pending invitation
    if (pendingInvitation) {
      return true;
    }
    // Otherwise, disable signup
    return false;
  };

  // Check if this is buyer signup (hidden route)
  const isBuyerSignup = searchParams.get('buyer') === 'true';

  useEffect(() => {
    if (user && profile) {
      const redirectPath = getRoleRedirectPath();
      // Only navigate if we are not already at the destination
      if (location.pathname !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [user, profile, navigate, getRoleRedirectPath, location.pathname]);

  // Check for pending invitations when email changes
  useEffect(() => {
    const checkPendingInvitation = async () => {
      if (!email.trim() || !validateEmail(email.trim())) {
        setPendingInvitation(null);
        setIsCompanyNameLocked(false);
        setCompanyName('');
        return;
      }

      try {
        // Use security definer function to avoid RLS recursion issues
        const { data: invitationData, error } = await supabase
          .rpc('get_company_name_for_pending_invitation' as any, {
            invitation_email: email.trim()
          }) as { data: any[] | null, error: any };
        
        if (error) {
          return;
        }
        
        if (invitationData && Array.isArray(invitationData) && invitationData.length > 0) {
          const invitationInfo = invitationData[0];
          
          // Create the expected data structure for pendingInvitation state
          const invitation = {
            id: '', // We don't need the invitation ID for role assignment
            relationship_type: invitationInfo.relationship_type,
            companies: {
              id: invitationInfo.company_id,
              name: invitationInfo.company_name
            }
          };
          
          setPendingInvitation(invitation);
          
          // If the invitation is for admin role, lock the company name
          if (invitationInfo.relationship_type === 'admin') {
            setCompanyName(invitationInfo.company_name);
            setIsCompanyNameLocked(true);
          } else {
            setIsCompanyNameLocked(false);
          }
        } else {
          setPendingInvitation(null);
          setIsCompanyNameLocked(false);
          if (isCompanyNameLocked) {
            setCompanyName('');
          }
        }
      } catch (error) {
        console.error('Error checking pending invitations:', error);
        setPendingInvitation(null);
        setIsCompanyNameLocked(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(checkPendingInvitation, 500);
    return () => clearTimeout(timeoutId);
  }, [email, isCompanyNameLocked]);

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
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      resetPasswordTitle: 'Reset Your Password',
      resetPasswordDescription: 'Enter your email address and we\'ll send you a link to reset your password',
      sendResetLink: 'Send Reset Link',
      backToSignIn: 'Back to Sign In',
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
      forgotPassword: 'Wagwoord Vergeet?',
      resetPassword: 'Herstel Wagwoord',
      resetPasswordTitle: 'Herstel Jou Wagwoord',
      resetPasswordDescription: 'Voer jou e-pos adres in en ons sal jou \'n skakel stuur om jou wagwoord te herstel',
      sendResetLink: 'Stuur Herstel Skakel',
      backToSignIn: 'Terug na Teken In',
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
      }
      // Navigation will be handled by useEffect when user/profile state updates
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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
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
          description: "Password reset link sent! Check your email.",
          variant: "default"
        });
        setForgotPasswordMode(false);
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
      // Check for pending invitations to determine the correct role
      let assignedRole = role;
      
      // Use the pendingInvitation state that was already fetched by useEffect
      if (pendingInvitation) {
        // Use role from pending invitation (admin, seller, etc.)
        assignedRole = pendingInvitation.relationship_type;
      } else if (isBuyerSignup) {
        // No pending invitations but using special buyer link - this is the first user (super admin)
        assignedRole = 'super_admin';
      }

      // For invited users, don't create a new company - they'll be linked to existing company
      const signupData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: assignedRole, // Use the correctly determined role
        language: language,
        phone: phone.trim() || null
      };
      
      // Only create a new company if user is NOT invited (i.e., super_admin via special link)
      if (!pendingInvitation && isBuyerSignup) {
        signupData.company_name = companyName.trim() || null;
      }
      
      const { error } = await signUp(email, password, signupData);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Update listing invitations with the new user ID after successful registration
        try {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) {
            await InvitationManager.updateListingInvitationsAfterRegistration(email.trim(), newUser.id);
          }
        } catch (invitationError) {
          console.error('Error updating listing invitations after registration:', invitationError);
          // Don't show error to user as this is a background operation
        }

        toast({
          title: "Success",
          description: isBuyerSignup 
            ? "Account created successfully! You are now the super admin."
            : "Account created successfully! Please wait for approval.",
          variant: "default"
        });
        // Navigation will be handled by useEffect when user/profile state updates
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
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              {forgotPasswordMode ? <Mail className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {forgotPasswordMode ? t.resetPasswordTitle : 
               isBuyerSignup ? t.buyerSignUpTitle : 
               (activeTab === 'signin' ? t.signInTitle : t.signUpTitle)}
            </CardTitle>
            <CardDescription>
              {forgotPasswordMode ? t.resetPasswordDescription :
               isBuyerSignup ? t.buyerSignUpDescription : 
               (activeTab === 'signin' ? t.signInDescription : t.signUpDescription)}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">{t.email}</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={100}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Sending...' : t.sendResetLink}
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                className="w-full" 
                onClick={() => setForgotPasswordMode(false)}
              >
                {t.backToSignIn}
              </Button>
            </form>
          ) : isBuyerSignup ? (
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
              
              <Button type="submit" className="w-full" disabled={loading || !isSignupAllowed()}>
                {loading ? 'Creating Account...' : 
                 !isSignupAllowed() ? 'Signup requires an invitation' : t.signUp}
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
                  
                  <div className="text-center">
                    <Button 
                      type="button" 
                      variant="link" 
                      className="text-sm text-slate-600 hover:text-slate-800"
                      onClick={() => setForgotPasswordMode(true)}
                    >
                      {t.forgotPassword}
                    </Button>
                  </div>
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
                  
                  {/* Role selection removed - role is determined by pending invitation */}
                  
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
                    {pendingInvitation && (
                      <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-800">
                          <Mail className="w-4 h-4 inline mr-1" />
                          You've been invited to join <strong>{pendingInvitation.companies.name}</strong> as a <strong>{pendingInvitation.relationship_type}</strong>
                        </p>
                      </div>
                    )}
                    <Input
                      id="signup-companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => !isCompanyNameLocked && setCompanyName(e.target.value)}
                      maxLength={100}
                      disabled={isCompanyNameLocked}
                      className={isCompanyNameLocked ? 'bg-gray-100 cursor-not-allowed' : ''}
                      placeholder={isCompanyNameLocked ? 'Company set by invitation' : 'Enter company name'}
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
                  
                  <Button type="submit" className="w-full" disabled={loading || !isSignupAllowed()}>
                    {loading ? 'Creating Account...' : 
                     !isSignupAllowed() ? 'Signup requires an invitation' : t.signUp}
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
