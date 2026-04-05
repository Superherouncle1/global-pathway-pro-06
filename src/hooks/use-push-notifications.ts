import { useEffect, useCallback, useState } from "react";
import { isNativeApp } from "@/hooks/use-native";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type PushNotificationsPlugin = {
  requestPermissions: () => Promise<{ receive: string }>;
  register: () => Promise<void>;
  addListener: (event: string, callback: (data: any) => void) => Promise<{ remove: () => void }>;
  checkPermissions: () => Promise<{ receive: string }>;
};

const getPushPlugin = (): PushNotificationsPlugin | undefined => {
  if (typeof window === "undefined") return undefined;
  return (window as any).Capacitor?.Plugins?.PushNotifications;
};

export interface NotificationPreferences {
  deadlines: boolean;
  opportunities: boolean;
}

const PREFS_KEY = "push_notification_prefs";

export function usePushNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [permissionStatus, setPermissionStatus] = useState<string>("prompt");
  const [token, setToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    try {
      const stored = localStorage.getItem(PREFS_KEY);
      return stored ? JSON.parse(stored) : { deadlines: true, opportunities: true };
    } catch {
      return { deadlines: true, opportunities: true };
    }
  });

  const isAvailable = isNativeApp() && !!getPushPlugin();

  const checkPermissions = useCallback(async () => {
    const push = getPushPlugin();
    if (!push) return;
    try {
      const result = await push.checkPermissions();
      setPermissionStatus(result.receive);
    } catch {
      // Not available
    }
  }, []);

  const requestPermission = useCallback(async () => {
    const push = getPushPlugin();
    if (!push) {
      // Web fallback: request Notification API permission
      if ("Notification" in window) {
        const result = await Notification.requestPermission();
        setPermissionStatus(result === "granted" ? "granted" : "denied");
        if (result === "granted") {
          toast({ title: "Notifications enabled", description: "You'll receive deadline reminders and opportunity alerts." });
        }
        return result === "granted";
      }
      return false;
    }

    try {
      const result = await push.requestPermissions();
      setPermissionStatus(result.receive);
      if (result.receive === "granted") {
        await push.register();
        toast({ title: "Notifications enabled", description: "You'll receive deadline reminders and opportunity alerts." });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [toast]);

  const updatePreferences = useCallback((newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...newPrefs };
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Set up native listeners
  useEffect(() => {
    const push = getPushPlugin();
    if (!push || !user) return;

    const listeners: Array<{ remove: () => void }> = [];

    const setup = async () => {
      // Registration success
      const reg = await push.addListener("registration", (data: { value: string }) => {
        setToken(data.value);
        // Store token for server-side push later
        console.log("[Push] Token registered:", data.value.substring(0, 20) + "...");
      });
      listeners.push(reg);

      // Registration error
      const err = await push.addListener("registrationError", (error: any) => {
        console.warn("[Push] Registration error:", error);
      });
      listeners.push(err);

      // Notification received while app is in foreground
      const received = await push.addListener("pushNotificationReceived", (notification: any) => {
        toast({
          title: notification.title || "New Notification",
          description: notification.body || "",
        });
      });
      listeners.push(received);

      // Notification action (tap)
      const action = await push.addListener("pushNotificationActionPerformed", (data: any) => {
        const deepLink = data?.notification?.data?.url;
        if (deepLink) {
          window.location.href = deepLink;
        }
      });
      listeners.push(action);

      await checkPermissions();
    };

    setup();

    return () => {
      listeners.forEach(l => l.remove());
    };
  }, [user, checkPermissions, toast]);

  // Schedule local deadline reminders using the Web Notifications API as a fallback
  const scheduleDeadlineReminder = useCallback((title: string, dueDate: string) => {
    if (!preferences.deadlines) return;

    const due = new Date(dueDate);
    const reminderTime = due.getTime() - 24 * 60 * 60 * 1000; // 24h before
    const now = Date.now();

    if (reminderTime > now) {
      const delay = reminderTime - now;
      setTimeout(() => {
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Deadline Reminder 🔔", {
            body: `"${title}" is due tomorrow!`,
            icon: "/favicon.ico",
          });
        }
      }, delay);
    }
  }, [preferences.deadlines]);

  return {
    isAvailable,
    permissionStatus,
    token,
    preferences,
    requestPermission,
    updatePreferences,
    scheduleDeadlineReminder,
  };
}
