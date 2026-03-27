import { useState } from "react";
import { motion } from "framer-motion";
import {
  Info, Eye, Target, HelpCircle, Shield,
  MessageSquare, Share2, ChevronDown, ChevronUp, Heart,
  Mail, User, Send, Check, Loader2, ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqItems = [
  {
    q: "How do I start the process of studying abroad?",
    a: "Begin by researching your preferred countries and institutions. Use our Resource Hub to explore our 9 expert modules covering everything from school selection to visa preparation. We recommend starting at least 12-18 months before your intended enrollment date.",
  },
  {
    q: "What are the costs involved in studying abroad?",
    a: "Costs vary significantly by country and institution. Key expenses include tuition fees, accommodation, food, transportation, health insurance, and personal expenses. Many countries offer more affordable options than you might expect — explore Europe, Asia, and Canada alongside traditional destinations.",
  },
  {
    q: "How do I find scholarships for students?",
    a: "Check university financial aid pages, explore platforms like ScholarshipPortal.com and IIE, look into government-sponsored programs (Fulbright, DAAD, Chevening), and apply to as many relevant scholarships as possible. Our Module 5 covers this extensively.",
  },
  {
    q: "What standardized tests do I need to take?",
    a: "This depends on the country and program. Common tests include TOEFL/IELTS (English proficiency), SAT/ACT (US undergraduate), GRE/GMAT (graduate programs). Many institutions are becoming test-optional, so always check specific requirements.",
  },
  {
    q: "How long does the visa process take?",
    a: "Visa processing times vary by country — typically 2-12 weeks. We strongly recommend starting the process as soon as you receive your acceptance letter. Our Modules 6 and 7 provide detailed guidance on visa preparation and interview tips.",
  },
  {
    q: "Can I work while studying abroad?",
    a: "Most countries allow students to work part-time (typically 15-20 hours per week during term). Regulations vary by country and visa type. Always check the specific work authorization rules for your destination.",
  },
  {
    q: "How do I choose the right school for me?",
    a: "Consider factors like academic programs, location, cost, campus culture, diversity, safety, and career services. Our Module 2 provides a comprehensive guide to researching and evaluating schools based on your personal and academic goals.",
  },
  {
    q: "What support does Global Study Hub provide?",
    a: "We offer a step-by-step coaching process including school research, application guidance, funding strategies, visa support, and interview preparation. Our platform provides free modules, a global community, and optional personalized coaching.",
  },
  {
    q: "How do I prepare for culture shock?",
    a: "Embrace cultural differences as learning opportunities. Research your destination's customs beforehand, connect with current students, join campus organizations, and give yourself grace during the adjustment period. Module 8 covers this in detail.",
  },
  {
    q: "Can I study abroad if I don't speak the local language?",
    a: "Yes! Many universities worldwide offer programs taught entirely in English. Additionally, studying abroad is a great opportunity to learn a new language. Many institutions offer language courses alongside your main program of study.",
  },
];

const ContactCoachForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = {
      name: form.name.trim(),
      email: form.email.trim(),
      message: form.message.trim(),
    };
    if (!trimmed.name || !trimmed.email || !trimmed.message) return;
    if (trimmed.name.length > 100 || trimmed.email.length > 255 || trimmed.message.length > 2000) return;

    setStatus("sending");
    const { error } = await supabase.from("contact_submissions").insert(trimmed);
    if (error) {
      setStatus("error");
    } else {
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 4000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-2xl gradient-hero p-6 text-primary-foreground relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent)]" />
      <div className="relative">
        <MessageSquare className="w-8 h-8 mb-3 opacity-80" />
        <h3 className="font-display text-lg font-semibold mb-1">Speak with a Study Abroad Coach</h3>
        <p className="text-xs opacity-70 mb-4 leading-relaxed">
          Send us a message and our team will get back to you. You can also reach us directly at{" "}
          <a href="mailto:abraham.loorig@imageofafrica.org" className="underline font-medium">
            abraham.loorig@imageofafrica.org
          </a>
        </p>

        {status === "sent" ? (
          <div className="flex items-center gap-2 bg-card/20 backdrop-blur-sm rounded-xl p-4">
            <Check className="w-5 h-5" />
            <p className="text-sm font-medium">Message sent! We'll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2.5">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-60" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your name"
                required
                maxLength={100}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card/15 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-60" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Your email"
                required
                maxLength={255}
                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card/15 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
              />
            </div>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="How can we help you?"
              required
              maxLength={2000}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-card/15 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-foreground/30 resize-none"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-card text-foreground font-semibold text-sm hover:bg-card/90 transition-colors disabled:opacity-60"
            >
              {status === "sending" ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              ) : status === "error" ? (
                "Try again"
              ) : (
                <><Send className="w-4 h-4" /> Send Message</>
              )}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

const About = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Horizn — Study Abroad Companion",
          text: "Check out Horizn — your all-in-one guide to studying abroad! Free modules, global community, and expert support.",
          url: window.location.origin,
        });
      } catch {
        setShareOpen(true);
      }
    } else {
      setShareOpen(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setShareOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">About Us</h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Powered by Global Study Hub — guiding students to their dreams since day one.
            </p>
          </motion.div>

          {/* Who We Are + Why + Vision + Mission */}
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {[
              {
                icon: Info,
                title: "Who We Are",
                text: "Global Study Hub is a team of experienced education professionals and former students. We've walked the path you're on — and we built GlobalGenie to make your journey smoother, faster, and more affordable.",
                gradient: "gradient-hero",
              },
              {
                icon: Heart,
                title: "Our Why",
                text: "We've seen too many talented students lose time, money, and hope due to lack of guidance. We believe every student deserves access to expert support, regardless of where they come from or what they can afford.",
                gradient: "gradient-coral",
              },
              {
                icon: Eye,
                title: "Our Vision",
                text: "A world where every aspiring student has equal access to the tools, resources, and community they need to achieve their study abroad dreams — no matter their background.",
                gradient: "gradient-hero",
              },
              {
                icon: Target,
                title: "Our Mission",
                text: "To empower students with comprehensive, accessible, and expert-driven resources that guide them through every step of the study abroad journey — from dream to graduation and beyond.",
                gradient: "gradient-dark",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-2xl p-6 shadow-card"
              >
                <div className={`w-12 h-12 rounded-xl ${item.gradient} flex items-center justify-center mb-4`}>
                  <item.icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQ */}
          <div id="faq" className="max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <HelpCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-3">
              {faqItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-card"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-medium text-foreground text-sm pr-4">{item.q}</span>
                    {expandedFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === i && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="px-5 pb-5 border-t border-border pt-4"
                    >
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Privacy */}
          <div id="terms" className="max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="font-display text-xl font-semibold text-foreground">Terms of Use & Privacy Policy</h2>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                <p>
                  <strong className="text-foreground">Terms of Use:</strong> By using GlobalGenie, you agree to use the platform responsibly and respectfully. All content provided is for educational and informational purposes. Users must be at least 16 years old. You agree not to misuse the platform, share harmful content, or violate the rights of other users.
                </p>
                <p>
                  <strong className="text-foreground">Privacy Policy:</strong> We take your privacy seriously. Personal information you provide (name, email, contact number) is used solely to personalize your experience. We do not sell your data to third parties. Community interactions are visible to other users. We use standard security measures to protect your information.
                </p>
                <p>
                  <strong className="text-foreground">Content Disclaimer:</strong> The study abroad guidance provided through GlobalGenie and Global Study Hub is informational. Visa, immigration, and academic requirements change frequently — always verify with official sources and consult qualified professionals for your specific situation.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Contact Coach Form + Share */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactCoachForm />

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="rounded-2xl gradient-coral p-6 text-accent-foreground relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent)]" />
              <div className="relative">
                <Share2 className="w-8 h-8 mb-4 opacity-80" />
                <h3 className="font-display text-xl font-semibold mb-2">Share with Friends</h3>
                <p className="text-sm opacity-80 mb-5 leading-relaxed">
                  Know someone planning to study abroad? Share GlobalGenie and help them start their journey right.
                </p>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card text-foreground font-semibold text-sm hover:bg-card/90 transition-colors"
                >
                  Share GlobalGenie
                  <Share2 className="w-4 h-4" />
                </button>

                {shareOpen && (
                  <div className="mt-3 bg-card/20 rounded-lg p-3 backdrop-blur-sm">
                    <p className="text-xs mb-2 opacity-80">Copy link to share:</p>
                    <button
                      onClick={copyLink}
                      className="text-xs bg-card text-foreground px-3 py-1.5 rounded-lg font-medium"
                    >
                      📋 Copy Link
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default About;
