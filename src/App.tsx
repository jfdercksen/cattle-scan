import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/providers/AuthProvider';
import { CompanyProvider } from '@/contexts/companyContext';
import { LanguageProvider } from '@/contexts/languageContext';
import { ThemeProvider } from "@/components/theme-provider";
import { AppLayout } from "./layouts/AppLayout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import AgentDashboard from "./pages/AgentDashboard";
import VetDashboard from "./pages/VetDashboard";
import LoadMasterDashboard from "./pages/LoadMasterDashboard";
import CreateListingPage from "./pages/CreateListingPage";
import { ViewListingPage } from "./pages/ViewListingPage";
import { AdminViewListingPage } from './pages/AdminViewListingPage';
import ProfileCompletion from './components/ProfileCompletionForm';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="cattle-scan-theme">
      <LanguageProvider>
        <AuthProvider>
          <CompanyProvider>
            <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/admin" element={<Admin />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/seller-dashboard" element={<SellerDashboard />} />
                  <Route path="/agent-dashboard" element={<AgentDashboard />} />
                  <Route path="/vet-dashboard" element={<VetDashboard />} />
                  <Route path="/load-master-dashboard" element={<LoadMasterDashboard />} />
                  <Route path="/seller/create-listing/:invitationId" element={<CreateListingPage />} />
                  <Route path="/seller/listing/:listingId" element={<ViewListingPage />} />
                  <Route path="/admin/listing/:listingId" element={<AdminViewListingPage />} />
                  <Route path="/profile-completion" element={<ProfileCompletion />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
            </TooltipProvider>
          </CompanyProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
