import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PersonalAIGenius from "@/components/yourspace/PersonalAIGenius";
import GiniSidebar, { type GiniView } from "@/components/gini/GiniSidebar";
import PathwayMap from "@/components/gini/PathwayMap";
import OpportunitySimulator from "@/components/gini/OpportunitySimulator";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type AIProfile } from "@/components/yourspace/AITrainingWizard";
import { useIsMobile } from "@/hooks/use-mobile";

const Gini = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState<GiniView>("chat");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Load AI profile for pathway map
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("ai_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data?.trained_at) {
        setAiProfile({
          education_level: data.education_level || "",
          current_institution: data.current_institution || "",
          field_of_study: data.field_of_study || "",
          graduation_year: data.graduation_year || "",
          opportunity_types: (data.opportunity_types as string[]) || [],
          target_countries: (data.target_countries as string[]) || [],
          preferred_study_duration: data.preferred_study_duration || "",
          career_goals: data.career_goals || "",
          study_abroad_goals: data.study_abroad_goals || "",
          help_areas: (data.help_areas as string[]) || [],
          biggest_challenges: data.biggest_challenges || "",
          tools_used: data.tools_used || "",
          additional_context: data.additional_context || "",
        });
      }
    })();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Mobile: use tabs instead of sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="mt-16 flex-1 flex flex-col">
          {/* Mobile tab bar */}
          <div className="flex border-b border-border bg-card">
            <button
              onClick={() => setActiveView("chat")}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
                activeView === "chat"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              💬 Chat
            </button>
            <button
              onClick={() => setActiveView("pathway")}
              className={`flex-1 py-3 text-xs font-semibold text-center transition-colors ${
                activeView === "pathway"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              🗺️ Pathway Map
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeView === "chat" ? (
              <div className="h-full overflow-auto p-4">
                <PersonalAIGenius defaultExpanded />
              </div>
            ) : (
              <div className="h-full">
                <PathwayMap aiProfile={aiProfile} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="mt-16 flex-1 flex overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        <GiniSidebar
          activeView={activeView}
          onViewChange={setActiveView}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-hidden">
          {activeView === "chat" ? (
            <div className="h-full overflow-auto p-4 md:p-6">
              <div className="max-w-2xl mx-auto">
                <PersonalAIGenius defaultExpanded />
              </div>
            </div>
          ) : (
            <div className="h-full">
              <PathwayMap aiProfile={aiProfile} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gini;
