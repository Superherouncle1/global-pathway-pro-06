import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export const useReferral = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchOrCreateCode = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    // Try to fetch existing code
    const { data } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data?.code) {
      setReferralCode(data.code);
    } else {
      // Create new code
      const code = generateCode();
      const { error } = await supabase
        .from("referral_codes")
        .insert({ user_id: user.id, code });
      if (!error) setReferralCode(code);
    }

    // Fetch referral count
    const { count } = await supabase
      .from("referral_signups")
      .select("id", { count: "exact", head: true })
      .eq("referrer_id", user.id);

    setReferralCount(count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrCreateCode();
  }, [fetchOrCreateCode]);

  const getReferralUrl = useCallback(() => {
    const base = window.location.origin;
    if (!referralCode) return base;
    return `${base}/auth?ref=${referralCode}`;
  }, [referralCode]);

  return { referralCode, referralCount, loading, getReferralUrl, refresh: fetchOrCreateCode };
};

/** Store referral code from URL into sessionStorage so it persists through signup */
export const captureReferralCode = () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get("ref");
  if (ref) {
    sessionStorage.setItem("globalgenie_ref", ref);
  }
};

/** After signup, record the referral */
export const recordReferral = async (newUserId: string) => {
  const code = sessionStorage.getItem("globalgenie_ref");
  if (!code) return;

  // Look up referrer
  const { data: referrerData } = await supabase
    .from("referral_codes")
    .select("user_id")
    .eq("code", code)
    .maybeSingle();

  if (!referrerData?.user_id || referrerData.user_id === newUserId) return;

  await supabase.from("referral_signups").insert({
    referrer_id: referrerData.user_id,
    referred_user_id: newUserId,
  });

  sessionStorage.removeItem("horizn_ref");
};
