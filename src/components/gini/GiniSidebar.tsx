import { MessageSquare, Map, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type GiniView = "chat" | "pathway" | "simulator";

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
];

export default function GiniSidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: Props) {
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
    </motion.aside>
  );
}
