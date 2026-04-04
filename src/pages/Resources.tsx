import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, School, FileText, MessageSquare, DollarSign, Stamp,
  ClipboardCheck, Home, Briefcase, ChevronDown, ChevronUp,
  ExternalLink, Globe, GraduationCap, Search, Filter
} from "lucide-react";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import BookmarkButton from "@/components/BookmarkButton";

// ─── Training Modules ───────────────────────────────────────────────────────

interface Module {
  id: number;
  title: string;
  icon: React.ElementType;
  summary: string;
  keyPoints: string[];
  tips: string[];
}

const modules: Module[] = [
  {
    id: 1,
    title: "Why Study Abroad",
    icon: Globe,
    summary: "Discover the life-changing benefits of studying at international institutions — world-class education, diverse cultures, career opportunities, and personal growth.",
    keyPoints: [
      "Access to world-class universities and cutting-edge research",
      "Cultural diversity and global networking opportunities",
      "Enhanced career prospects with international experience",
      "Personal growth through independence and new perspectives",
      "Opportunities for scholarships and funding internationally",
    ],
    tips: [
      "Start researching destinations at least 18 months before your intended start date",
      "Consider countries beyond the traditional choices — explore Europe, Asia, Canada, Australia, and more",
      "Connect with alumni from your target institutions for authentic insights",
    ],
  },
  {
    id: 2,
    title: "Selecting a School",
    icon: School,
    summary: "Learn how to research and evaluate potential schools based on academic programs, location, costs, campus culture, and your personal goals.",
    keyPoints: [
      "Research universities through official websites, rankings, and college fairs",
      "Consider location, cost of living, campus safety, and student diversity",
      "Evaluate academic programs, faculty quality, and student-to-faculty ratios",
      "Look into extracurricular activities and support services for students",
      "Speak with current students and alumni for firsthand perspectives",
    ],
    tips: [
      "Don't rely solely on rankings — find the school that fits YOUR goals",
      "Visit campuses virtually or in-person whenever possible",
      "Check if the institution offers dedicated student support services",
    ],
  },
  {
    id: 3,
    title: "Applying to a School",
    icon: FileText,
    summary: "Master the application process — understand deadlines, required documents, and strategies for crafting a standout application.",
    keyPoints: [
      "Understand different deadline types: rolling admissions vs. fixed deadlines",
      "Prepare key documents: transcripts, standardized test scores, recommendation letters",
      "Craft a compelling personal statement or statement of purpose",
      "Get credential evaluations for international transcripts",
      "Contact admissions offices directly if you have questions",
    ],
    tips: [
      "Start your applications early — well before deadlines",
      "Have your personal statement reviewed by mentors or advisors",
      "Apply to a mix of reach, match, and safety schools",
      "Keep organized records of all application requirements and deadlines",
    ],
  },
  {
    id: 4,
    title: "Admission Interviews",
    icon: MessageSquare,
    summary: "Prepare for college admission interviews with practical tips on research, presentation, and how to showcase your unique story.",
    keyPoints: [
      "Research the institution thoroughly — history, mission, programs, and culture",
      "Practice with the STAR method (Situation, Task, Action, Result)",
      "Dress professionally and arrive 10–15 minutes early",
      "Bring copies of your admission documents",
      "Follow up with a thank-you email after the interview",
    ],
    tips: [
      "Be an 'enthusiastic version of yourself' — authentic yet passionate",
      "Prepare specific questions to ask the interviewer about the school",
      "Practice with friends or mentors until you feel confident",
    ],
  },
  {
    id: 5,
    title: "Financing Your Education",
    icon: DollarSign,
    summary: "Explore funding options including scholarships, grants, assistantships, part-time work, and loan programs for students.",
    keyPoints: [
      "Explore scholarships — merit-based, need-based, and field-specific",
      "Look into grants from institutions, governments, and private organizations",
      "Consider teaching or research assistantships (especially for graduate students)",
      "Understand part-time work regulations for students",
      "Research loan options and understand repayment obligations",
    ],
    tips: [
      "Apply for scholarships as early as possible — competition is fierce",
      "Create a detailed budget covering tuition, housing, food, transportation, and insurance",
      "Look for funding from your home country's government or international organizations",
    ],
  },
  {
    id: 6,
    title: "The Visa Process",
    icon: Stamp,
    summary: "Navigate the visa application process — understand visa types, required documents, and how to prepare for a successful application.",
    keyPoints: [
      "Understand different visa types: F-1, J-1, M-1, and country-specific student visas",
      "Gather required documents: passport, acceptance letter, financial proof, transcripts",
      "Pay all required fees and schedule your visa appointment early",
      "Maintain compliance with visa requirements throughout your studies",
      "Be aware of country-specific requirements based on your origin",
    ],
    tips: [
      "Start the visa process as soon as you receive your acceptance letter",
      "Organize all documents clearly before your appointment",
      "Prepare evidence of strong ties to your home country",
    ],
  },
  {
    id: 7,
    title: "Visa Interview Tips",
    icon: ClipboardCheck,
    summary: "Ace your visa interview with proven tips on preparation, presentation, and how to demonstrate your intentions clearly.",
    keyPoints: [
      "Practice common interview questions with friends or family",
      "Dress professionally and arrive at least an hour early",
      "Be honest, concise, and direct in your answers",
      "Demonstrate your intent to return home after completing studies",
      "Stay calm, composed, and respectful throughout the interview",
    ],
    tips: [
      "Prepare for three key areas: your program, your funding, and your post-study plans",
      "Join practice groups where you can rehearse with other applicants",
      "Remember — visa officers want to help you succeed, not trick you",
    ],
  },
  {
    id: 8,
    title: "Adjusting to Life Abroad",
    icon: Home,
    summary: "Strategies for navigating cultural differences, finding housing and transportation, and making the most of campus life.",
    keyPoints: [
      "Embrace cultural differences as learning opportunities",
      "Research housing options: on-campus, off-campus, or host families",
      "Understand local transportation: public transit, ride-sharing, biking",
      "Get involved in campus clubs, organizations, and cultural events",
      "Build a support network with other international and local students",
    ],
    tips: [
      "Keep an open mind and step outside your comfort zone",
      "Ask questions — locals appreciate genuine curiosity about their culture",
      "Connect with student offices for orientation and ongoing support",
    ],
  },
  {
    id: 9,
    title: "Career Preparation",
    icon: Briefcase,
    summary: "Build your career while studying — networking strategies, gaining experience, developing skills, and navigating the job market.",
    keyPoints: [
      "Build your professional network early through events, LinkedIn, and mentors",
      "Gain relevant experience through internships, co-ops, and part-time roles",
      "Develop transferable skills: communication, teamwork, problem-solving",
      "Research industries and understand job postings and application norms",
      "Create a strong resume, cover letter, and professional online presence",
    ],
    tips: [
      "Start career planning from your first semester — don't wait until graduation",
      "Use university career services — they offer free resume reviews, mock interviews, and job fairs",
      "Understand work authorization rules for international graduates in your host country",
    ],
  },
];

// ─── Global Resource Hub Data ────────────────────────────────────────────────

type CountryKey = "all" | "uk" | "us" | "canada" | "schengen" | "australia";
type ResourceCategory = "scholarship" | "visa" | "programs" | "general";

interface Resource {
  title: string;
  url: string;
  desc: string;
  category: ResourceCategory;
  countries: CountryKey[];
  badge?: string;
}

const COUNTRIES: { key: CountryKey; label: string; flag: string }[] = [
  { key: "all",       label: "All Countries", flag: "🌍" },
  { key: "uk",        label: "United Kingdom", flag: "🇬🇧" },
  { key: "us",        label: "United States",  flag: "🇺🇸" },
  { key: "canada",    label: "Canada",          flag: "🇨🇦" },
  { key: "schengen",  label: "Schengen / Europe", flag: "🇪🇺" },
  { key: "australia", label: "Australia",       flag: "🇦🇺" },
];

const CATEGORIES: { key: ResourceCategory | "all"; label: string; icon: React.ElementType }[] = [
  { key: "all",        label: "All",         icon: Globe },
  { key: "scholarship",label: "Scholarships", icon: DollarSign },
  { key: "visa",       label: "Visa & Immigration", icon: Stamp },
  { key: "programs",   label: "Programs",    icon: GraduationCap },
  { key: "general",    label: "General",     icon: BookOpen },
];

const globalResources: Resource[] = [
  // ── SCHOLARSHIPS ──────────────────────────────────────────────────────────
  {
    title: "Chevening Scholarships",
    url: "https://www.chevening.org/scholarships/",
    desc: "UK government's flagship scholarship for future global leaders. Fully funded masters programmes at UK universities.",
    category: "scholarship",
    countries: ["uk"],
    badge: "Fully Funded",
  },
  {
    title: "GREAT Scholarships – UK",
    url: "https://www.britishcouncil.org/study-work-abroad/in-uk/great-scholarships",
    desc: "British Council & UK universities partnership offering £10,000+ scholarships for postgraduate study in the UK.",
    category: "scholarship",
    countries: ["uk"],
    badge: "£10,000+",
  },
  {
    title: "FullBright Program – USA",
    url: "https://foreign.fulbrightonline.org/",
    desc: "US government's premier international exchange scholarship for graduate students, researchers, and professionals.",
    category: "scholarship",
    countries: ["us"],
    badge: "Fully Funded",
  },
  {
    title: "EducationUSA Scholarships",
    url: "https://educationusa.state.gov/find-financial-assistance",
    desc: "Official U.S. State Department portal for finding financial assistance and scholarships to study in the USA.",
    category: "scholarship",
    countries: ["us"],
  },
  {
    title: "Vanier Canada Graduate Scholarships",
    url: "https://vanier.gc.ca/en/home-accueil.html",
    desc: "Canadian government awards $50,000/year for 3 years to doctoral students at Canadian universities.",
    category: "scholarship",
    countries: ["canada"],
    badge: "$50,000/yr",
  },
  {
    title: "Canada Graduate Scholarships – Master's",
    url: "https://www.nserc-crsng.gc.ca/students-etudiants/pg-cs/cgsm-bescm_eng.asp",
    desc: "NSERC, SSHRC & CIHR offer $17,500 master's scholarships for study and research in Canada.",
    category: "scholarship",
    countries: ["canada"],
    badge: "$17,500",
  },
  {
    title: "Erasmus+ Scholarships",
    url: "https://erasmus-plus.ec.europa.eu/",
    desc: "EU's flagship education programme funding study, training, and volunteering across 33 countries.",
    category: "scholarship",
    countries: ["schengen"],
    badge: "EU Funded",
  },
  {
    title: "DAAD Scholarships – Germany",
    url: "https://www.daad.de/en/study-and-research-in-germany/scholarships/",
    desc: "German Academic Exchange Service offering scholarships for all levels of study in Germany.",
    category: "scholarship",
    countries: ["schengen"],
  },
  {
    title: "Australia Awards",
    url: "https://www.australiaawards.gov.au/",
    desc: "Australian Government's flagship international development scholarships for students from partner countries.",
    category: "scholarship",
    countries: ["australia"],
    badge: "Fully Funded",
  },
  {
    title: "Endeavour Leadership Program",
    url: "https://www.dfat.gov.au/people-to-people/schools/pages/endeavour-leadership-program",
    desc: "Australian Government scholarship supporting international students to study, research, or undertake professional development in Australia.",
    category: "scholarship",
    countries: ["australia"],
  },
  {
    title: "ScholarshipPortal",
    url: "https://www.scholarshipportal.com/",
    desc: "Europe's largest scholarship database — search thousands of opportunities across all countries.",
    category: "scholarship",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },
  {
    title: "StudyPortals Scholarships",
    url: "https://www.masterspotal.com/scholarships",
    desc: "Global database of scholarships at master's and bachelor's level across 3,750+ universities.",
    category: "scholarship",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },

  // ── VISA & IMMIGRATION ────────────────────────────────────────────────────
  {
    title: "UK Student Visa (Tier 4 / Student Route)",
    url: "https://www.gov.uk/student-visa",
    desc: "Official UK Home Office portal to apply for a Student visa, check eligibility, and track your application.",
    category: "visa",
    countries: ["uk"],
    badge: "Official",
  },
  {
    title: "UK UKCISA – Student Immigration Advice",
    url: "https://www.ukcisa.org.uk/",
    desc: "UK Council for International Student Affairs — comprehensive guides on student visas, rights, and regulations.",
    category: "visa",
    countries: ["uk"],
  },
  {
    title: "US F-1 Student Visa – SEVP",
    url: "https://www.ice.gov/sevis/students",
    desc: "U.S. Immigration's official SEVIS resource for F-1 and M-1 student visa holders and their institutions.",
    category: "visa",
    countries: ["us"],
    badge: "Official",
  },
  {
    title: "US Visa Application – State Dept",
    url: "https://travel.state.gov/content/travel/en/us-visas/study/student-visa.html",
    desc: "Official U.S. Department of State guide to applying for F-1, J-1, and M-1 student visas.",
    category: "visa",
    countries: ["us"],
    badge: "Official",
  },
  {
    title: "Canada Study Permit",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit.html",
    desc: "IRCC's official guide to applying for a Canadian study permit, with eligibility and document requirements.",
    category: "visa",
    countries: ["canada"],
    badge: "Official",
  },
  {
    title: "Canada Student Direct Stream (SDS)",
    url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/study-canada/study-permit/student-direct-stream.html",
    desc: "Faster study permit processing for eligible students from designated countries — decisions in 20 days.",
    category: "visa",
    countries: ["canada"],
    badge: "Fast-Track",
  },
  {
    title: "Schengen Student Visa Guide",
    url: "https://www.schengenvisainfo.com/schengen-visa-types/type-d-national-visa/student-visa/",
    desc: "Comprehensive guide on applying for a long-stay (Type D) national student visa in Schengen countries.",
    category: "visa",
    countries: ["schengen"],
  },
  {
    title: "Germany – Study in Germany Visa",
    url: "https://www.study-in-germany.de/en/plan-your-studies/requirements/visa-entry/",
    desc: "Official DAAD/German government guide on obtaining a student visa and residence permit for Germany.",
    category: "visa",
    countries: ["schengen"],
    badge: "Official",
  },
  {
    title: "France – Campus France Visa",
    url: "https://www.campusfrance.org/en/visa",
    desc: "Official Campus France guide on the student visa and 'Études en France' procedure for non-EU applicants.",
    category: "visa",
    countries: ["schengen"],
  },
  {
    title: "Australia Student Visa (Subclass 500)",
    url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/student-500",
    desc: "Official Australian Department of Home Affairs portal for the Student visa (subclass 500) application.",
    category: "visa",
    countries: ["australia"],
    badge: "Official",
  },
  {
    title: "Australia – ImmiAccount",
    url: "https://immi.homeaffairs.gov.au/help-support/applying-online-or-on-paper/online/immiaccount",
    desc: "Official portal to apply for Australian student visas online, upload documents, and track your application.",
    category: "visa",
    countries: ["australia"],
    badge: "Official",
  },

  // ── PROGRAMS & UNIVERSITIES ───────────────────────────────────────────────
  {
    title: "UCAS – Apply to UK Universities",
    url: "https://www.ucas.com/",
    desc: "The official and only application system for undergraduate courses at UK universities.",
    category: "programs",
    countries: ["uk"],
    badge: "Official",
  },
  {
    title: "Study in the UK – British Council",
    url: "https://study-uk.britishcouncil.org/",
    desc: "British Council's official guide for international students — find courses, scholarships, and application help.",
    category: "programs",
    countries: ["uk"],
  },
  {
    title: "EducationUSA – Find a Program",
    url: "https://educationusa.state.gov/find-us-higher-education-institution",
    desc: "U.S. State Department database of accredited U.S. higher education institutions by subject and state.",
    category: "programs",
    countries: ["us"],
    badge: "Official",
  },
  {
    title: "CommonApp",
    url: "https://www.commonapp.org/",
    desc: "Apply to 1,000+ US colleges and universities with a single application form.",
    category: "programs",
    countries: ["us"],
  },
  {
    title: "EduCanada – Study in Canada",
    url: "https://www.educanada.ca/index.aspx?lang=eng",
    desc: "Official Government of Canada portal to find programs, institutions, and guidance for international students.",
    category: "programs",
    countries: ["canada"],
    badge: "Official",
  },
  {
    title: "Universities Canada",
    url: "https://www.univcan.ca/universities/",
    desc: "Directory of all 97 Canadian universities with program finders and admission information.",
    category: "programs",
    countries: ["canada"],
  },
  {
    title: "Study in Europe – Official Portal",
    url: "https://www.study-in-europe.eu/",
    desc: "Official EU portal to search degree programmes across European universities by field and country.",
    category: "programs",
    countries: ["schengen"],
    badge: "Official",
  },
  {
    title: "Study in Germany – DAAD",
    url: "https://www.study-in-germany.de/en/",
    desc: "Official DAAD guide for international students — find degree programmes, scholarships, and application tips.",
    category: "programs",
    countries: ["schengen"],
  },
  {
    title: "CRICOS – Study in Australia",
    url: "https://cricos.education.gov.au/",
    desc: "Official Australian government register of all institutions and courses approved for international students.",
    category: "programs",
    countries: ["australia"],
    badge: "Official",
  },
  {
    title: "Study Australia – Government Portal",
    url: "https://www.studyaustralia.gov.au/",
    desc: "Official Australian government destination for finding courses, institutions, and life in Australia.",
    category: "programs",
    countries: ["australia"],
  },
  {
    title: "StudyPortals",
    url: "https://www.studyportals.com/",
    desc: "Search 400,000+ programmes at 3,750+ universities worldwide by subject, level, and country.",
    category: "programs",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },

  // ── GENERAL ────────────────────────────────────────────────────────────────
  {
    title: "IIE – Institute of International Education",
    url: "https://www.iie.org/",
    desc: "Leading organisation managing international education exchange programs and scholarships worldwide.",
    category: "general",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },
  {
    title: "Numbeo Cost of Living",
    url: "https://www.numbeo.com/cost-of-living/",
    desc: "Compare cost of living, rent, and student expenses across cities worldwide.",
    category: "general",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },
  {
    title: "IELTS Preparation",
    url: "https://www.ielts.org/",
    desc: "Official IELTS portal for test registration, preparation resources, and score requirements by country.",
    category: "general",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },
  {
    title: "TOEFL Preparation – ETS",
    url: "https://www.ets.org/toefl",
    desc: "Official TOEFL preparation resources, practice tests, and registration for the world's most accepted English test.",
    category: "general",
    countries: ["all", "uk", "us", "canada", "schengen", "australia"],
  },
];

const CATEGORY_COLORS: Record<ResourceCategory, string> = {
  scholarship: "bg-primary/10 text-primary border-primary/20",
  visa:        "bg-accent/10 text-accent border-accent/20",
  programs:    "bg-secondary text-secondary-foreground border-border",
  general:     "bg-muted text-muted-foreground border-border",
};

const CATEGORY_BADGE_COLORS: Record<ResourceCategory, string> = {
  scholarship: "bg-primary/15 text-primary",
  visa:        "bg-accent/15 text-accent",
  programs:    "bg-secondary text-secondary-foreground",
  general:     "bg-muted text-muted-foreground",
};

// ─── Component ───────────────────────────────────────────────────────────────

const Resources = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryKey>("all");
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = globalResources.filter((r) => {
    const countryMatch = selectedCountry === "all" || r.countries.includes(selectedCountry) || r.countries.includes("all");
    const categoryMatch = selectedCategory === "all" || r.category === selectedCategory;
    const searchMatch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return countryMatch && categoryMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <BackButton />
        </div>
        <div className="container mx-auto px-4">

          {/* ── Header ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              9 Expert Modules
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Resource & Training Hub
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your comprehensive guide to studying abroad — from choosing a school to building your career. Each module is designed to prepare you for every step of the journey.
            </p>
          </motion.div>

          {/* ── Training Modules ────────────────────────────────────────── */}
          <div className="max-w-4xl mx-auto space-y-4 mb-24">
            {modules.map((module, i) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-hover transition-shadow"
              >
                <button
                  onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                  className="w-full flex items-center gap-4 p-5 md:p-6 text-left"
                >
                  <div className="w-12 h-12 rounded-xl gradient-hero flex-shrink-0 flex items-center justify-center">
                    <module.icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-primary mb-1">Module {module.id}</p>
                    <h3 className="font-display text-lg font-semibold text-foreground">{module.title}</h3>
                  </div>
                  <BookmarkButton
                    itemType="module"
                    referenceId={`module-${module.id}`}
                    title={`Module ${module.id}: ${module.title}`}
                    description={module.summary}
                  />
                  {expandedModule === module.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedModule === module.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 md:px-6 pb-6 border-t border-border pt-5">
                        <p className="text-muted-foreground mb-5 leading-relaxed">{module.summary}</p>

                        <h4 className="font-display font-semibold text-foreground text-sm mb-3">Key Takeaways</h4>
                        <ul className="space-y-2 mb-5">
                          {module.keyPoints.map((point, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>

                        <div className="bg-teal-light rounded-xl p-4">
                          <h4 className="font-display font-semibold text-foreground text-sm mb-2">💡 Pro Tips</h4>
                          <ul className="space-y-1.5">
                            {module.tips.map((tip, j) => (
                              <li key={j} className="text-sm text-muted-foreground">{tip}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* ── Global Resource Hub ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Section header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                <Globe className="w-4 h-4" />
                Global Resource Hub
              </div>
              <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
                Official Links & Country Guides
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto text-sm">
                Curated, up-to-date official resources for scholarships, visas, and programmes — filtered by country.
              </p>
            </div>

            {/* Country filter pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-5 max-w-4xl mx-auto">
              {COUNTRIES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCountry(c.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                    selectedCountry === c.key
                      ? "gradient-hero text-primary-foreground border-transparent shadow-soft"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span>{c.flag}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>

            {/* Category + Search row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8 max-w-4xl mx-auto">
              {/* Category tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat.key
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    }`}
                  >
                    <cat.icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative sm:ml-auto sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search resources..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2 mb-4 max-w-4xl mx-auto">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{filteredResources.length}</span> resources
              </span>
            </div>

            {/* Resource cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
              <AnimatePresence mode="popLayout">
                {filteredResources.map((resource) => (
                  <motion.div
                    key={resource.title}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        // Safari fallback: ensure link opens even if default is blocked
                        const opened = window.open(resource.url, '_blank', 'noopener,noreferrer');
                        if (opened) e.preventDefault();
                      }}
                      className="group p-5 bg-card border border-border rounded-xl hover:shadow-hover hover:-translate-y-0.5 transition-all flex flex-col h-full block"
                    >
                      {/* Top row: category pill + badge */}
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide border ${CATEGORY_COLORS[resource.category]}`}>
                          {resource.category === "programs" ? "Programme" : resource.category}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                          {resource.badge && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_BADGE_COLORS[resource.category]}`}>
                              {resource.badge}
                            </span>
                          )}
                          {/* Country flags */}
                          <span className="text-xs">
                            {resource.countries
                              .filter((c) => c !== "all")
                              .map((c) => COUNTRIES.find((x) => x.key === c)?.flag)
                              .join("")}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display font-semibold text-foreground text-sm leading-snug flex-1">
                          {resource.title}
                        </h3>
                        <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
                      </div>

                      {/* Desc */}
                      <p className="text-xs text-muted-foreground leading-relaxed flex-1">{resource.desc}</p>
                    </a>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Globe className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No resources match your filters.</p>
                <button
                  onClick={() => { setSelectedCountry("all"); setSelectedCategory("all"); setSearchQuery(""); }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
