import { MessageSquare, Map, Zap, Award, Shield, ChevronLeft, ChevronRight, Coins, Infinity, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/use-admin";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export type GiniView = "chat" | "pathway" | "simulator" | "scholarships" | "gtv-assessment";

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
  { id: "gtv-assessment" as const, label: "GTV Assessment", icon: Shield },
];

export default function GiniSidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: Props) {
  const { user } = useAuth();
  const { isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<number | null>(null);
  const showTopUp = !isSuperAdmin && credits !== null && credits <= 10;

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

    // Poll credits every 30 seconds instead of realtime (realtime removed for security)
    const interval = setInterval(fetchCredits, 30000);

    return () => { clearInterval(interval); };
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
        <div className="p-3 border-t border-border space-y-2">
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
                <Badge
                  variant={!isSuperAdmin && credits !== null && credits <= 10 ? "destructive" : "default"}
                  className="text-[10px] px-1.5 py-0"
                >
                  {isSuperAdmin ? "∞" : credits}
                </Badge>
              </div>
            )}
            {collapsed && (
              <Badge
                variant={!isSuperAdmin && credits !== null && credits <= 10 ? "destructive" : "default"}
                className="text-[10px] px-1.5 py-0 absolute-none"
              >
                {isSuperAdmin ? "∞" : credits}
              </Badge>
            )}
          </div>

          {/* Top-up button when credits are low */}
          {showTopUp && (
            <button
              onClick={() => navigate("/pricing")}
              className={cn(
                "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? "Top up credits" : undefined}
            >
              <Plus className="w-3.5 h-3.5 flex-shrink-0" />
              {!collapsed && <span>Top up credits</span>}
            </button>
          )}
        </div>
      )}
    </motion.aside>
  );
}
