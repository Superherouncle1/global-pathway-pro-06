import { motion } from "framer-motion";
import { Bookmark, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

export default function SavedBookmarks() {
  const { bookmarks, loading, removeBookmark } = useBookmarks();

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
      <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
        <Bookmark className="w-5 h-5 text-primary" /> Saved Items
      </h2>

      {bookmarks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No saved items yet. Bookmark opportunities, pathways, and resources to find them here.
        </p>
      ) : (
        <div className="space-y-2">
          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {b.title}
                </p>
                {b.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {b.description}
                  </p>
                )}
                <span className="text-xs text-muted-foreground capitalize">
                  {b.item_type}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                {b.url && (
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => removeBookmark(b.id)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
