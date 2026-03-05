import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { type AIProfile } from "@/components/yourspace/AITrainingWizard";
import PathwayVisual from "./PathwayVisual";
import { ScrollArea } from "@/components/ui/scroll-area";

const FUTURE_GOALS = [
  { label: "🌐 A global career", value: "A global career in my field with international experience and networks" },
  { label: "🎓 Graduate school abroad", value: "Graduate school abroad at a top international university" },
  { label: "🔬 International research", value: "International research experience and academic collaboration" },
  { label: "🌍 Cultural immersion", value: "Cultural immersion, language learning, and cross-cultural competence" },
  { label: "🚀 Global entrepreneurship", value: "Global entrepreneurship and building an international business network" },
];

interface Props {
  aiProfile: AIProfile | null;
}

export default function PathwayMap({ aiProfile }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [pathwayData, setPathwayData] = useState<any>(null);
  const [futureGoal, setFutureGoal] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [customGoal, setCustomGoal] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load existing pathway
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("pathway_maps")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (data) {
        setPathwayData(data.pathway_data);
        setFutureGoal(data.future_goal);
      }
      setLoading(false);
    })();
  }, [user]);

  const generatePathway = async (goal: string) => {
    if (!user || !aiProfile) return;
    setGenerating(true);
    setError(null);

    try {
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-pathway`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ aiProfile, futureGoal: goal }),
        }
      );

      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        throw new Error(body.error || "Failed to generate pathway");
      }

      const { pathway } = await resp.json();

      // Save to DB
      await supabase.from("pathway_maps").upsert(
        {
          user_id: user.id,
          future_goal: goal,
          pathway_data: pathway,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      setPathwayData(pathway);
      setFutureGoal(goal);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!aiProfile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <div className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mb-4 shadow-soft">
          <Map className="w-7 h-7 text-primary-foreground" />
        </div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Train GINIE First</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Complete your GINIE training in the Chat tab so we can generate a personalised Global Study Pathway Map for you.
        </p>
      </div>
    );
  }

  // Show the critical first question
  if (!pathwayData && !generating) {
    return (
      <ScrollArea className="h-full">
        <div className="p-6 md:p-8">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-4 shadow-soft">
                <Map className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                My Global Study Pathway Map
              </h3>
              <p className="text-sm text-muted-foreground">
                Unlike platforms that start with location, we start with <strong className="text-foreground">purpose</strong>.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h4 className="font-display font-semibold text-foreground text-center mb-1">
                What kind of future do you want your global experience to help you build?
              </h4>
              <p className="text-xs text-muted-foreground text-center mb-5">
                This lets us reverse-engineer the most meaningful study abroad opportunities for you.
              </p>

              <div className="space-y-2 mb-4">
                {FUTURE_GOALS.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => { setSelectedGoal(g.value); setCustomGoal(""); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all border ${
                      selectedGoal === g.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/50 text-foreground hover:border-primary/30 hover:bg-muted"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              <div className="relative mb-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">or describe your own</span>
                </div>
              </div>

              <textarea
                value={customGoal}
                onChange={(e) => { setCustomGoal(e.target.value); setSelectedGoal(""); }}
                placeholder="e.g. I want to become a global health researcher working across Africa and Europe..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none mb-4"
              />

              {error && (
                <p className="text-xs text-destructive mb-3 text-center">{error}</p>
              )}

              <button
                onClick={() => generatePathway(customGoal || selectedGoal)}
                disabled={!selectedGoal && !customGoal.trim()}
                className="w-full py-3.5 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.01] text-sm disabled:opacity-40 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Generate My Pathway Map
              </button>
            </div>
          </motion.div>
        </div>
      </ScrollArea>
    );
  }

  // Generating state
  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-2xl gradient-hero flex items-center justify-center mb-4 shadow-soft"
        >
          <Map className="w-7 h-7 text-primary-foreground" />
        </motion.div>
        <h3 className="font-display text-lg font-bold text-foreground mb-2">Building Your Pathway Map...</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          GINIE is analysing your profile, researching programs, and mapping your global education journey. This takes about 15 seconds.
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mt-4" />
      </div>
    );
  }

  // Show pathway
  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-base font-bold text-foreground">My Global Study Pathway Map</h3>
          <button
            onClick={() => { setPathwayData(null); setFutureGoal(null); setSelectedGoal(""); setCustomGoal(""); }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
          >
            <RefreshCw className="w-3 h-3" /> Regenerate
          </button>
        </div>
        <PathwayVisual data={pathwayData} futureGoal={futureGoal!} />
      </div>
    </ScrollArea>
  );
}
