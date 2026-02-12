import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen, School, FileText, MessageSquare, DollarSign, Stamp,
  ClipboardCheck, Home, Briefcase, ChevronDown, ChevronUp,
  ExternalLink, Globe
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

const recommendedLinks = [
  { title: "IIE Study Abroad", url: "https://www.iie.org/", desc: "Institute of International Education — scholarships and programs" },
  { title: "StudyPortals", url: "https://www.studyportals.com/", desc: "Search programs worldwide across 3,750+ universities" },
  { title: "IELTS / TOEFL Prep", url: "https://www.ets.org/toefl", desc: "Official English language test preparation resources" },
  { title: "Scholarship Portal", url: "https://www.scholarshipportal.com/", desc: "Search scholarships available for students" },
  { title: "Numbeo Cost of Living", url: "https://www.numbeo.com/", desc: "Compare cost of living across cities worldwide" },
  { title: "EducationUSA", url: "https://educationusa.state.gov/", desc: "U.S. Department of State resource for studying in the USA" },
  { title: "DAAD", url: "https://www.daad.de/en/", desc: "German Academic Exchange Service — study in Germany" },
  { title: "Study in Europe", url: "https://www.studyin.eu/", desc: "Official guide to studying in European countries" },
];

const Resources = () => {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
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

          {/* Modules */}
          <div className="max-w-4xl mx-auto space-y-4 mb-20">
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
                  {expandedModule === module.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {expandedModule === module.id && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-5 md:px-6 pb-6 border-t border-border pt-5"
                  >
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
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Recommended Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-8">
              Recommended Resources & Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {recommendedLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 bg-card border border-border rounded-xl hover:shadow-hover hover:-translate-y-1 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-semibold text-foreground text-sm">{link.title}</h3>
                    <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{link.desc}</p>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Resources;
