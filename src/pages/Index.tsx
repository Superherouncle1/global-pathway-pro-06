import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Users, User, Globe, ArrowRight, GraduationCap, Compass, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: BookOpen,
    title: "Resource Hub",
    description: "9 expert-crafted modules covering everything from school selection to career prep.",
    link: "/resources",
    color: "gradient-hero",
  },
  {
    icon: User,
    title: "Your Space",
    description: "Personalize your profile, choose your language, and track your journey.",
    link: "/your-space",
    color: "gradient-coral",
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with fellow students worldwide. Network, chat, and grow together.",
    link: "/community",
    color: "gradient-dark",
  },
];

const stats = [
  { value: "150+", label: "Countries Represented" },
  { value: "9", label: "Expert Modules" },
  { value: "24/7", label: "Community Support" },
  { value: "Free", label: "To Get Started" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-light via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[85vh] py-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Your Study Abroad Journey Starts Here
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
                Dream it.{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Plan it.
                </span>{" "}
                Live it.
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
                Horizn gives you everything you need to study abroad — expert guides, a global community, and personalized support to turn your international education dream into reality.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/resources"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-hero text-primary-foreground font-semibold text-base shadow-soft hover:shadow-hover transition-all hover:scale-[1.02]"
                >
                  Explore Resources
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-border text-foreground font-semibold text-base hover:bg-muted transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-hover">
                <img
                  src={heroImage}
                  alt="Diverse international students on a global campus"
                  className="w-full h-auto object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card rounded-xl p-4 shadow-card border border-border animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-coral flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-sm text-foreground">Global Study Hub</p>
                    <p className="text-xs text-muted-foreground">Trusted by students worldwide</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="font-display text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need, All in One Place
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From application guidance to career preparation — we've got your entire study abroad journey covered.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
              >
                <Link
                  to={feature.link}
                  className="group block h-full p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-hover transition-all hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">{feature.description}</p>
                  <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="rounded-3xl gradient-hero p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
            <div className="relative">
              <Compass className="w-12 h-12 text-primary-foreground/80 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8">
                Join thousands of students worldwide who are using Horizn to navigate their study abroad experience.
              </p>
              <Link
                to="/resources"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-card text-foreground font-semibold hover:bg-card/90 transition-colors"
              >
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
