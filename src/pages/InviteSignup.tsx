import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/languageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { InvitationManager } from "@/services/invitationManager";

const InviteSignup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, user, profile, loading: authLoading, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  

  // Pending invitation state
  const [pendingInvitation, setPendingInvitation] = useState<{
    id: string;
    relationship_type: string;
    companies: { id: string; name: string };
  } | null>(null);
  

  // Only allow special buyer flow via explicit link param
  const isBuyerSignup = searchParams.get('buyer') === 'true';

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return;
    if (user && profile) {
      const redirectPath = getRoleRedirectPath();
      if (location.pathname !== redirectPath) navigate(redirectPath);
    }
  }, [user, profile, authLoading, navigate, location.pathname, getRoleRedirectPath]);

  // Validate helpers
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => {
    if (!phone) return true; // optional
    return /^[+]?[\d\s\-()]{10,}$/.test(phone);
  };

  // Determine if signup is allowed
  const isSignupAllowed = () => {
    if (isBuyerSignup) return true;
    if (pendingInvitation) return true;
    return false;
  };

  // Look up pending invitation by email to lock company and role
  useEffect(() => {
    const checkPendingInvitation = async () => {
      if (!email.trim() || !validateEmail(email.trim())) {
        setPendingInvitation(null);
        return;
      }
      try {
        type PendingInvitationInfo = Database['public']['Functions']['get_company_name_for_pending_invitation']['Returns'][number];
        const { data: invitationData, error } = await supabase
          .rpc('get_company_name_for_pending_invitation', { invitation_email: email.trim() });
        if (error) return;
        if (invitationData && Array.isArray(invitationData) && invitationData.length > 0) {
          const invitationInfo = invitationData[0] as PendingInvitationInfo;
          const invitation = {
            id: '',
            relationship_type: invitationInfo.relationship_type,
            companies: { id: invitationInfo.company_id, name: invitationInfo.company_name }
          };
          setPendingInvitation(invitation);
        } else {
          setPendingInvitation(null);
        }
      } catch (e) {
        console.error('Error checking pending invitations:', e);
        setPendingInvitation(null);
      }
    };

    const timeoutId = setTimeout(checkPendingInvitation, 400);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const content = {
    en: {
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      companyName: 'Company Name',
      buyerSignUpTitle: 'Buyer Registration',
      buyerSignUpDescription: 'Register as a buyer to access the platform',
      signUpTitle: 'Create Account',
      signUpDescription: 'Join the Cattle Scan platform via your invitation',
      backToHome: 'Back to Home',
    },
    af: {
      signUp: 'Registreer',
      email: 'E-pos',
      password: 'Wagwoord',
      confirmPassword: 'Bevestig Wagwoord',
      firstName: 'Voornaam',
      lastName: 'Van',
      phone: 'Telefoonnommer',
      companyName: 'Maatskappy Naam',
      buyerSignUpTitle: 'Koper Registrasie',
      buyerSignUpDescription: 'Registreer as koper om toegang tot die platform te kry',
      signUpTitle: 'Skep Rekening',
      signUpDescription: 'Sluit aan by Cattle Scan via jou uitnodiging',
      backToHome: 'Terug na Tuis',
    }
  } as const;

  const t = content[language];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      toast({ title: 'Error', description: 'Please enter a valid email address', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters long', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (!validatePhone(phone)) {
      toast({ title: 'Error', description: 'Please enter a valid phone number', variant: 'destructive' });
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: 'Error', description: 'First name and last name are required', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Determine role
      let assignedRole = pendingInvitation?.relationship_type || 'seller';
      if (!pendingInvitation && isBuyerSignup) assignedRole = 'super_admin';

      const signupData: Record<string, string | null> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        role: assignedRole,
        language,
        phone: phone.trim() || null,
      };

      const { error } = await signUp(email, password, signupData);
      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        // Link listing invitations if applicable
        try {
          const { data: { user: newUser } } = await supabase.auth.getUser();
          if (newUser) await InvitationManager.updateListingInvitationsAfterRegistration(email.trim(), newUser.id);
        } catch (invitationError) {
          console.error('Error updating listing invitations after registration:', invitationError);
        }
        toast({
          title: 'Success',
          description: isBuyerSignup ? 'Account created successfully! You are now the super admin.' : 'Account created successfully! Please wait for approval.',
          variant: 'default'
        });
        // Redirect handled by auth effect
      }
    } catch (err) {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-slate-600 hover:text-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToHome}
            </Link>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isBuyerSignup ? t.buyerSignUpTitle : t.signUpTitle}
            </CardTitle>
            <CardDescription>
              {isBuyerSignup ? t.buyerSignUpDescription : t.signUpDescription}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t.firstName}</Label>
                <Input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={50} />
              </div>
              <div>
                <Label htmlFor="lastName">{t.lastName}</Label>
                <Input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required maxLength={50} />
              </div>
            </div>

            <div>
              <Label htmlFor="email">{t.email}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={100} />
            </div>

            <div>
              <Label htmlFor="phone">{t.phone}</Label>
              <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={20} />
            </div>

            {pendingInvitation && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <Mail className="w-4 h-4 inline mr-1" />
                  You've been invited to join <strong>{pendingInvitation.companies.name}</strong> as a <strong>{pendingInvitation.relationship_type}</strong>
                </p>
              </div>
            )}

            <div>
              <Label htmlFor="password">{t.password}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            <div>
              <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !isSignupAllowed()}>
              {loading ? 'Creating Account...' : (!isSignupAllowed() ? 'Signup requires an invitation' : t.signUp)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteSignup;
