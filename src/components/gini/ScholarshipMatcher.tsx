import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award, Loader2, RefreshCw, ChevronDown, ChevronUp, ExternalLink,
  Filter, DollarSign, GraduationCap, Globe, Lightbulb, Trophy, X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { type AIProfile } from "@/components/yourspace/AITrainingWizard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Scholarship {
  name: string;
  provider: string;
  country: string;
  flag_emoji: string;
  study_level: string;
  field_focus: string;
  funding_type: string;
  coverage: string[];
  amount: string;
  deadline: string;
  duration?: string;
  eligibility_summary: string;
  why_match: string;
  application_tips?: string;
  website_url: string;
  match_score: number;
  difficulty: string;
}

interface MatchData {
  scholarships: Scholarship[];
  summary: string;
  total_potential_value: string;
}

interface Filters {
  fundingType: string;
  studyLevel: string;
  country: string;
}

interface Props {
  aiProfile: AIProfile | null;
}

const FUNDING_TYPES = ["All", "Full Funding", "Partial", "Tuition Only", "Living Stipend"];
const STUDY_LEVELS = ["All", "Undergraduate", "Masters", "PhD"];
const COUNTRIES = ["All", "USA", "UK", "Canada", "Germany", "Australia", "Netherlands", "Japan", "Singapore"];

function MatchBadge({ score }: { score: number }) {
  const color = score >= 80
    ? "bg-primary/15 text-primary border-primary/30"
    : score >= 60
    ? "bg-accent/15 text-accent border-accent/30"
    : "bg-muted text-muted-foreground border-border";

  return (
    <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full border", color)}>
      {score}% match
    </span>
  );
}

function DifficultyBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Easy: "bg-primary/10 text-primary",
    Moderate: "bg-accent/10 text-accent",
    Competitive: "bg-destructive/10 text-destructive",
    "Highly Competitive": "bg-destructive/15 text-destructive",
  };
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", colors[level] || "bg-muted text-muted-foreground")}>
      {level}
    </span>
  );
}

function ScholarshipCard({ scholarship, index, isExpanded, onToggle }: {
  scholarship: Scholarship;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      <button onClick={onToggle} className="w-full text-left p-4 hover:bg-muted/30 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-lg">{scholarship.flag_emoji}</span>
              <MatchBadge score={scholarship.match_score} />
              <DifficultyBadge level={scholarship.difficulty} />
            </div>
            <h3 className="text-sm font-bold text-foreground leading-tight">{scholarship.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {scholarship.provider} · {scholarship.country}
            </p>
          </div>
          <div className="shrink-0 mt-1">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2.5 flex-wrap">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {scholarship.funding_type}
          </span>
          <span className="text-xs text-muted-foreground">{scholarship.study_level}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{scholarship.field_focus}</span>
        </div>

        <p className="text-xs text-foreground/70 mt-2 font-medium">{scholarship.amount}</p>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-border pt-3">
              {/* Why it matches */}
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Why This Matches You</span>
                </div>
                <p className="text-xs text-foreground/80 leading-relaxed">{scholarship.why_match}</p>
              </div>

              {/* Coverage */}
              <div>
                <span className="text-xs font-semibold text-foreground mb-1 block">What It Covers</span>
                <div className="flex flex-wrap gap-1.5">
                  {scholarship.coverage.map((item, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div>
                <span className="text-xs font-semibold text-foreground mb-1 block">Eligibility</span>
                <p className="text-xs text-foreground/80 leading-relaxed">{scholarship.eligibility_summary}</p>
              </div>

              {/* Deadline & Duration */}
              <div className="flex gap-4">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Deadline</span>
                  <p className="text-xs font-semibold text-foreground">{scholarship.deadline}</p>
                </div>
                {scholarship.duration && (
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</span>
                    <p className="text-xs font-semibold text-foreground">{scholarship.duration}</p>
                  </div>
                )}
              </div>

              {/* Tips */}
              {scholarship.application_tips && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-accent" />
                    <span className="text-xs font-semibold text-foreground">Application Tip</span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{scholarship.application_tips}</p>
                </div>
              )}

              {/* Apply Link */}
              <a
                href={scholarship.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Visit Official Page <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:border-primary/50"
      )}
    >
      {label}
    </button>
  );
}

export default function ScholarshipMatcher({ aiProfile }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({ fundingType: "All", studyLevel: "All", country: "All" });

  const generate = async (appliedFilters?: Filters) => {
    if (!user || !aiProfile) return;
    setGenerating(true);
    setError(null);

    const f = appliedFilters || filters;
    const filterPayload: any = {};
    if (f.fundingType !== "All") filterPayload.fundingType = f.fundingType;
    if (f.studyLevel !== "All") filterPayload.studyLevel = f.studyLevel;
    if (f.country !== "All") filterPayload.country = f.country;

    try {
      const { data, error: fnError } = await supabase.functions.invoke("match-scholarships", {
        body: { aiProfile, filters: Object.keys(filterPayload).length ? filterPayload : undefined },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      if (!data?.matches) throw new Error("No scholarship data returned");

      setMatchData(data.matches);
      setExpandedIndex(0);
    } catch (e: any) {
      const msg = e?.message || "Failed to find scholarships";
      setError(msg);
      toast({ title: "Matching Error", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  if (!aiProfile) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">Train GINIE First</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Complete the AI Training Wizard in <strong>Chat with GINIE</strong> to unlock personalised scholarship matching.
          </p>
        </div>
      </div>
    );
  }

  if (!matchData && !generating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-5">
            <Award className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Scholarship Matcher</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            Find real scholarships tailored to your profile. GINIE matches you with funding opportunities you're most likely to qualify for.
          </p>
          <button
            onClick={() => generate()}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            <Award className="w-4 h-4" />
            Find My Scholarships
          </button>
          {error && <p className="text-sm text-destructive mt-4">{error}</p>}
        </motion.div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-1">Searching Scholarships...</h3>
          <p className="text-sm text-muted-foreground">GINIE is finding the best funding matches for your profile</p>
        </motion.div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Award className="w-5 h-5 text-primary shrink-0" />
              Your Scholarship Matches
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {matchData!.scholarships.length} scholarships matched · {matchData!.total_potential_value} potential funding
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors",
                showFilters
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
            <button
              onClick={() => generate()}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">Funding Type</span>
                  <div className="flex flex-wrap gap-1.5">
                    {FUNDING_TYPES.map(t => (
                      <FilterChip key={t} label={t} active={filters.fundingType === t} onClick={() => setFilters(f => ({ ...f, fundingType: t }))} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">Study Level</span>
                  <div className="flex flex-wrap gap-1.5">
                    {STUDY_LEVELS.map(t => (
                      <FilterChip key={t} label={t} active={filters.studyLevel === t} onClick={() => setFilters(f => ({ ...f, studyLevel: t }))} />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1.5 block">Country</span>
                  <div className="flex flex-wrap gap-1.5">
                    {COUNTRIES.map(t => (
                      <FilterChip key={t} label={t} active={filters.country === t} onClick={() => setFilters(f => ({ ...f, country: t }))} />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => generate(filters)}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:opacity-90 transition-opacity"
                >
                  <Award className="w-3.5 h-3.5" />
                  Apply Filters & Search
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary */}
        {matchData!.summary && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/50 border border-border rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-0.5">GINIE's Assessment</h4>
                <p className="text-xs text-foreground/80 leading-relaxed">{matchData!.summary}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Scholarship Cards */}
        <div className="space-y-3">
          {matchData!.scholarships.map((s, i) => (
            <ScholarshipCard
              key={i}
              scholarship={s}
              index={i}
              isExpanded={expandedIndex === i}
              onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
