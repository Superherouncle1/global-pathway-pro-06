import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Bookmark {
  id: string;
  user_id: string;
  item_type: string;
  reference_id: string | null;
  title: string;
  description: string | null;
  url: string | null;
  created_at: string;
}

export function useBookmarks() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("saved_bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setBookmarks(data as Bookmark[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const isBookmarked = useCallback(
    (itemType: string, referenceId: string) => {
      return bookmarks.some(
        (b) => b.item_type === itemType && b.reference_id === referenceId
      );
    },
    [bookmarks]
  );

  const toggleBookmark = useCallback(
    async (params: {
      itemType: string;
      referenceId: string;
      title: string;
      description?: string;
      url?: string;
    }) => {
      if (!user) return;
      const existing = bookmarks.find(
        (b) =>
          b.item_type === params.itemType &&
          b.reference_id === params.referenceId
      );
      if (existing) {
        setBookmarks((prev) => prev.filter((b) => b.id !== existing.id));
        await supabase.from("saved_bookmarks").delete().eq("id", existing.id);
        toast({ title: "Bookmark removed" });
      } else {
        const { data, error } = await supabase
          .from("saved_bookmarks")
          .insert({
            user_id: user.id,
            item_type: params.itemType,
            reference_id: params.referenceId,
            title: params.title,
            description: params.description || null,
            url: params.url || null,
          })
          .select()
          .single();
        if (data) {
          setBookmarks((prev) => [data as Bookmark, ...prev]);
          toast({ title: "Saved to bookmarks!" });
        }
        if (error) {
          toast({ title: "Failed to save", variant: "destructive" });
        }
      }
    },
    [user, bookmarks, toast]
  );

  const removeBookmark = useCallback(
    async (id: string) => {
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      await supabase.from("saved_bookmarks").delete().eq("id", id);
      toast({ title: "Bookmark removed" });
    },
    [toast]
  );

  return { bookmarks, loading, isBookmarked, toggleBookmark, removeBookmark, refetch: loadBookmarks };
}
