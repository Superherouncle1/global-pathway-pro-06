import { Link } from "react-router-dom";
import { Globe, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReferral } from "@/hooks/use-referral";
import { useAuth } from "@/contexts/AuthContext";

const Footer = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getReferralUrl, referralCount } = useReferral();

  const handleShare = async () => {
    const url = user ? getReferralUrl() : window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GlobalGenie — Study Abroad Companion",
          text: "Check out GlobalGenie — your all-in-one guide to studying abroad! Free modules, global community, and expert support.",
          url,
        });
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied!", description: "Share it with your friends 🎉" });
    } catch {
      toast({ title: "Couldn't copy link", description: "Please copy this URL manually: " + url, variant: "destructive" });
    }
  };

  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-bold">GlobalGenie</span>
            </div>
            <p className="text-sm opacity-70 max-w-sm">
              Empowering students to achieve their study abroad dreams with expert guidance, resources, and a global community.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider opacity-50">Explore</h4>
            <div className="flex flex-col gap-2">
              <Link to="/resources" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Resource Hub</Link>
              <Link to="/community" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Community</Link>
              <Link to="/your-space" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Your Space</Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-3 text-sm uppercase tracking-wider opacity-50">Company</h4>
            <div className="flex flex-col gap-2">
              <Link to="/about" className="text-sm opacity-70 hover:opacity-100 transition-opacity">About Us</Link>
              <Link to="/about#faq" className="text-sm opacity-70 hover:opacity-100 transition-opacity">FAQ</Link>
              <Link to="/privacy" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Privacy Policy</Link>
              <Link to="/about#terms" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Terms of Use</Link>
              <a href="mailto:abraham.loorig@imageofafrica.org" className="text-sm opacity-70 hover:opacity-100 transition-opacity">Contact Us</a>
            </div>
          </div>
        </div>

        {/* Share CTA */}
        <div className="mt-10 pt-6 border-t border-primary-foreground/10 flex flex-col items-center gap-4">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "linear-gradient(135deg, #FFD700, #FFA500)", color: "#1a1a1a" }}
          >
            <Share2 className="w-4 h-4" />
            Share Horizn with a Friend
          </button>
          {user && referralCount > 0 && (
            <p className="text-xs opacity-60">
              🎉 {referralCount} friend{referralCount !== 1 ? "s" : ""} joined via your link
              {referralCount % 5 === 0 ? " — you earned 20 bonus credits!" : ` — ${5 - (referralCount % 5)} more to earn 20 credits!`}
            </p>
          )}

          <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs opacity-50">© {new Date().getFullYear()} Horizn by Global Study Hub. All rights reserved.</p>
            <p className="text-xs opacity-50 flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-accent" /> for students worldwide
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
