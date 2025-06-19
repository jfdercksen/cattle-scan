import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Users, FileCheck, Truck, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/theme-toggle";

interface RoleContent {
  title: string;
  description: string;
  features: string[];
}

interface ContentStructure {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    cta: string;
  };
  roles: {
    title: string;
    subtitle: string;
    seller: RoleContent;
    vet: RoleContent;
    agent: RoleContent;
    driver: RoleContent;
  };
  features: {
    title: string;
    items: Array<{
      icon: any;
      title: string;
      description: string;
    }>;
  };
  footer: {
    company: string;
    privacy: string;
    terms: string;
  };
}

const Index = () => {
  const [language, setLanguage] = useState<'en' | 'af'>('en');
  const { user } = useAuth();

  const content: Record<'en' | 'af', ContentStructure> = {
    en: {
      hero: {
        title: "Cattle Scan",
        subtitle: "Advanced Biosecurity & Traceability Platform",
        description: "Streamline cattle transactions with digital attestation, veterinary inspections, and complete supply chain visibility. Built for the modern livestock industry.",
        cta: "Get Started Today"
      },
      roles: {
        title: "Choose Your Role",
        subtitle: "Join our comprehensive platform designed for every stakeholder in the cattle industry",
        seller: {
          title: "Seller",
          description: "List your cattle, manage farm biosecurity, and connect with verified buyers",
          features: ["Farm Management", "Biosecurity Tracking", "Direct Sales"]
        },
        vet: {
          title: "Veterinarian",
          description: "Conduct inspections, issue certificates, and maintain professional credentials",
          features: ["Digital Certificates", "Inspection Scheduling", "Compliance Tracking"]
        },
        agent: {
          title: "Agent",
          description: "Facilitate transactions, manage multiple sellers, and expand your network",
          features: ["Multi-Farm Management", "Transaction Facilitation", "Client Network"]
        },
        driver: {
          title: "Driver",
          description: "Manage transport logistics with digital validation and route tracking",
          features: ["Route Optimization", "Digital Validation", "Delivery Confirmation"]
        }
      },
      features: {
        title: "Why Choose Cattle Scan?",
        items: [
          {
            icon: Shield,
            title: "Biosecurity Compliance",
            description: "Ensure full compliance with biosecurity regulations and maintain detailed audit trails"
          },
          {
            icon: FileCheck,
            title: "Digital Attestation",
            description: "Generate tamper-proof digital certificates and documentation for every transaction"
          },
          {
            icon: Users,
            title: "Multi-Role Platform",
            description: "Seamlessly connect sellers, buyers, veterinarians, agents, and drivers"
          },
          {
            icon: Truck,
            title: "Complete Traceability",
            description: "Track cattle from farm to final destination with complete transparency"
          }
        ]
      },
      footer: {
        company: "Built for the future of livestock management",
        privacy: "Privacy Policy",
        terms: "Terms of Service"
      }
    },
    af: {
      hero: {
        title: "Cattle Scan",
        subtitle: "Gevorderde Biosekuriteit & Naspeurbaarheidsplatform",
        description: "Vereenvoudig beestransaksies met digitale attestasie, veeartsenykige inspeksies, en volledige voorsieningskettingsigbaarheid. Gebou vir die moderne veebedryf.",
        cta: "Begin Vandag"
      },
      roles: {
        title: "Kies Jou Rol",
        subtitle: "Sluit aan by ons omvattende platform wat ontwerp is vir elke belanghebbende in die veebedryf",
        seller: {
          title: "Verkoper",
          description: "Lys jou vee, bestuur plaas biosekuriteit, en koppel met geverifieerde kopers",
          features: ["Plaasbestuur", "Biosekuriteit Nasporing", "Direkte Verkope"]
        },
        vet: {
          title: "Veearts",
          description: "Voer inspeksies uit, reik sertifikate uit, en onderhou professionele kwalifikasies",
          features: ["Digitale Sertifikate", "Inspeksie Skedulering", "Nakoming Nasporing"]
        },
        agent: {
          title: "Agent",
          description: "Fasiliteer transaksies, bestuur veelvuldige verkopers, en brei jou netwerk uit",
          features: ["Multi-Plaas Bestuur", "Transaksie Fasilitering", "Kliënt Netwerk"]
        },
        driver: {
          title: "Bestuurder",
          description: "Bestuur vervoer logistiek met digitale validasie en roete nasporing",
          features: ["Roete Optimisering", "Digitale Validasie", "Aflewering Bevestiging"]
        }
      },
      features: {
        title: "Hoekom Kies Cattle Scan?",
        items: [
          {
            icon: Shield,
            title: "Biosekuriteit Nakoming",
            description: "Verseker volle nakoming van biosekuriteit regulasies en onderhou gedetailleerde oudit spore"
          },
          {
            icon: FileCheck,
            title: "Digitale Attestasie",
            description: "Genereer sabotasie-bewys digitale sertifikate en dokumentasie vir elke transaksie"
          },
          {
            icon: Users,
            title: "Multi-Rol Platform",
            description: "Koppel naatloos verkopers, kopers, veeartse, agente, en bestuurders"
          },
          {
            icon: Truck,
            title: "Volledige Naspeurbaarheid",
            description: "Spoor vee van plaas tot finale bestemming met volledige deursigtigheid"
          }
        ]
      },
      footer: {
        company: "Gebou vir die toekoms van veestok bestuur",
        privacy: "Privaatheid Beleid",
        terms: "Terme van Diens"
      }
    }
  };

  const t = content[language];

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">Welcome back!</h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8">You're already signed in to Cattle Scan.</p>
            <Link to="/dashboard">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-200">Cattle Scan</span>
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
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-6 bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
            Advanced Livestock Management
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-emerald-800 dark:from-slate-100 dark:via-blue-200 dark:to-emerald-200 bg-clip-text text-transparent">
            {t.hero.title}
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-700 dark:text-slate-300 mb-6">
            {t.hero.subtitle}
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white px-8 py-3 text-lg">
                {t.hero.cta}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-20 bg-white/50 dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.roles.title}</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">{t.roles.subtitle}</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(['seller', 'vet', 'agent', 'driver'] as const).map((roleKey) => {
              const role = t.roles[roleKey];
              return (
                <Card key={roleKey} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-105">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">{role.title}</CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-400">{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {role.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link to={`/auth?role=${roleKey}`}>
                      <Button className="w-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white">
                        {language === 'en' ? 'Register' : 'Registreer'}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.features.title}</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {t.features.items.map((feature, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cattle Scan</span>
            </div>
            <p className="text-slate-400 text-center md:text-left mb-4 md:mb-0">{t.footer.company}</p>
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
