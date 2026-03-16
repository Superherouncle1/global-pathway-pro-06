import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { type AIProfile } from "@/components/yourspace/AITrainingWizard";
import { useToast } from "@/hooks/use-toast";

interface Props {
  aiProfile: AIProfile | null;
}

interface AssessmentResult {
  overall_score: number;
  verdict: "strong" | "moderate" | "weak";
  summary: string;
  strengths: string[];
  gaps: string[];
  recommended_route: string;
  endorsing_body: string;
  next_steps: string[];
}

export default function GTVAssessment({ aiProfile }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  const runAssessment = async () => {
    if (!aiProfile) {
      toast({ title: "Train GINIE first", description: "Complete your AI profile so we can assess your eligibility.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("gtv-assessment", {
        body: { aiProfile },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResult(data.assessment);
    } catch (e: any) {
      toast({ title: "Assessment failed", description: e.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const verdictConfig = {
    strong: { color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", icon: CheckCircle2, label: "Strong Candidate" },
    moderate: { color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle, label: "Moderate — Needs Work" },
    weak: { color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", icon: XCircle, label: "Not Yet Ready" },
  };

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Global Talent Visa Assessment</h2>
            <p className="text-sm text-muted-foreground">
              Get a personalised eligibility evaluation for the UK Global Talent Visa based on your profile, field, and achievements.
            </p>
          </div>
          <div className="text-left space-y-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-4">
            <p className="font-semibold text-foreground text-sm">What we'll evaluate:</p>
            <ul className="space-y-1.5">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Your field alignment with endorsing bodies</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Exceptional Talent vs Exceptional Promise route</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Strengths and gaps in your profile</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" /> Concrete next steps to strengthen your case</li>
            </ul>
          </div>
          <Button onClick={runAssessment} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            {loading ? "Analysing your profile..." : "Run Eligibility Assessment"}
          </Button>
          {!aiProfile && (
            <p className="text-xs text-destructive">⚠️ You need to train GINIE first before running this assessment.</p>
          )}
        </motion.div>
      </div>
    );
  }

  const v = verdictConfig[result.verdict];
  const VerdictIcon = v.icon;

  return (
    <div className="h-full overflow-auto p-4 md:p-6">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> GTV Assessment Result
          </h2>
          <Button variant="outline" size="sm" onClick={() => setResult(null)} className="gap-1.5 text-xs">
            <RotateCcw className="w-3.5 h-3.5" /> Re-assess
          </Button>
        </div>

        {/* Score */}
        <div className={`rounded-xl border p-5 ${v.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <VerdictIcon className={`w-6 h-6 ${v.color}`} />
            <div>
              <p className={`font-bold text-lg ${v.color}`}>{v.label}</p>
              <p className="text-xs text-muted-foreground">Eligibility Score: {result.overall_score}/100</p>
            </div>
          </div>
          <p className="text-sm text-foreground">{result.summary}</p>
        </div>

        {/* Route & Body */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Recommended Route</p>
            <p className="text-sm font-semibold text-foreground">{result.recommended_route}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground mb-1">Endorsing Body</p>
            <p className="text-sm font-semibold text-foreground">{result.endorsing_body}</p>
          </div>
        </div>

        {/* Strengths */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Your Strengths
          </p>
          <ul className="space-y-2">
            {result.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-green-500 mt-0.5">✓</span> {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        {result.gaps.length > 0 && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" /> Gaps to Address
            </p>
            <ul className="space-y-2">
              {result.gaps.map((g, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-yellow-500 mt-0.5">!</span> {g}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Next Steps */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-sm font-semibold text-foreground mb-3">🎯 Recommended Next Steps</p>
          <ol className="space-y-2">
            {result.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 mt-0.5 flex-shrink-0">{i + 1}</Badge>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </motion.div>
    </div>
  );
}
