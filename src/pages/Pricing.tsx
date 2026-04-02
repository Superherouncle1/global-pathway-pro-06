import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, CreditCard, Settings, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, PLAN_TIERS, CREDIT_TOPUPS, getTierByProductId } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { hapticFeedback, hapticNotification } from "@/hooks/use-native";
import { useIAP, IAP_PRODUCTS } from "@/hooks/use-iap";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const planDescriptions: Record<string, string> = {
  starter: "Essential AI tools for your study abroad journey",
  professional: "Advanced guidance with priority support & maps",
  premium: "Full access with simulator & personal onboarding",
};

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
  const { isIOS, ready, purchase, purchasing, restoring, restorePurchases } = useIAP();

  const currentTier = getTierByProductId(subscription.productId);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      hapticNotification("success");
      toast({ title: "Subscription activated!", description: "Your plan is now active. Welcome aboard! 🎉" });
      checkSubscription();
    }
    if (searchParams.get("topup") === "success") {
      hapticNotification("success");
      const credits = searchParams.get("credits");
      toast({ title: "Credits added!", description: `${credits} credits have been added to your account.` });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout canceled", description: "No changes were made to your account.", variant: "destructive" });
    }
  }, [searchParams, checkSubscription]);

  const handleStripeSubscribe = async (priceId: string, planKey: string) => {
    if (!user) { navigate("/auth"); return; }
    hapticFeedback("medium");
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleIAPSubscribe = async (planKey: string) => {
    if (!user) { navigate("/auth"); return; }
    hapticFeedback("medium");
    const iapId = IAP_PRODUCTS.subscriptions[planKey as keyof typeof IAP_PRODUCTS.subscriptions];
    if (!iapId) return;
    try {
      await purchase(iapId);
      hapticNotification("success");
      toast({ title: "Subscription activated!", description: "Your plan is now active. Welcome aboard! 🎉" });
      checkSubscription();
    } catch (err: any) {
      if (err?.code !== "USER_CANCELLED") {
        toast({ title: "Purchase failed", description: err.message || "Could not complete purchase", variant: "destructive" });
      }
    }
  };

  const handleSubscribe = (priceId: string, planKey: string) => {
    if (isIOS && !ready) {
      toast({ title: "App Store is loading", description: "Please wait a few seconds for products to finish loading.", variant: "destructive" });
      return;
    }

    if (isIOS) {
      handleIAPSubscribe(planKey);
    } else {
      handleStripeSubscribe(priceId, planKey);
    }
  };

  const handleStripeTopup = async (priceId: string, key: string) => {
    if (!user) { navigate("/auth"); return; }
    setLoadingTopup(key);
    try {
      const { data, error } = await supabase.functions.invoke("create-topup", { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start checkout", variant: "destructive" });
    } finally {
      setLoadingTopup(null);
    }
  };

  const handleIAPTopup = async (key: string) => {
    if (!user) { navigate("/auth"); return; }
    const iapId = IAP_PRODUCTS.topups[key as keyof typeof IAP_PRODUCTS.topups];
    if (!iapId) return;
    try {
      await purchase(iapId);
      hapticNotification("success");
      toast({ title: "Credits added!", description: "Your credits have been added to your account." });
    } catch (err: any) {
      if (err?.code !== "USER_CANCELLED") {
        toast({ title: "Purchase failed", description: err.message || "Could not complete purchase", variant: "destructive" });
      }
    }
  };

  const handleTopup = (priceId: string, key: string) => {
    if (isIOS && !ready) {
      toast({ title: "App Store is loading", description: "Please wait a few seconds for products to finish loading.", variant: "destructive" });
      return;
    }

    if (isIOS) {
      handleIAPTopup(key);
    } else {
      handleStripeTopup(priceId, key);
    }
  };

  const handleManageSubscription = async () => {
    if (isIOS) {
      window.location.href = "https://apps.apple.com/account/subscriptions";
      return;
    }
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to open portal", variant: "destructive" });
    }
  };

  const isLoading = (planKey: string) => loadingPlan === planKey || purchasing === IAP_PRODUCTS.subscriptions[planKey as keyof typeof IAP_PRODUCTS.subscriptions];
  const isTopupLoading = (key: string) => loadingTopup === key || purchasing === IAP_PRODUCTS.topups[key as keyof typeof IAP_PRODUCTS.topups];

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
              Unlock the full power of GlobalGenie with a plan that fits your study abroad journey.
            </p>
            {isIOS && user && !ready && (
              <p className="text-sm text-muted-foreground mt-4">
                Loading App Store products…
              </p>
            )}
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
                    <p className="text-sm text-muted-foreground mt-1">{planDescriptions[key]}</p>
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
                    disabled={isCurrentPlan || isLoading(key) || (isIOS && !ready)}
                    onClick={() => handleSubscribe(tier.price_id, key)}
                  >
                    {isLoading(key) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isIOS && !ready ? "Loading App Store…" : isCurrentPlan ? "Current Plan" : "Get Started"}
                  </Button>
                </motion.div>
              );
            })}
          </div>

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
                    disabled={isTopupLoading(key) || !user || (isIOS && !ready)}
                    onClick={() => handleTopup(topup.price_id, key)}
                  >
                    {isTopupLoading(key) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {isIOS && !ready ? "Loading App Store…" : `$${topup.price}`}
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

            {isIOS && user && (
              <div className="text-center mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={restoring || !ready}
                  onClick={async () => {
                    try {
                      await restorePurchases();
                      toast({ title: "Restore initiated", description: "If you have previous purchases, they will be restored shortly." });
                    } catch {
                      toast({ title: "Restore failed", description: "Could not restore purchases. Please try again.", variant: "destructive" });
                    }
                  }}
                >
                  {restoring ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RotateCcw className="w-4 h-4 mr-2" />}
                  {ready ? "Restore Purchases" : "Loading App Store…"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
