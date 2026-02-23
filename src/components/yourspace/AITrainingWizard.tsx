import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Globe, Target, Lightbulb, Wrench, ChevronRight, ChevronLeft,
  Check, Loader2, BookOpen, MapPin, Rocket, HelpCircle
} from "lucide-react";

export interface AIProfile {
  education_level: string;
  current_institution: string;
  field_of_study: string;
  graduation_year: string;
  opportunity_types: string[];
  target_countries: string[];
  preferred_study_duration: string;
  career_goals: string;
  study_abroad_goals: string;
  help_areas: string[];
  biggest_challenges: string;
  tools_used: string;
  additional_context: string;
}

const EDUCATION_LEVELS = ["High School / Secondary", "Undergraduate (Bachelor's)", "Graduate (Master's)", "Doctoral (PhD)", "Post-doctoral", "Professional (Law/Medicine/MBA)"];
const OPPORTUNITY_TYPES = ["Full Degree Program", "Exchange/Semester Abroad", "Masters (MSc/MA/MEng)", "PhD / Research", "Scholarship Only", "Short-term Course", "Bootcamp / Intensive", "Internship Abroad"];
const COUNTRIES = ["USA", "UK", "Canada", "Australia", "Germany", "France", "Netherlands", "Sweden", "Norway", "Japan", "South Korea", "Singapore", "UAE", "New Zealand", "Ireland", "Switzerland", "Italy", "Spain"];
const DURATIONS = ["3–6 months (exchange)", "1 year", "2 years (Master's)", "3–4 years (Bachelor's)", "4–5 years (PhD)", "Flexible / Not sure"];
const HELP_AREAS = ["Scholarship Search", "Visa Application", "Statement of Purpose (SOP)", "University Selection", "Interview Preparation", "Budgeting & Finances", "Housing & Accommodation", "Test Prep (IELTS/TOEFL/GRE)", "Letter of Recommendation", "Application Timeline Planning", "Post-study Work Options", "Career Planning"];

const steps = [
  { id: 1, icon: GraduationCap, label: "Education", title: "Where are you in your education journey?" },
  { id: 2, icon: BookOpen, label: "Opportunities", title: "What kind of opportunities are you looking for?" },
  { id: 3, icon: MapPin, label: "Destinations", title: "Where do you dream of studying?" },
  { id: 4, icon: Target, label: "Goals", title: "What are you trying to achieve?" },
  { id: 5, icon: HelpCircle, label: "Help Needed", title: "Where do you need the most help?" },
  { id: 6, icon: Wrench, label: "Context", title: "Tell me more about your situation" },
];

interface Props {
  onComplete: (profile: AIProfile) => void;
  saving: boolean;
  initialData?: Partial<AIProfile>;
  initialStep?: number;
  onProgressChange?: (profile: AIProfile, step: number) => void;
}

const inputClass = "w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition text-sm";
const textareaClass = `${inputClass} resize-none`;

const ToggleChip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all border ${
      selected
        ? "gradient-hero text-primary-foreground border-transparent shadow-soft"
        : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

export default function AITrainingWizard({ onComplete, saving, initialData, initialStep, onProgressChange }: Props) {
  const [step, setStep] = useState(initialStep || 1);
  const [profile, setProfile] = useState<AIProfile>({
    education_level: initialData?.education_level || "",
    current_institution: initialData?.current_institution || "",
    field_of_study: initialData?.field_of_study || "",
    graduation_year: initialData?.graduation_year || "",
    opportunity_types: initialData?.opportunity_types || [],
    target_countries: initialData?.target_countries || [],
    preferred_study_duration: initialData?.preferred_study_duration || "",
    career_goals: initialData?.career_goals || "",
    study_abroad_goals: initialData?.study_abroad_goals || "",
    help_areas: initialData?.help_areas || [],
    biggest_challenges: initialData?.biggest_challenges || "",
    tools_used: initialData?.tools_used || "",
    additional_context: initialData?.additional_context || "",
  });

  const toggle = (key: "opportunity_types" | "target_countries" | "help_areas", val: string) => {
    setProfile((p) => {
      const arr = p[key];
      const updated = { ...p, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] };
      return updated;
    });
  };

  // Auto-save progress on step or profile change
  useEffect(() => {
    onProgressChange?.(profile, step);
  }, [step, profile]);

  const canNext = () => {
    if (step === 1) return !!profile.education_level && !!profile.field_of_study;
    if (step === 2) return profile.opportunity_types.length > 0;
    if (step === 3) return profile.target_countries.length > 0;
    if (step === 4) return !!profile.career_goals || !!profile.study_abroad_goals;
    if (step === 5) return profile.help_areas.length > 0;
    return true;
  };

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between mb-2">
          {steps.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step > s.id ? "gradient-hero text-primary-foreground" :
                step === s.id ? "border-2 border-primary text-primary bg-primary/10" :
                "bg-muted text-muted-foreground"
              }`}>
                {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-[10px] hidden sm:block font-medium ${step === s.id ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full gradient-hero rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
        >
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Current Education Level *</label>
                <div className="grid grid-cols-2 gap-2">
                  {EDUCATION_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setProfile({ ...profile, education_level: lvl })}
                      className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                        profile.education_level === lvl
                          ? "gradient-hero text-primary-foreground border-transparent shadow-soft"
                          : "bg-muted border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Current Institution (optional)</label>
                <input type="text" value={profile.current_institution} onChange={(e) => setProfile({ ...profile, current_institution: e.target.value })} placeholder="e.g. University of Lagos, MIT, etc." className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Field of Study / Interest *</label>
                <input type="text" value={profile.field_of_study} onChange={(e) => setProfile({ ...profile, field_of_study: e.target.value })} placeholder="e.g. Computer Science, Public Health, Law..." className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Expected Graduation Year</label>
                <input type="text" value={profile.graduation_year} onChange={(e) => setProfile({ ...profile, graduation_year: e.target.value })} placeholder="e.g. 2025, 2026..." className={inputClass} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">What opportunities are you looking for? (select all that apply) *</label>
                <div className="flex flex-wrap gap-2">
                  {OPPORTUNITY_TYPES.map((t) => (
                    <ToggleChip key={t} label={t} selected={profile.opportunity_types.includes(t)} onClick={() => toggle("opportunity_types", t)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Preferred Study Duration</label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <ToggleChip key={d} label={d} selected={profile.preferred_study_duration === d} onClick={() => setProfile({ ...profile, preferred_study_duration: d })} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Countries you want to study in *</label>
                <div className="flex flex-wrap gap-2">
                  {COUNTRIES.map((c) => (
                    <ToggleChip key={c} label={c} selected={profile.target_countries.includes(c)} onClick={() => toggle("target_countries", c)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Any other countries not listed above?</label>
                <input type="text" placeholder="e.g. Finland, Portugal, Brazil..." className={inputClass} onBlur={(e) => {
                  const extras = e.target.value.split(",").map(x => x.trim()).filter(Boolean);
                  if (extras.length) setProfile(p => ({ ...p, target_countries: [...new Set([...p.target_countries, ...extras])] }));
                }} />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">What are your career goals after studying abroad?</label>
                <textarea
                  value={profile.career_goals}
                  onChange={(e) => setProfile({ ...profile, career_goals: e.target.value })}
                  placeholder="e.g. Work in AI research at a global tech company, return to my country and build a startup, join an international NGO..."
                  rows={3}
                  className={textareaClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Why do you want to study abroad? What are you hoping to gain?</label>
                <textarea
                  value={profile.study_abroad_goals}
                  onChange={(e) => setProfile({ ...profile, study_abroad_goals: e.target.value })}
                  placeholder="e.g. Access world-class research facilities, get a globally recognised degree, experience different cultures, find better career opportunities..."
                  rows={3}
                  className={textareaClass}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">What do you need the most help with? *</label>
                <div className="flex flex-wrap gap-2">
                  {HELP_AREAS.map((a) => (
                    <ToggleChip key={a} label={a} selected={profile.help_areas.includes(a)} onClick={() => toggle("help_areas", a)} />
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">What's your single biggest challenge or worry right now?</label>
                <textarea
                  value={profile.biggest_challenges}
                  onChange={(e) => setProfile({ ...profile, biggest_challenges: e.target.value })}
                  placeholder="e.g. I can't find scholarships that cover full tuition, I don't know which country's visa is easiest, my GPA isn't strong..."
                  rows={3}
                  className={textareaClass}
                />
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">What tools or platforms do you use for your study abroad research?</label>
                <input
                  type="text"
                  value={profile.tools_used}
                  onChange={(e) => setProfile({ ...profile, tools_used: e.target.value })}
                  placeholder="e.g. QS rankings, Duolingo, IELTS prep apps, LinkedIn, Scholarship portals..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Anything else your Personal AI Genius should know about you?</label>
                <textarea
                  value={profile.additional_context}
                  onChange={(e) => setProfile({ ...profile, additional_context: e.target.value })}
                  placeholder="e.g. I'm a first-generation university student, I have a 3.8 GPA, I've already passed IELTS with 7.5, I have a scholarship partially covered, I need to work part-time while studying..."
                  rows={4}
                  className={textareaClass}
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-muted text-foreground font-medium text-sm hover:bg-muted/70 transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < steps.length ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-hero text-primary-foreground font-semibold text-sm shadow-soft hover:shadow-hover transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Continue <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onComplete(profile)}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-hero text-primary-foreground font-semibold text-sm shadow-soft hover:shadow-hover transition-all hover:scale-[1.01] disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Activating your AI Genius...</>
            ) : (
              <><Rocket className="w-4 h-4" /> Activate My Personal AI Genius</>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
