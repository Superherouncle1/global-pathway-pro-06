import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, CreditCard, Settings, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, PLAN_TIERS, CREDIT_TOPUPS, getTierByProductId } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const planFeatures: Record<string, string[]> = {
  starter: [
    "50 AI credits/month",
    "GINIE — Personal AI Genius",
    "Basic scholarship matching",
    "Community access",
    "Email support",
  ],
  professional: [
    "150 AI credits/month",
    "GINIE — Personal AI Genius",
    "Advanced scholarship matching",
    "Pathway mapping",
    "Priority support",
    "Interview preparation",
  ],
  premium: [
    "400 AI credits/month",
    "GINIE — Personal AI Genius",
    "All Professional features",
    "Opportunity simulator",
    "1-on-1 onboarding",
  ],
};

const planIcons = {
  starter: Zap,
  professional: Sparkles,
  premium: Crown,
};

const Pricing = () => {
  const { user, subscription, checkSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingTopup, setLoadingTopup] = useState<string | null>(null);

  const currentTier = getTierByProductId(subscription.productId);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Subscription activated!", description: "Your plan is now active. Welcome aboard! 🎉" });
      checkSubscription();
    }
    if (searchParams.get("topup") === "success") {
      const credits = searchParams.get("credits");
      toast({ title: "Credits added!", description: `${credits} credits have been added to your account.` });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No changes were made to your account.", variant: "destructive" });
    }
  }, [searchParams, checkSubscription]);

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleTopup = async (priceId: string, key: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setLoadingTopup(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-topup", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingTopup(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to open portal", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Plan</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Unlock the full power of Horizn with a plan that fits your study abroad journey.
            </p>
            {subscription.subscribed && currentTier && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Badge variant="secondary" className="text-sm px-4 py-1.5">
                  Current Plan: {currentTier.name}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleManageSubscription}>
                  <Settings className="w-4 h-4 mr-1" /> Manage Subscription
                </Button>
              </div>
            )}
          </motion.div>

          {/* Subscription Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
            {(Object.entries(PLAN_TIERS) as [string, typeof PLAN_TIERS[keyof typeof PLAN_TIERS]][]).map(([key, tier], i) => {
              const Icon = planIcons[key as keyof typeof planIcons];
              const isCurrentPlan = currentTier?.product_id === tier.product_id;
              const isProfessional = key === "professional";

              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative rounded-2xl border p-8 flex flex-col ${
                    isProfessional
                      ? "border-primary shadow-hover bg-card scale-[1.02]"
                      : "border-border bg-card shadow-card"
                  } ${isCurrentPlan ? "ring-2 ring-primary" : ""}`}
                >
                  {isProfessional && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="gradient-hero text-primary-foreground px-4">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <Badge variant="secondary" className="px-3">Your Plan</Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isProfessional ? "gradient-hero" : "bg-muted"}`}>
                      <Icon className={`w-6 h-6 ${isProfessional ? "text-primary-foreground" : "text-primary"}`} />
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground">{tier.name}</h3>
                    <div className="mt-2">
                      <span className="font-display text-4xl font-bold text-foreground">${tier.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {planFeatures[key]?.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${isProfessional ? "gradient-hero text-primary-foreground hover:opacity-90" : ""}`}
                    variant={isProfessional ? "default" : "outline"}
                    disabled={isCurrentPlan || !!loadingPlan}
                    onClick={() => handleSubscribe(tier.price_id, key)}
                  >
                    {loadingPlan === key ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {isCurrentPlan ? "Current Plan" : "Get Started"}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Credit Top-Ups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                Need More Credits?
              </h2>
              <p className="text-muted-foreground">
                Top up your AI credits anytime with a one-time purchase.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(Object.entries(CREDIT_TOPUPS) as [string, typeof CREDIT_TOPUPS[keyof typeof CREDIT_TOPUPS]][]).map(([key, topup]) => (
                <div
                  key={key}
                  className="rounded-xl border border-border bg-card p-6 text-center shadow-card hover:shadow-hover transition-shadow"
                >
                  <CreditCard className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="font-display text-2xl font-bold text-foreground">{topup.credits}</p>
                  <p className="text-sm text-muted-foreground mb-4">credits</p>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={!!loadingTopup || !user}
                    onClick={() => handleTopup(topup.price_id, key)}
                  >
                    {loadingTopup === key ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    ${topup.price}
                  </Button>
                </div>
              ))}
            </div>

            {!user && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                <button onClick={() => navigate("/auth")} className="text-primary hover:underline">
                  Sign in
                </button>{" "}
                to purchase credits or subscribe.
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
