import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Loader2, RefreshCw, Briefcase, Globe, Brain, DollarSign, TrendingUp, Users, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { type AIProfile } from "@/components/yourspace/AITrainingWizard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface FundingOption {
  name: string;
  coverage: string;
  provider: string;
}

interface Scenario {
  title: string;
  emoji: string;
  country: string;
  flag_emoji: string;
  program_type: string;
  program_name: string;
  institution: string;
  duration: string;
  summary: string;
  outcomes: string[];
  skills_gained: string[];
  career_opportunities: string[];
  funding_options: FundingOption[];
  career_impact_score: number;
  cultural_exposure_score: number;
  network_growth_score: number;
}

interface SimulationData {
  scenarios: Scenario[];
  comparison_insight: string;
}

interface Props {
  aiProfile: AIProfile | null;
}

function ScoreBar({ score, label, color }: { score: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-semibold text-foreground w-6 text-right">{score}</span>
    </div>
  );
}

function ScenarioCard({ scenario, index, isExpanded, onToggle }: {
  scenario: Scenario;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const borderColors = [
    "border-l-primary",
    "border-l-accent",
    "border-l-[hsl(var(--ring))]",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`bg-card border border-border rounded-xl overflow-hidden border-l-4 ${borderColors[index] || borderColors[0]}`}
    >
      {/* Header - always visible */}
      <button onClick={onToggle} className="w-full text-left p-5 hover:bg-muted/30 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{scenario.emoji}</span>
              <span className="text-lg">{scenario.flag_emoji}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {scenario.program_type}
              </span>
            </div>
            <h3 className="text-base font-bold text-foreground leading-tight">{scenario.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {scenario.institution} · {scenario.duration}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Summary always visible */}
        <p className="text-sm text-foreground/80 mt-3 leading-relaxed">{scenario.summary}</p>

        {/* Score bars always visible */}
        <div className="mt-4 space-y-2">
          <ScoreBar score={scenario.career_impact_score} label="Career" color="bg-primary" />
          <ScoreBar score={scenario.cultural_exposure_score} label="Culture" color="bg-accent" />
          <ScoreBar score={scenario.network_growth_score} label="Network" color="bg-ring" />
        </div>
      </button>

      {/* Expanded details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
              {/* Outcomes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">What This Path Unlocks</span>
                </div>
                <ul className="space-y-1.5">
                  {scenario.outcomes.map((o, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold text-foreground">Skills You'll Develop</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {scenario.skills_gained.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Opportunities */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Career Doors Opened</span>
                </div>
                <ul className="space-y-1.5">
                  {scenario.career_opportunities.map((c, i) => (
                    <li key={i} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-accent mt-0.5">◆</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Funding */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Funding Opportunities</span>
                </div>
                <div className="space-y-2">
                  {scenario.funding_options.map((f, i) => (
                    <div key={i} className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-semibold text-foreground">{f.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{f.provider} · {f.coverage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function OpportunitySimulator({ aiProfile }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [simulation, setSimulation] = useState<SimulationData | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!user || !aiProfile) return;
    setGenerating(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("simulate-opportunities", {
        body: { aiProfile },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.simulation) throw new Error("No simulation data returned");

      setSimulation(data.simulation);
      setExpandedIndex(0);
    } catch (e: any) {
      const msg = e?.message || "Failed to generate scenarios";
      setError(msg);
      toast({ title: "Simulation Error", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  // No AI profile yet
  if (!aiProfile) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Train GINIE First</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete the AI Training Wizard in <strong>Chat with GINIE</strong> to unlock the Global Opportunity Simulator. Your profile powers personalised scenario generation.
          </p>
        </div>
      </div>
    );
  }

  // Initial state — not yet generated
  if (!simulation && !generating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Global Opportunity Simulator</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Explore different futures. See how each global education path could shape your skills, career, and life trajectory.
          </p>
          <button
            onClick={generate}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Zap className="w-4 h-4" />
            Simulate My Futures
          </button>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </motion.div>
      </div>
    );
  }

  // Generating
  if (generating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Simulating Your Futures...</h3>
          <p className="text-sm text-muted-foreground">
            GINIE is building 3 distinct global paths based on your profile
          </p>
        </motion.div>
      </div>
    );
  }

  // Results
  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Your Simulated Futures
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              3 distinct paths based on your profile. Tap to explore each.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        </div>

        {/* Scenario Cards */}
        <div className="space-y-4">
          {simulation!.scenarios.map((scenario, i) => (
            <ScenarioCard
              key={i}
              scenario={scenario}
              index={i}
              isExpanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
            />
          ))}
        </div>

        {/* Comparison Insight */}
        {simulation!.comparison_insight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-muted/50 border border-border rounded-xl p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">GINIE's Insight</h4>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {simulation!.comparison_insight}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </ScrollArea>
  );
}
