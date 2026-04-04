import { motion } from "framer-motion";
import { GraduationCap, Globe, DollarSign, Briefcase, Lightbulb, ArrowDown, MapPin, Award, TrendingUp } from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";

interface PathwayData {
  current_stage: {
    level: string;
    field: string;
    institution?: string;
    graduation_year?: string;
  };
  opportunities: Array<{
    title: string;
    type: string;
    country: string;
    institution: string;
    duration?: string;
    why_fit: string;
  }>;
  country_matches: Array<{
    country: string;
    flag_emoji: string;
    match_reason: string;
    key_programs: string[];
    strength: string;
  }>;
  funding_sources: Array<{
    name: string;
    type: string;
    provider: string;
    coverage: string;
    eligibility_note?: string;
  }>;
  skill_outcomes: string[];
  career_pathways: string[];
  career_insights: string[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

function SectionDivider() {
  return (
    <div className="flex justify-center py-3">
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <ArrowDown className="w-5 h-5 text-primary/40" />
      </motion.div>
    </div>
  );
}

export default function PathwayVisual({ data, futureGoal }: { data: PathwayData; futureGoal: string }) {
  return (
    <div className="space-y-2">
      {/* Future Goal Banner */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0}
        className="rounded-2xl gradient-hero p-5 text-primary-foreground text-center"
      >
        <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">My Global Future Goal</p>
        <h3 className="font-display text-lg font-bold">{futureGoal}</h3>
      </motion.div>

      {/* Current Stage */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Current Academic Position</h4>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <p className="text-sm font-medium text-foreground">{data.current_stage.level} — {data.current_stage.field}</p>
          {data.current_stage.institution && (
            <p className="text-xs text-muted-foreground mt-1">{data.current_stage.institution}</p>
          )}
          {data.current_stage.graduation_year && (
            <p className="text-xs text-muted-foreground">Expected: {data.current_stage.graduation_year}</p>
          )}
        </div>
      </motion.div>

      <SectionDivider />

      {/* Global Opportunities */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Globe className="w-4 h-4 text-accent" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Possible Global Opportunities</h4>
        </div>
        <div className="space-y-3">
          {data.opportunities.map((opp, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={2 + i * 0.3}
              className="bg-muted rounded-lg p-3 border-l-3 border-primary"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{opp.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <MapPin className="w-3 h-3 inline mr-1" />{opp.country} · {opp.institution}
                  </p>
                </div>
                <BookmarkButton
                  itemType="opportunity"
                  referenceId={`pathway-opp-${i}`}
                  title={opp.title}
                  description={`${opp.type} at ${opp.institution}, ${opp.country}. ${opp.why_fit}`}
                />
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                  {opp.type}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{opp.why_fit}</p>
              {opp.duration && <p className="text-xs text-primary font-medium mt-1">Duration: {opp.duration}</p>}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* Country Matches */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Country Match Guidance</h4>
        </div>
        <div className="grid gap-3">
          {data.country_matches.map((cm, i) => (
            <motion.div key={i} variants={fadeUp} initial="hidden" animate="visible" custom={4 + i * 0.2}
              className="bg-muted rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{cm.flag_emoji}</span>
                <h5 className="text-sm font-semibold text-foreground">{cm.country}</h5>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{cm.match_reason}</p>
              <p className="text-xs font-medium text-primary mb-1">Strength: {cm.strength}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {cm.key_programs.map((p, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* Funding & Scholarships */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <DollarSign className="w-4 h-4 text-accent" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Funding & Scholarship Map</h4>
        </div>
        <div className="space-y-2">
          {data.funding_sources.map((fs, i) => (
            <div key={i} className="bg-muted rounded-lg p-3 flex items-start gap-3">
              <Award className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{fs.name}</p>
                <p className="text-xs text-muted-foreground">{fs.provider} · {fs.type}</p>
                <p className="text-xs text-foreground mt-1">{fs.coverage}</p>
                {fs.eligibility_note && (
                  <p className="text-xs text-primary mt-1 font-medium">{fs.eligibility_note}</p>
                )}
              </div>
              <BookmarkButton
                itemType="scholarship"
                referenceId={`pathway-fund-${i}`}
                title={fs.name}
                description={`${fs.provider} · ${fs.type}. ${fs.coverage}`}
              />
            </div>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* Skill Outcomes */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={8}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Skill & Experience Outcomes</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.skill_outcomes.map((s, i) => (
            <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      <SectionDivider />

      {/* Career Pathways */}
      <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={9}
        className="rounded-xl border border-border bg-card p-5"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-accent" />
          </div>
          <h4 className="font-display font-semibold text-foreground">Long-Term Career Pathways</h4>
        </div>
        <div className="space-y-2 mb-4">
          {data.career_pathways.map((cp, i) => (
            <div key={i} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
              <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground">{cp}</span>
            </div>
          ))}
        </div>

        {/* Career Insights */}
        <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <h5 className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Career Impact Insights</h5>
          <div className="space-y-2">
            {data.career_insights.map((ci, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed">
                💡 {ci}
              </p>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
