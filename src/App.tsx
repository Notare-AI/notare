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
import BlogPage from "./pages/Blog";
import AStepByStepGuideToUsingNotare from "./pages/blog/A-Step-by-Step-Guide-to-Using-Notare";
import HowToSummarizeResearchPapersWithAI from "./pages/blog/How-to-Summarize-Research-Papers-with-AI-in-2025";
import OrganizeResearchNotesAI from "./pages/blog/OrganizeResearchNotesAI";
import BestAIToolsPhDStudents from "./pages/blog/BestAIToolsPhDStudents";
import NotareVsObsidian from "./pages/blog/NotareVsObsidian";
import NotareVsLogseq from "./pages/blog/NotareVsLogseq";
import BestFreeAINoteTaker from "./pages/blog/BestFreeAINoteTaker";
import LandingLayout from "./components/landing/LandingLayout";
import PricingPage from "./pages/Pricing";
import { Analytics } from "@vercel/analytics/react";
import AuthConfirmPage from "./pages/AuthConfirm";
import WhatIsNotare from "./pages/WhatIsNotare";
import FAQPage from "./pages/FAQ";
import PublicCanvas from "./pages/PublicCanvas";

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
              <Route path="/auth/confirm" element={<AuthConfirmPage />} />
              <Route path="/canvas/view/:canvasId" element={<PublicCanvas />} />
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
              <Route path="/what-is-notare" element={<WhatIsNotare />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/a-step-by-step-guide-to-using-notare" element={<AStepByStepGuideToUsingNotare />} />
              <Route path="/blog/how-to-summarize-research-papers-with-ai-in-2025" element={<HowToSummarizeResearchPapersWithAI />} />
              <Route path="/blog/organize-research-notes-ai" element={<OrganizeResearchNotesAI />} />
              <Route path="/blog/best-ai-tools-phd-students" element={<BestAIToolsPhDStudents />} />
              <Route path="/blog/notare-vs-obsidian" element={<NotareVsObsidian />} />
              <Route path="/blog/notare-vs-logseq" element={<NotareVsLogseq />} />
              <Route path="/blog/best-free-ai-note-taker" element={<BestFreeAINoteTaker />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Analytics />
          </UserProfileProvider>
        </BrowserRouter>
      </HighlightProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;