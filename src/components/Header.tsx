import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/contexts/auth';  

export const Header = () => {
  const [language, setLanguage] = useState('en');
  const { user, signOut, loading } = useAuth();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Cattle Scan</span>
          </div>
          <div className="flex items-center space-x-4">
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
            <ThemeToggle />
            {loading ? null : (
              user ? (
                <Button variant="outline" onClick={signOut}>Sign Out</Button>
              ) : (
                <Link to="/auth">
                  <Button variant="outline">Sign In</Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
