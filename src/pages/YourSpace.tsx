import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { hapticNotification } from "@/hooks/use-native";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Save, Check, Loader2, BookOpen, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import AvatarUpload from "@/components/yourspace/AvatarUpload";
import ProfileForm, { type ProfileData, type ProfileErrors } from "@/components/yourspace/ProfileForm";
import LanguageSelector from "@/components/yourspace/LanguageSelector";
import PersonalAIGenius from "@/components/yourspace/PersonalAIGenius";
import PathwayTracker from "@/components/PathwayTracker";
import SavedBookmarks from "@/components/SavedBookmarks";
import NotificationSettings from "@/components/NotificationSettings";

const YourSpace = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    name: "", email: "", phone: "", country: "",
    field_of_study: "", bio: "", preferred_language: "English", avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setProfile({
        name: data.name || "", email: data.email || "", phone: data.phone || "",
        country: data.country || "", field_of_study: data.field_of_study || "",
        bio: data.bio || "", preferred_language: data.preferred_language || "English",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoadingProfile(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: profile.name, email: profile.email, phone: profile.phone,
      country: profile.country, field_of_study: profile.field_of_study,
      bio: profile.bio, preferred_language: profile.preferred_language,
    }).eq("id", user.id);

    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      setSaved(true);
      hapticNotification("success");
      toast({ title: "Profile saved!" });
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <BackButton />
        </div>
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <User className="w-4 h-4" /> Your Profile
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">My Space</h1>
            <p className="text-muted-foreground">Set up your profile and customize your experience.</p>
          </motion.div>

          {/* Profile Card */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mb-6">
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">Your Profile</h2>
            <AvatarUpload userId={user!.id} avatarUrl={profile.avatar_url}
              onAvatarChange={(url) => setProfile((p) => ({ ...p, avatar_url: url }))} />
            <ProfileForm profile={profile} onChange={setProfile} />
          </motion.div>

          {/* Pathway Tracker */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <PathwayTracker />
          </motion.div>

          {/* Saved Bookmarks */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
            <SavedBookmarks />
          </motion.div>

          {/* Notification Settings */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-6">
            <NotificationSettings />
          </motion.div>

          {/* Personal AI Genius */}
          <div className="mt-6"><PersonalAIGenius /></div>

          {/* Resource Hub Link */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Link to="/resources"
              className="group block bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card hover:shadow-hover transition-all hover:-translate-y-0.5 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-hero flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="font-display text-lg font-semibold text-foreground">Resource Hub</h2>
                    <p className="text-sm text-muted-foreground">9 expert modules — scholarships, visas, career prep & more</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </motion.div>

          {/* Language Choice */}
          <LanguageSelector selected={profile.preferred_language}
            onSelect={(lang) => setProfile((p) => ({ ...p, preferred_language: lang }))} />

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <button onClick={handleSave} disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.01] disabled:opacity-60">
              {saving ? (<><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>)
                : saved ? (<><Check className="w-5 h-5" /> Saved!</>)
                : (<><Save className="w-5 h-5" /> Save Profile</>)}
            </button>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default YourSpace;
