import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function TrainGeniusPrompt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Check if AI profile is already trained
    (async () => {
      const { data } = await supabase
        .from("ai_profiles")
        .select("trained_at")
        .eq("user_id", user.id)
        .single();
      
      // Show prompt if no profile or not trained, and user hasn't dismissed this session
      const dismissed = sessionStorage.getItem("genius_prompt_dismissed");
      if (!dismissed && (!data || !data.trained_at)) {
        setShow(true);
      }
    })();
  }, [user]);

  const handleDismiss = () => {
    sessionStorage.setItem("genius_prompt_dismissed", "true");
    setShow(false);
  };

  const handleTrain = () => {
    sessionStorage.setItem("genius_prompt_dismissed", "true");
    setShow(false);
    navigate("/gini");
  };

  return (
    <Dialog open={show} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="font-display text-xl flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Train Your AI Genius
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mt-2">
          Get personalized guidance by training your AI Genius. It only takes a few minutes and unlocks tailored scholarships, pathways, and opportunities just for you.
        </p>
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handleTrain}
            className="w-full py-3 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.01]"
          >
            Train Now
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
