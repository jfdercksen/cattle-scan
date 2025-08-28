
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/languageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile, loading: authLoading, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      console.log('Auth is still loading, waiting...');
      return;
    }

    if (user && profile) {
      const redirectPath = getRoleRedirectPath();
      console.log('Redirecting to:', redirectPath, 'Current path:', location.pathname);
      // Only navigate if we are not already at the destination
      if (location.pathname !== redirectPath) {
        navigate(redirectPath);
      }
    }
  }, [user, profile, authLoading, navigate, location.pathname, getRoleRedirectPath]);

  // Enhanced input validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const content = {
    en: {
      signIn: 'Sign In',
      email: 'Email',
      password: 'Password',
      language: 'Language',
      backToHome: 'Back to Home',
      signInTitle: 'Welcome Back',
      signInDescription: 'Sign in to your Cattle Scan account',
      forgotPassword: 'Forgot Password?',
      resetPassword: 'Reset Password',
      resetPasswordTitle: 'Reset Your Password',
      resetPasswordDescription: 'Enter your email address and we\'ll send you a link to reset your password',
      sendResetLink: 'Send Reset Link',
      backToSignIn: 'Back to Sign In',
      roles: {}
    },
    af: {
      signIn: 'Teken In',
      email: 'E-pos',
      password: 'Wagwoord',
      language: 'Taal',
      backToHome: 'Terug na Tuis',
      signInTitle: 'Welkom Terug',
      signInDescription: 'Teken in by jou Cattle Scan rekening',
      forgotPassword: 'Wagwoord Vergeet?',
      resetPassword: 'Herstel Wagwoord',
      resetPasswordTitle: 'Herstel Jou Wagwoord',
      resetPasswordDescription: 'Voer jou e-pos adres in en ons sal jou \'n skakel stuur om jou wagwoord te herstel',
      sendResetLink: 'Stuur Herstel Skakel',
      backToSignIn: 'Terug na Teken In',
      roles: {}
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
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
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              {forgotPasswordMode ? <Mail className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {forgotPasswordMode ? t.resetPasswordTitle : t.signInTitle}
            </CardTitle>
            <CardDescription>
              {forgotPasswordMode ? t.resetPasswordDescription : t.signInDescription}
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
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
