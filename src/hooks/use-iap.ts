import { useState, useEffect, useCallback, useRef } from "react";
import { isNativeApp } from "@/hooks/use-native";

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

let pendingStorePromise: Promise<StorePlugin | null> | null = null;

const waitForStore = (timeoutMs = 8000): Promise<StorePlugin | null> => {
  const existingStore = getStore();
  if (existingStore) return Promise.resolve(existingStore);
  if (typeof window === "undefined") return Promise.resolve(null);
  if (pendingStorePromise) return pendingStorePromise;

  pendingStorePromise = new Promise<StorePlugin | null>((resolve) => {
    const deadline = Date.now() + timeoutMs;
    let timeoutId: number | null = null;

    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      document.removeEventListener("deviceready", checkForStore);
      window.removeEventListener("focus", checkForStore);
      window.removeEventListener("pageshow", checkForStore);
    };

    const checkForStore = () => {
      const store = getStore();
      if (store) {
        cleanup();
        resolve(store);
        return;
      }

      if (Date.now() >= deadline) {
        cleanup();
        resolve(null);
        return;
      }

      timeoutId = window.setTimeout(checkForStore, 250);
    };

    document.addEventListener("deviceready", checkForStore);
    window.addEventListener("focus", checkForStore);
    window.addEventListener("pageshow", checkForStore);
    checkForStore();
  }).finally(() => {
    pendingStorePromise = null;
  });

  return pendingStorePromise;
};

export const useIsIOSApp = (): boolean => {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
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
  const [restoring, setRestoring] = useState(false);
  const registeredProducts = useRef<Set<string>>(new Set());
  const boundListeners = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isIOS) {
      setReady(false);
      return;
    }

    let cancelled = false;

    const initializeStore = async () => {
      setReady(false);
      const store = await waitForStore();

      if (!store || cancelled) {
        if (!cancelled) {
          console.warn("[IAP] Store plugin not available after waiting for initialization");
        }
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        store.validator = `${supabaseUrl}/functions/v1/verify-apple-receipt`;
      }

      const productDefinitions = [
        ...Object.values(IAP_PRODUCTS.subscriptions).map((id) => ({ id, type: store.PAID_SUBSCRIPTION })),
        ...Object.values(IAP_PRODUCTS.topups).map((id) => ({ id, type: store.CONSUMABLE })),
      ];

      productDefinitions.forEach(({ id, type }) => {
        if (registeredProducts.current.has(id)) return;
        store.register({ id, type });
        registeredProducts.current.add(id);
      });

      const allIds = [
        ...Object.values(IAP_PRODUCTS.subscriptions),
        ...Object.values(IAP_PRODUCTS.topups),
      ];

      allIds.forEach((id) => {
        if (boundListeners.current.has(id)) return;

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
            try {
              const receipt = await product.verify();
              receipt.finish();
            } catch (err) {
              console.error("[IAP] Verification failed:", err);
              setPurchasing(null);
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

        boundListeners.current.add(id);
      });

      try {
        store.refresh();
        if (!cancelled) setReady(true);
      } catch (err) {
        console.error("[IAP] Failed to refresh store", err);
        if (!cancelled) setReady(false);
      }
    };

    initializeStore();

    return () => {
      cancelled = true;
    };
  }, [isIOS]);

  const purchase = useCallback(async (productId: string) => {
    const store = await waitForStore();
    if (!store) {
      throw new Error("App Store purchases are still initializing. Please wait a few seconds and try again.");
    }

    setPurchasing(productId);
    try {
      store.refresh();
      await store.order(productId);
    } catch (err) {
      setPurchasing(null);
      throw err;
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    const store = await waitForStore();
    if (!store) {
      throw new Error("App Store purchases are still initializing. Please wait a few seconds and try again.");
    }

    setRestoring(true);
    try {
      store.refresh();
    } catch (err) {
      setRestoring(false);
      throw err;
    }

    window.setTimeout(() => setRestoring(false), 5000);
  }, []);

  return { isIOS, ready, products, purchasing, purchase, restoring, restorePurchases };
};
