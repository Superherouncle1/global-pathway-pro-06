import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const languages = [
  "English", "Français", "Español", "Deutsch", "العربية",
  "中文", "Português", "हिन्दी", "日本語", "한국어",
  "Italiano", "Русский", "Türkçe", "Kiswahili",
];

interface LanguageSelectorProps {
  selected: string;
  onSelect: (lang: string) => void;
}

const LanguageSelector = ({ selected, onSelect }: LanguageSelectorProps) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mb-6"
  >
    <h2 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
      <Globe className="w-5 h-5 text-primary" /> Language Choice
    </h2>
    <p className="text-sm text-muted-foreground mb-5">Choose your preferred language for the app experience.</p>

    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => onSelect(lang)}
          className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            selected === lang
              ? "gradient-hero text-primary-foreground shadow-soft"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  </motion.div>
);

export default LanguageSelector;
