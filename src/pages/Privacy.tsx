import { motion } from "framer-motion";
import { Shield, Database, BrainCircuit, GraduationCap, Globe, Mail, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BackButton from "@/components/BackButton";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const lastUpdated = "March 8, 2026";

const sections = [
  {
    icon: Database,
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a GlobalGenie account, we collect your name, email address, and password. You may optionally provide your phone number, country, field of study, bio, and profile photo.",
      },
      {
        subtitle: "AI Training Data",
        text: "When you train GINIE (your Personal AI Genius), we collect the information you provide including your education level, institution, field of study, graduation year, target countries, career goals, study abroad goals, preferred opportunity types, biggest challenges, and any additional context you share. This data is stored securely and used exclusively to personalize your AI experience.",
      },
      {
        subtitle: "Usage Data",
        text: "We automatically collect basic usage data such as pages visited, features used, and interaction patterns to improve the platform. We do not track you across other websites.",
      },
      {
        subtitle: "Community Interactions",
        text: "Messages you send in the community chat and any opportunity listings you post are visible to other authenticated users. Your profile name, country, and field of study are displayed in the community directory.",
      },
    ],
  },
  {
    icon: BrainCircuit,
    title: "2. How We Use AI",
    content: [
      {
        subtitle: "GINIE — Personal AI Genius",
        text: "GINIE uses the profile data you provide during training to deliver personalized study abroad intelligence — specific scholarships, real deadlines, application strategies, and career guidance tailored to your unique situation. Your training data is sent to our AI service providers (Google Gemini and OpenAI) to generate responses. These providers do not use your data to train their models.",
      },
      {
        subtitle: "Timi — Study Abroad Assistant",
        text: "Timi is a general-purpose assistant that answers study abroad questions. Conversations with Timi are processed through our AI providers but are not stored permanently or linked to your profile.",
      },
      {
        subtitle: "AI Limitations",
        text: "AI-generated content is for informational purposes only. Visa requirements, scholarship deadlines, and immigration rules change frequently. Always verify AI-provided information with official sources before making decisions.",
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "3. Study Abroad Guidance Disclaimer",
    content: [
      {
        subtitle: "Informational Purpose",
        text: "All study abroad guidance, resources, training modules, and AI-generated advice provided through GlobalGenie are for informational and educational purposes only. They do not constitute legal, immigration, financial, or professional advice.",
      },
      {
        subtitle: "External Links",
        text: "Our Resource Hub links to official government websites, scholarship portals, and institutional pages. We curate these links carefully but are not responsible for the content, accuracy, or availability of external websites.",
      },
      {
        subtitle: "Professional Consultation",
        text: "For visa applications, immigration matters, financial planning, and legal questions, we strongly recommend consulting qualified professionals in the relevant jurisdiction.",
      },
    ],
  },
  {
    icon: Shield,
    title: "4. Data Protection & Security",
    content: [
      {
        subtitle: "Storage & Encryption",
        text: "Your data is stored securely using industry-standard encryption. We use Lovable Cloud infrastructure with row-level security policies ensuring users can only access their own data.",
      },
      {
        subtitle: "Data Retention",
        text: "Your account data is retained for as long as your account is active. AI conversation history may be periodically cleared. You can request deletion of your account and all associated data at any time by contacting us.",
      },
      {
        subtitle: "No Sale of Data",
        text: "We do not sell, rent, or trade your personal information to third parties. We do not use your data for advertising purposes.",
      },
    ],
  },
  {
    icon: Globe,
    title: "5. Third-Party Services",
    content: [
      {
        subtitle: "AI Providers",
        text: "We use Google (Gemini) and OpenAI to power GINIE and Timi. Your prompts and profile context are sent to these services to generate responses. These providers operate under their own privacy policies and data processing agreements.",
      },
      {
        subtitle: "Authentication",
        text: "We use secure email-based authentication. Passwords are hashed and never stored in plain text.",
      },
      {
        subtitle: "Analytics",
        text: "We may use privacy-respecting analytics to understand how users interact with the platform. We do not use invasive tracking technologies.",
      },
    ],
  },
  {
    icon: Mail,
    title: "6. Your Rights & Contact",
    content: [
      {
        subtitle: "Your Rights",
        text: "You have the right to access, correct, or delete your personal data. You can update your profile information at any time through the My Space page. To request full account deletion or a copy of your data, contact us using the details below.",
      },
      {
        subtitle: "Children's Privacy",
        text: "GlobalGenie is intended for users aged 16 and older. We do not knowingly collect personal information from children under 16.",
      },
      {
        subtitle: "Contact Us",
        text: "For any privacy-related questions, concerns, or requests, please contact us at abraham.loorig@imageofafrica.org or through the contact form on our About page.",
      },
      {
        subtitle: "Changes to This Policy",
        text: "We may update this Privacy Policy from time to time. We will notify users of significant changes through the platform. Continued use of GlobalGenie after changes constitutes acceptance of the updated policy.",
      },
    ],
  },
];

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <BackButton />
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="w-4 h-4" />
              Privacy & Data Protection
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last updated: {lastUpdated}
            </p>
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mb-8"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              At <strong className="text-foreground">GlobalGenie</strong> (operated by Global Study Hub), we are committed to protecting your privacy and being transparent about how we handle your data. This policy explains what information we collect, how we use it — including our AI features — and your rights regarding your personal data.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-foreground">
                    {section.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {section.content.map((item) => (
                    <div key={item.subtitle}>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {item.subtitle}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 text-center"
          >
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to About Us
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Privacy;
