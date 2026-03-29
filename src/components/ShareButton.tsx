import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canShare, nativeShare, hapticFeedback } from "@/hooks/use-native";
import { toast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const ShareButton = ({ title, text, url, variant = "outline", size = "sm", className }: ShareButtonProps) => {
  if (!canShare()) return null;

  const handleShare = async () => {
    hapticFeedback("light");
    const shared = await nativeShare({
      title,
      text,
      url: url || window.location.href,
    });
    if (!shared) {
      toast({ title: "Couldn't share", description: "Sharing is not supported on this device.", variant: "destructive" });
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleShare} className={className}>
      <Share2 className="w-4 h-4 mr-1.5" />
      Share
    </Button>
  );
};

export default ShareButton;
