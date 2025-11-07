
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useTranslation } from "@/i18n/useTranslation";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user, profile, loading: authLoading, initialized, getRoleRedirectPath } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Don't do anything while auth is still loading or not initialized
    if (authLoading || !initialized) {
      return;
    }

    if (user && profile) {
      const redirectPath = getRoleRedirectPath();
      // Only navigate if we are not already at the destination
      if (location.pathname !== redirectPath) {
        navigate(redirectPath, { replace: true });
      }
    }
  }, [user, profile, authLoading, initialized, navigate, location.pathname, getRoleRedirectPath]);

  // Enhanced input validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!validateEmail(email)) {
      toast({
        title: t("common", "errorTitle"),
        description: t("auth", "invalidEmailDescription"),
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast({
          title: t("common", "errorTitle"),
          description: error.message,
          variant: "destructive"
        });
      }
      // Navigation will be handled by useEffect when user/profile state updates
    } catch (error) {
      toast({
        title: t("common", "errorTitle"),
        description: t("auth", "unexpectedErrorDescription"),
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
          title: t("common", "errorTitle"),
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: t("common", "successTitle"),
          description: t("auth", "resetPasswordSuccess"),
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
              {t("common", "backToHome")}
            </Link>
            <div className="flex items-center space-x-2">
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              {forgotPasswordMode ? <Mail className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
            </div>
            <CardTitle className="text-2xl font-bold">
              {forgotPasswordMode ? t("auth", "resetPasswordTitle") : t("auth", "signInTitle")}
            </CardTitle>
            <CardDescription>
              {forgotPasswordMode ? t("auth", "resetPasswordDescription") : t("auth", "signInDescription")}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {forgotPasswordMode ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Label htmlFor="reset-email">{t("common", "email")}</Label>
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
                {loading ? t("common", "sending") : t("auth", "sendResetLink")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setForgotPasswordMode(false)}
              >
                {t("auth", "backToSignIn")}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">{t("common", "email")}</Label>
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
                <Label htmlFor="signin-password">{t("common", "password")}</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("common", "signingIn") : t("auth", "signIn")}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-sm text-slate-600 hover:text-slate-800"
                  onClick={() => setForgotPasswordMode(true)}
                >
                  {t("auth", "forgotPassword")}
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
