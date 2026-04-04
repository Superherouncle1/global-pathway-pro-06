import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, Circle, Plus, Trash2, Calendar, FileText, Send,
  FolderOpen, MoreHorizontal, Loader2, ChevronDown, ChevronUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TrackerItem {
  id: string;
  user_id: string;
  title: string;
  category: string;
  is_completed: boolean;
  due_date: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
}

const CATEGORIES = [
  { value: "application", label: "Applications", icon: Send, color: "text-primary" },
  { value: "document", label: "Documents", icon: FileText, color: "text-accent" },
  { value: "deadline", label: "Deadlines", icon: Calendar, color: "text-destructive" },
  { value: "other", label: "Other", icon: FolderOpen, color: "text-muted-foreground" },
];

export default function PathwayTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<TrackerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("application");
  const [newDueDate, setNewDueDate] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const loadItems = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("pathway_tracker_items")
      .select("*")
      .eq("user_id", user.id)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setItems(data as TrackerItem[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const addItem = async () => {
    if (!user || !newTitle.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("pathway_tracker_items").insert({
      user_id: user.id,
      title: newTitle.trim(),
      category: newCategory,
      due_date: newDueDate || null,
      sort_order: items.length,
    });
    if (error) {
      toast({ title: "Failed to add item", variant: "destructive" });
    } else {
      setNewTitle("");
      setNewDueDate("");
      setShowAddForm(false);
      await loadItems();
    }
    setAdding(false);
  };

  const toggleItem = async (item: TrackerItem) => {
    if (!user) return;
    const updated = !item.is_completed;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_completed: updated } : i))
    );
    await supabase
      .from("pathway_tracker_items")
      .update({ is_completed: updated })
      .eq("id", item.id);
  };

  const deleteItem = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from("pathway_tracker_items").delete().eq("id", id);
  };

  const totalItems = items.length;
  const completedItems = items.filter((i) => i.is_completed).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const groupedByCategory = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length > 0);

  const formatDueDate = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d + "T00:00:00");
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (diffDays < 0) return { text: `Overdue · ${formatted}`, urgent: true };
    if (diffDays === 0) return { text: `Today · ${formatted}`, urgent: true };
    if (diffDays <= 7) return { text: `${diffDays}d left · ${formatted}`, urgent: true };
    return { text: formatted, urgent: false };
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-card">
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-card"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between mb-4"
      >
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            📋 My Global Pathway Plan
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalItems === 0
              ? "Start tracking your study abroad checklist"
              : `${completedItems} of ${totalItems} completed`}
          </p>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress</span>
          <span className="font-semibold text-primary">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2.5" />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            {/* Grouped items */}
            {groupedByCategory.length > 0 ? (
              <div className="space-y-4 mb-4">
                {groupedByCategory.map((group) => {
                  const Icon = group.icon;
                  return (
                    <div key={group.value}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-4 h-4 ${group.color}`} />
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {group.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({group.items.filter((i) => i.is_completed).length}/{group.items.length})
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        {group.items.map((item) => {
                          const due = formatDueDate(item.due_date);
                          return (
                            <motion.div
                              key={item.id}
                              layout
                              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                item.is_completed
                                  ? "bg-muted/30 border-border/50"
                                  : "bg-muted/50 border-border hover:border-primary/30"
                              }`}
                            >
                              <button onClick={() => toggleItem(item)} className="flex-shrink-0">
                                {item.is_completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                                )}
                              </button>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm font-medium ${
                                    item.is_completed
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground"
                                  }`}
                                >
                                  {item.title}
                                </p>
                                {due && (
                                  <p
                                    className={`text-xs mt-0.5 flex items-center gap-1 ${
                                      due.urgent && !item.is_completed
                                        ? "text-destructive font-medium"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    <Calendar className="w-3 h-3" />
                                    {due.text}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="flex-shrink-0 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p>No items yet. Add your first checklist item below!</p>
              </div>
            )}

            {/* Add item form */}
            {showAddForm ? (
              <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Submit IELTS score report"
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && addItem()}
                />
                <div className="flex gap-2">
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm text-foreground"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="flex-1 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={addItem}
                    disabled={adding || !newTitle.trim()}
                    size="sm"
                    className="gradient-hero text-primary-foreground"
                  >
                    {adding ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                    Add
                  </Button>
                  <Button
                    onClick={() => setShowAddForm(false)}
                    variant="ghost"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Checklist Item
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
