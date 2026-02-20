import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ChevronDown, ChevronUp, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AITrainingWizard, { type AIProfile } from "./AITrainingWizard";
import AIGeniusChat from "./AIGeniusChat";

type ViewState = "loading" | "untrained" | "training" | "chat";

export default function PersonalAIGenius() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("loading");
  const [aiProfile, setAiProfile] = useState<AIProfile | null>(null);
  const [trainedAt, setTrainedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user) loadAIProfile();
  }, [user]);

  const loadAIProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("ai_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data && data.trained_at) {
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
      setTrainedAt(data.trained_at);
      setView("chat");
    } else {
      setView("untrained");
    }
  };

  const handleTrainingComplete = async (profile: AIProfile) => {
    if (!user) return;
    setSaving(true);
    const now = new Date().toISOString();

    const { error } = await supabase.from("ai_profiles").upsert({
      user_id: user.id,
      ...profile,
      trained_at: now,
      updated_at: now,
    }, { onConflict: "user_id" });

    setSaving(false);
    if (!error) {
      setAiProfile(profile);
      setTrainedAt(now);
      setView("chat");
      setExpanded(true);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-card border border-border rounded-2xl shadow-card overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-6 md:p-8 text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center shadow-soft flex-shrink-0">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg font-semibold text-foreground">My Personal AI Genius</h2>
              {view === "chat" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Active
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {view === "loading" && "Loading..."}
              {view === "untrained" && "Train me to get hyper-personalised study abroad intelligence"}
              {view === "training" && "Setting up your AI Genius..."}
              {view === "chat" && trainedAt && `Trained · Last updated ${formatDate(trainedAt)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {view === "chat" && (
            <button
              onClick={(e) => { e.stopPropagation(); setView("training"); setExpanded(true); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
              title="Retrain AI Genius"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </button>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              {/* Loading */}
              {view === "loading" && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}

              {/* Untrained — welcome screen */}
              {view === "untrained" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-soft">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Train Your Personal AI Genius</h3>
                  <p className="text-sm text-muted-foreground mb-1 max-w-md mx-auto">
                    Unlike generic AI, your Personal AI Genius learns <strong className="text-foreground">everything about you</strong> — your goals, your field, your target countries, and your challenges.
                  </p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    After training, it will give you <strong className="text-foreground">specific scholarships, real deadlines, exact programs</strong> — no fluff, no generic advice.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                    {["🎯 Hyper-personalised", "🌐 Web-grounded", "⚡ Always current"].map((f) => (
                      <div key={f} className="bg-muted rounded-xl px-2 py-2.5 text-xs text-muted-foreground font-medium">{f}</div>
                    ))}
                  </div>
                  <button
                    onClick={() => setView("training")}
                    className="px-8 py-3.5 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.02] text-sm"
                  >
                    Start Training (takes ~3 min)
                  </button>
                </motion.div>
              )}

              {/* Training wizard */}
              {view === "training" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="mb-5 p-3 rounded-xl bg-primary/8 border border-primary/20">
                    <p className="text-xs text-primary font-medium flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5" />
                      Your answers train your AI Genius to give you specific, relevant, real-time intelligence — not generic advice.
                    </p>
                  </div>
                  <AITrainingWizard
                    onComplete={handleTrainingComplete}
                    saving={saving}
                    initialData={aiProfile || undefined}
                  />
                </motion.div>
              )}

              {/* Chat */}
              {view === "chat" && aiProfile && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[520px] flex flex-col">
                  <AIGeniusChat
                    aiProfile={aiProfile}
                    onRetrain={() => setView("training")}
                  />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
