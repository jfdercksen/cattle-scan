import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Shield } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { useTranslation } from "@/i18n/useTranslation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contactOpen, setContactOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const heroTitle = t("index", "heroTitle");
  const titleParts = heroTitle.split("&");
  const titleTop = (titleParts[0] || "").trim() || heroTitle;
  const titleBottom = (titleParts[1] || "").trim();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: t("index", "missingInfoTitle"),
        description: t("index", "missingInfoDescription"),
      });
      return;
    }

    toast({
      title: t("index", "messageSentTitle"),
      description: t("index", "messageSentDescription"),
    });
    setContactOpen(false);
    setName("");
    setEmail("");
    setMessage("");
  };

  if (user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-[calc(100dvh-140px)] flex flex-col bg-white">

      {/* Minimal Hero */}
      <main className="flex-1 flex items-start justify-center pt-16 md:pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-8 bg-blue-600 bg-clip-text text-transparent leading-[1.25] md:leading-[1.2] overflow-visible pb-1">
            <span className="block">{titleTop}</span>
            {titleBottom && <span className="block">&</span>}
            {titleBottom && <span className="block pb-[0.3em]">{titleBottom}</span>}
          </h1>
          <div className="flex justify-center">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
                  {t("index", "signInCta")}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Dialog open={contactOpen} onOpenChange={setContactOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="outline" className="px-8 py-3 text-lg">
                    {t("index", "registerCta")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t("index", "contactDialogTitle")}</DialogTitle>
                    <DialogDescription>
                      {t("index", "contactDialogDescription")}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">{t("index", "contactNameLabel")}</Label>
                      <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("index", "contactNameLabel")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">{t("index", "contactEmailLabel")}</Label>
                      <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">{t("index", "contactMessageLabel")}</Label>
                      <Textarea
                        id="contact-message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("index", "contactMessagePlaceholder")}
                        rows={5}
                      />
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">{t("common", "cancel")}</Button>
                      </DialogClose>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{t("common", "submit")}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
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
              {t("index", "footerCompany")}
            </a>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">{t("index", "footerPrivacy")}</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">{t("index", "footerTerms")}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
