import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AuthLayout from "./components/AuthLayout";
import { HighlightProvider } from "./contexts/HighlightContext";
import { UserProfileProvider } from "./contexts/UserProfileContext";
import CheckoutPage from "./pages/Checkout";
import Landing from "./pages/Landing";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import LandingLayout from "./components/landing/LandingLayout";
import PricingPage from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HighlightProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <UserProfileProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<AuthLayout><CheckoutPage /></AuthLayout>} />
              <Route
                path="/dashboard"
                element={
                  <AuthLayout>
                    <Dashboard />
                  </AuthLayout>
                }
              />
              <Route path="/pricing" element={<LandingLayout><PricingPage /></LandingLayout>} />
              <Route path="/blog" element={<LandingLayout><BlogIndex /></LandingLayout>} />
              <Route path="/blog/:slug" element={<LandingLayout><BlogPost /></LandingLayout>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProfileProvider>
        </BrowserRouter>
      </HighlightProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;