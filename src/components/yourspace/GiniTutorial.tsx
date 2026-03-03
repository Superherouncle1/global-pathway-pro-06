import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Brain, Globe, Target, Zap, ChevronRight, ChevronLeft, Rocket } from "lucide-react";

const TUTORIAL_STEPS = [
  {
    icon: Sparkles,
    title: "Meet GINIE 👋",
    subtitle: "Your Personal AI Genius",
    description:
      "GINIE isn't a generic chatbot — it's YOUR dedicated, internet-connected study-abroad advisor that knows exactly who you are, what you want, and where you're going.",
    highlights: ["Hyper-personalised to YOU", "Real-time web search", "Always up-to-date"],
  },
  {
    icon: Brain,
    title: "Train GINIE on YOU",
    subtitle: "6 quick steps, ~3 minutes",
    description:
      "Tell GINIE about your education, target countries, career goals, and challenges. The more you share, the sharper and more relevant GINIE's intelligence becomes.",
    highlights: ["Your education & field", "Target countries & goals", "Challenges & preferences"],
  },
  {
    icon: Globe,
    title: "Get Real-Time Intelligence",
    subtitle: "Scholarships, visas, deadlines — live",
    description:
      "Once trained, GINIE searches the web in real-time to find current scholarships, visa requirements, university deadlines, and funding — specific to YOUR profile.",
    highlights: ["Live scholarship search", "Current visa requirements", "Exact deadlines & portals"],
  },
  {
    icon: Target,
    title: "Interview Coaching",
    subtitle: "Mock interviews with AI scoring",
    description:
      "GINIE can run full mock admissions and visa interviews, scoring your answers 1–10 and coaching you on exactly what to improve — like having a private mentor.",
    highlights: ["Admissions mock interviews", "Visa interview simulation", "Answer scoring & coaching"],
  },
  {
    icon: Zap,
    title: "Always Getting Smarter",
    subtitle: "Update anytime, chat persists",
    description:
      "Your training is saved and your chat history persists across sessions. You can retrain GINIE anytime as your goals evolve — it grows with you.",
    highlights: ["Persistent chat history", "Retrain anytime", "Voice mode supported"],
  },
];

interface Props {
  userName: string;
  onComplete: () => void;
}

export default function GinieTutorial({ userName, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const current = TUTORIAL_STEPS[step];
  const isLast = step === TUTORIAL_STEPS.length - 1;
  const Icon = current.icon;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-2">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {TUTORIAL_STEPS.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === step ? "w-6 bg-primary" : i < step ? "w-3 bg-primary/40" : "w-3 bg-border"
            }`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="text-center"
        >
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl gradient-hero flex items-center justify-center mx-auto mb-5 shadow-soft">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Title */}
          <h3 className="font-display text-xl font-bold text-foreground mb-1">
            {step === 0 && userName ? `${current.title.replace("👋", "")}, ${userName}! 👋` : current.title}
          </h3>
          <p className="text-sm text-primary font-medium mb-3">{current.subtitle}</p>

          {/* Description */}
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5 leading-relaxed">
            {current.description}
          </p>

          {/* Highlight chips */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {current.highlights.map((h) => (
              <span
                key={h}
                className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium"
              >
                {h}
              </span>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all disabled:opacity-0 disabled:pointer-events-none"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        {/* Skip */}
        <button
          onClick={onComplete}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
        >
          Skip tutorial
        </button>

        {isLast ? (
          <button
            onClick={onComplete}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-hero text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.02]"
          >
            <Rocket className="w-4 h-4" /> Start Training
          </button>
        ) : (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-hero text-primary-foreground text-sm font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.02]"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
