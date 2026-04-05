import { Bell, BellOff, BellRing } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";

export default function NotificationSettings() {
  const {
    permissionStatus,
    preferences,
    requestPermission,
    updatePreferences,
  } = usePushNotifications();

  const isGranted = permissionStatus === "granted";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-card"
    >
      <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        <BellRing className="w-5 h-5 text-primary" /> Notifications
      </h2>

      {!isGranted ? (
        <div className="text-center py-4">
          <BellOff className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">
            Enable notifications to get deadline reminders and new opportunity alerts.
          </p>
          <button
            onClick={requestPermission}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Bell className="w-4 h-4 inline mr-1.5" />
            Enable Notifications
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Deadline Reminders</p>
              <p className="text-xs text-muted-foreground">Get notified 24h before due dates</p>
            </div>
            <Switch
              checked={preferences.deadlines}
              onCheckedChange={(checked) => updatePreferences({ deadlines: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Opportunity Alerts</p>
              <p className="text-xs text-muted-foreground">New opportunities matching your profile</p>
            </div>
            <Switch
              checked={preferences.opportunities}
              onCheckedChange={(checked) => updatePreferences({ opportunities: checked })}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center pt-2">
            ✅ Notifications are enabled
          </p>
        </div>
      )}
    </motion.div>
  );
}
