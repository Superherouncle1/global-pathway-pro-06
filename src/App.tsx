import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Resources from "./pages/Resources";
import YourSpace from "./pages/YourSpace";
import Community from "./pages/Community";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import GiniPage from "./pages/Gini";
import Privacy from "./pages/Privacy";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import TimiChat from "./components/TimiChat";
import TimiPage from "./pages/Timi";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/your-space" element={<YourSpace />} />
            <Route path="/gini" element={<GiniPage />} />
            <Route path="/community" element={<Community />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/timi" element={<TimiPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <TimiChat />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
