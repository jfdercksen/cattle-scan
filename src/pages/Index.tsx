import { Button } from "@/components/ui/button";
 import { ChevronRight, Shield } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/languageContext";

interface ContentStructure {
  hero: {
    title: string;
    cta: string;
  };
  footer: {
    company: string;
    privacy: string;
    terms: string;
  };
}

const Index = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const content: Record<'en' | 'af', ContentStructure> = {
    en: {
      hero: {
        title: "Cattle Scan",
        cta: "Sign In",
      },
      footer: {
        company: "Powered By Workbalance",
        privacy: "Privacy Policy",
        terms: "Terms of Service",
      },
    },
    af: {
      hero: {
        title: "Cattle Scan",
        cta: "Teken In",
      },
      footer: {
        company: "Powered By Workbalance",
        privacy: "Privaatheid Beleid",
        terms: "Terme van Diens",
      },
    },
  };

  const t = content[language];

  if (user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-140px)] flex flex-col bg-white">

      {/* Minimal Hero */}
      <main className="flex-1 flex items-start justify-center pt-16 md:pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-800 bg-clip-text text-transparent">
            {t.hero.title}
          </h1>
          <div className="flex justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                {t.hero.cta}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cattle Scan</span>
            </div>
            <a 
              href="https://modernmanagement.co.za/workbalance/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-white transition-colors text-center md:text-left mb-4 md:mb-0 block"
            >
              {t.footer.company}
            </a>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.privacy}</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">{t.footer.terms}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
