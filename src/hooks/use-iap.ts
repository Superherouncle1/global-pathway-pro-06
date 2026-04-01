import { useState, useEffect, useCallback } from "react";
import { isNativeApp } from "@/hooks/use-native";
import { supabase } from "@/integrations/supabase/client";

// Apple IAP product IDs — must match App Store Connect exactly
export const IAP_PRODUCTS = {
  subscriptions: {
    starter: "com.globalgenie.starter.monthly",
    professional: "com.globalgenie.professional.monthly",
    premium: "com.globalgenie.premium.monthly",
  },
  topups: {
    small: "com.globalgenie.credits.30",
    medium: "com.globalgenie.credits.80",
    large: "com.globalgenie.credits.180",
  },
} as const;

type IAPProduct = {
  id: string;
  title: string;
  description: string;
  price: string;
  loaded: boolean;
};

type StoreProduct = {
  id: string;
  title: string;
  description: string;
  price: string;
  finish: () => void;
  verify: () => Promise<{ finish: () => void }>;
};

type StorePlugin = {
  register: (product: { id: string; type: string }) => void;
  when: (id: string) => {
    approved: (cb: (product: StoreProduct) => void) => ReturnType<StorePlugin["when"]>;
    verified: (cb: (product: StoreProduct) => void) => ReturnType<StorePlugin["when"]>;
    error: (cb: (err: any) => void) => ReturnType<StorePlugin["when"]>;
    updated: (cb: (product: IAPProduct) => void) => ReturnType<StorePlugin["when"]>;
  };
  refresh: () => void;
  order: (id: string) => Promise<void>;
  PAID_SUBSCRIPTION: string;
  CONSUMABLE: string;
  validator: string;
};

const getStore = (): StorePlugin | null => {
  if (typeof window !== "undefined" && (window as any).CdvPurchase?.store) {
    return (window as any).CdvPurchase.store;
  }
  return null;
};

export const useIsIOSApp = (): boolean => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if running as a native iOS app via Capacitor
    const native = isNativeApp();
    const iosDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIOS(native && iosDevice);
  }, []);

  return isIOS;
};

export const useIAP = () => {
  const isIOS = useIsIOSApp();
  const [products, setProducts] = useState<Record<string, IAPProduct>>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Initialize the store and register products
  useEffect(() => {
    if (!isIOS) return;

    const store = getStore();
    if (!store) {
      console.warn("[IAP] Store plugin not available");
      return;
    }

    // Set the server-side receipt validator URL
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    store.validator = `${supabaseUrl}/functions/v1/verify-apple-receipt`;

    // Register subscription products
    Object.values(IAP_PRODUCTS.subscriptions).forEach((id) => {
      store.register({ id, type: store.PAID_SUBSCRIPTION });
    });

    // Register consumable (top-up) products
    Object.values(IAP_PRODUCTS.topups).forEach((id) => {
      store.register({ id, type: store.CONSUMABLE });
    });

    // Set up listeners for all products
    const allIds = [
      ...Object.values(IAP_PRODUCTS.subscriptions),
      ...Object.values(IAP_PRODUCTS.topups),
    ];

    allIds.forEach((id) => {
      store
        .when(id)
        .updated((product: IAPProduct) => {
          setProducts((prev) => ({
            ...prev,
            [product.id]: {
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price,
              loaded: true,
            },
          }));
        })
        .approved(async (product: StoreProduct) => {
          // Send receipt to our server for verification
          try {
            const receipt = await product.verify();
            receipt.finish();
          } catch (err) {
            console.error("[IAP] Verification failed:", err);
          }
        })
        .verified((product: StoreProduct) => {
          product.finish();
          setPurchasing(null);
        })
        .error((err: any) => {
          console.error("[IAP] Error for", id, err);
          setPurchasing(null);
        });
    });

    store.refresh();
    setReady(true);
  }, [isIOS]);

  const purchase = useCallback(
    async (productId: string) => {
      const store = getStore();
      if (!store) {
        throw new Error("Store not available");
      }

      setPurchasing(productId);
      try {
        await store.order(productId);
      } catch (err) {
        setPurchasing(null);
        throw err;
      }
    },
    []
  );

  const [restoring, setRestoring] = useState(false);

  const restorePurchases = useCallback(async () => {
    const store = getStore();
    if (!store) {
      throw new Error("Store not available");
    }
    setRestoring(true);
    try {
      store.refresh();
    } catch (err) {
      setRestoring(false);
      throw err;
    }
    // refresh triggers approved/verified callbacks for owned products
    // give it a few seconds then stop the spinner
    setTimeout(() => setRestoring(false), 5000);
  }, []);

  return { isIOS, ready, products, purchasing, purchase, restoring, restorePurchases };
};
