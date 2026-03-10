import { MessageSquare, Map, Zap, Award, ChevronLeft, ChevronRight, Coins, Infinity, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export type GiniView = "chat" | "pathway" | "simulator" | "scholarships";

interface Props {
  activeView: GiniView;
  onViewChange: (view: GiniView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const items = [
  { id: "chat" as const, label: "Chat with GINIE", icon: MessageSquare },
  { id: "pathway" as const, label: "Pathway Map", icon: Map },
  { id: "simulator" as const, label: "Simulator", icon: Zap },
  { id: "scholarships" as const, label: "Scholarships", icon: Award },
];

export default function GiniSidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: Props) {
  const { user } = useAuth();
  const { isSuperAdmin } = useAdmin();
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCredits = async () => {
      const { data } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .single();
      if (data) setCredits(data.credits);
    };
    fetchCredits();

    const channel = supabase
      .channel("sidebar-credits")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_credits", filter: `user_id=eq.${user.id}` },
        (payload: any) => {
          if (payload.new?.credits !== undefined) setCredits(payload.new.credits);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 56 : 220 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full border-r border-border bg-sidebar flex flex-col flex-shrink-0"
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between border-b border-border">
        {!collapsed && (
          <span className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wider truncate">
            GINIE Tools
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md hover:bg-sidebar-accent text-sidebar-foreground transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-2 space-y-1">
        {items.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={cn("w-4.5 h-4.5 flex-shrink-0", isActive && "text-sidebar-primary")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Credits Badge */}
      {(isSuperAdmin || credits !== null) && (
        <div className="p-3 border-t border-border">
          <div
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 bg-sidebar-accent/50",
              collapsed && "justify-center px-0"
            )}
            title={collapsed ? (isSuperAdmin ? "Unlimited credits" : `${credits} credits remaining`) : undefined}
          >
            {isSuperAdmin ? (
              <Infinity className="w-4 h-4 text-primary flex-shrink-0" />
            ) : (
              <Coins className="w-4 h-4 text-primary flex-shrink-0" />
            )}
            {!collapsed && (
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="text-xs text-sidebar-foreground truncate">Credits</span>
                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                  {isSuperAdmin ? "∞" : credits}
                </Badge>
              </div>
            )}
            {collapsed && (
              <Badge variant="default" className="text-[10px] px-1.5 py-0 absolute-none">
                {isSuperAdmin ? "∞" : credits}
              </Badge>
            )}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
