import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  loading: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  subscription: SubscriptionState;
  checkSubscription: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PLAN_TIERS = {
  starter: {
    product_id: "prod_U8C9WeagccyDIX",
    price_id: "price_1T9vkrRtAz9AjFQFzY7kbxWE",
    name: "Starter",
    price: 4.99,
    credits: 50,
  },
  professional: {
    product_id: "prod_U8CAu8HWqH8VCr",
    price_id: "price_1T9vlmRtAz9AjFQF70VPoEJF",
    name: "Professional",
    price: 9.99,
    credits: 150,
  },
  premium: {
    product_id: "prod_U8CAvc9HOMpJqL",
    price_id: "price_1T9vmZRtAz9AjFQFYu1yCT6W",
    name: "Premium",
    price: 19.99,
    credits: 400,
  },
} as const;

export const CREDIT_TOPUPS = {
  small: {
    price_id: "price_1T9vmxRtAz9AjFQFG6mVLL6F",
    credits: 30,
    price: 4.99,
  },
  medium: {
    price_id: "price_1T9vnJRtAz9AjFQFBoOPzZPp",
    credits: 80,
    price: 9.99,
  },
  large: {
    price_id: "price_1T9vnbRtAz9AjFQF4SeEc1E6",
    credits: 180,
    price: 19.99,
  },
} as const;

export const getTierByProductId = (productId: string | null) => {
  if (!productId) return null;
  return Object.values(PLAN_TIERS).find((t) => t.product_id === productId) || null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionState>({
    subscribed: false,
    productId: null,
    subscriptionEnd: null,
    loading: true,
  });

  const checkSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      setSubscription({
        subscribed: data.subscribed ?? false,
        productId: data.product_id ?? null,
        subscriptionEnd: data.subscription_end ?? null,
        loading: false,
      });
    } catch {
      setSubscription((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  useEffect(() => {
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        setTimeout(() => checkSubscription(), 0);
      } else {
        setSubscription({ subscribed: false, productId: null, subscriptionEnd: null, loading: false });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        checkSubscription();
      } else {
        setSubscription((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => authSub.unsubscribe();
  }, [checkSubscription]);

  // Auto-refresh subscription every 60 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, subscription, checkSubscription, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
