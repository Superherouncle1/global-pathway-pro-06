import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";

interface ActivityEntry {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  details: string | null;
  created_at: string;
  admin_profile?: { name: string | null; email: string | null } | null;
  target_profile?: { name: string | null; email: string | null } | null;
}

interface ActivityLogProps {
  entries: ActivityEntry[];
}

const actionLabels: Record<string, { label: string; color: string }> = {
  ban: { label: "Banned User", color: "bg-destructive/15 text-destructive" },
  unban: { label: "Unbanned User", color: "bg-green-500/15 text-green-600" },
  role_change: { label: "Role Changed", color: "bg-primary/15 text-primary" },
  delete_message: { label: "Deleted Message", color: "bg-orange-500/15 text-orange-600" },
  delete_submission: { label: "Deleted Submission", color: "bg-orange-500/15 text-orange-600" },
};

const ActivityLog = ({ entries }: ActivityLogProps) => {
  if (entries.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
        <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>No admin activity logged yet.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {entries.map((entry) => {
        const actionInfo = actionLabels[entry.action_type] || {
          label: entry.action_type,
          color: "bg-muted text-muted-foreground",
        };

        return (
          <div
            key={entry.id}
            className="bg-card rounded-xl border border-border p-4 flex items-start gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${actionInfo.color}`}>
                  {actionInfo.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  by {entry.admin_profile?.name || entry.admin_profile?.email || "Unknown"}
                </span>
                {entry.target_profile && (
                  <span className="text-xs text-muted-foreground">
                    → {entry.target_profile.name || entry.target_profile.email || "Unknown"}
                  </span>
                )}
              </div>
              {entry.details && (
                <p className="text-sm text-muted-foreground">{entry.details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {new Date(entry.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};

export default ActivityLog;
