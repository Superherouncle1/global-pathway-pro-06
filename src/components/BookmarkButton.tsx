import { Bookmark, BookmarkCheck } from "lucide-react";
import { useBookmarks } from "@/hooks/use-bookmarks";

interface Props {
  itemType: string;
  referenceId: string;
  title: string;
  description?: string;
  url?: string;
  size?: "sm" | "md";
}

export default function BookmarkButton({ itemType, referenceId, title, description, url, size = "sm" }: Props) {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const saved = isBookmarked(itemType, referenceId);
  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ itemType, referenceId, title, description, url });
      }}
      className={`p-1.5 rounded-lg transition-colors ${
        saved
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5"
      }`}
      title={saved ? "Remove bookmark" : "Save bookmark"}
    >
      {saved ? (
        <BookmarkCheck className={iconSize} />
      ) : (
        <Bookmark className={iconSize} />
      )}
    </button>
  );
}
