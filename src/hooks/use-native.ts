import { useCallback, useEffect, useState } from "react";

// Platform detection
export const isNativeApp = (): boolean => {
  return (
    (window as any).Capacitor !== undefined ||
    document.URL.startsWith("capacitor://") ||
    document.URL.startsWith("ionic://")
  );
};

// Haptic feedback using Vibration API (works on most mobile browsers and Capacitor)
export const hapticFeedback = (style: "light" | "medium" | "heavy" = "light") => {
  try {
    if ((window as any).Capacitor?.Plugins?.Haptics) {
      const impactStyle = style === "light" ? "LIGHT" : style === "medium" ? "MEDIUM" : "HEAVY";
      (window as any).Capacitor.Plugins.Haptics.impact({ style: impactStyle });
    } else if (navigator.vibrate) {
      const duration = style === "light" ? 10 : style === "medium" ? 20 : 40;
      navigator.vibrate(duration);
    }
  } catch {
    // Silently fail — haptics not available
  }
};

export const hapticNotification = (type: "success" | "warning" | "error" = "success") => {
  try {
    if ((window as any).Capacitor?.Plugins?.Haptics) {
      (window as any).Capacitor.Plugins.Haptics.notification({ type: type.toUpperCase() });
    } else if (navigator.vibrate) {
      const pattern = type === "success" ? [10, 50, 10] : type === "warning" ? [20, 40, 20] : [40, 30, 40, 30, 40];
      navigator.vibrate(pattern);
    }
  } catch {
    // Silently fail
  }
};

// Native share
export const nativeShare = async (data: { title?: string; text?: string; url?: string }) => {
  try {
    if ((window as any).Capacitor?.Plugins?.Share) {
      await (window as any).Capacitor.Plugins.Share.share(data);
      return true;
    } else if (navigator.share) {
      await navigator.share(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const canShare = (): boolean => {
  return !!(navigator.share || (window as any).Capacitor?.Plugins?.Share);
};

// Online/Offline status hook
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

// Pull-to-refresh hook
export const usePullToRefresh = (onRefresh: () => Promise<void> | void) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    hapticFeedback("medium");
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh, refreshing]);

  return { refreshing, handleRefresh };
};
