import { useState, useEffect, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { hapticFeedback, hapticNotification } from "@/hooks/use-native";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Globe, Save, Check, MapPin, BookOpen, FileText, Loader2, ImagePlus, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";
import PersonalAIGenius from "@/components/yourspace/PersonalAIGenius";
import PathwayTracker from "@/components/PathwayTracker";
import SavedBookmarks from "@/components/SavedBookmarks";

const languages = [
  "English", "Français", "Español", "Deutsch", "العربية",
  "中文", "Português", "हिन्दी", "日本語", "한국어",
  "Italiano", "Русский", "Türkçe", "Kiswahili",
];

const allowedAvatarTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

const YourSpace = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    field_of_study: "",
    bio: "",
    preferred_language: "English",
    avatar_url: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth is handled by AuthGate wrapper

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        country: data.country || "",
        field_of_study: data.field_of_study || "",
        bio: data.bio || "",
        preferred_language: data.preferred_language || "English",
        avatar_url: data.avatar_url || "",
      });
    }
    setLoadingProfile(false);
  };

  const uploadAvatarFile = async (file: File) => {
    if (!user) return;

    if (!allowedAvatarTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPEG, PNG, WebP, GIF, HEIC, or HEIF image.", variant: "destructive" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = (file.name.split(".").pop() || file.type.split("/").pop() || "jpg").toLowerCase();
      const normalizedExt = fileExt === "jpeg" ? "jpg" : fileExt;
      const filePath = `${user.id}/avatar.${normalizedExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user.id);

      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      toast({ title: "Something went wrong", description: "Could not upload photo. Please try again.", variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAvatarFile(file);
  };

  const handleAvatarButtonClick = () => {
    if (uploadingAvatar) return;
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!user) return;
    hapticFeedback("medium");
    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        country: profile.country,
        field_of_study: profile.field_of_study,
        bio: profile.bio,
        preferred_language: profile.preferred_language,
      })
      .eq("id", user.id);

    setSaving(false);
    if (!error) {
      hapticNotification("success");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
              <User className="w-4 h-4" />
              Your Profile
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              My Space
            </h1>
            <p className="text-muted-foreground">
              Set up your profile and customize your experience.
            </p>
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mb-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-6">Your Profile</h2>

            {/* Avatar Upload */}
            <div className="flex justify-center mb-8">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-border bg-muted flex items-center justify-center">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full gradient-hero flex items-center justify-center text-primary-foreground shadow-soft hover:shadow-hover transition-all hover:scale-110 disabled:opacity-60"
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImagePlus className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" /> Full Name
                </label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Enter your full name" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                </label>
                <input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" /> Contact Number
                </label>
                <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> Country
                </label>
                <input type="text" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} placeholder="e.g. Nigeria, India, Brazil" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" /> Field of Study
                </label>
                <input type="text" value={profile.field_of_study} onChange={(e) => setProfile({ ...profile, field_of_study: e.target.value })} placeholder="e.g. Computer Science, Medicine" className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" /> Bio
                </label>
                <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell the community about yourself..." rows={3} className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none" />
              </div>
            </div>
          </motion.div>

          {/* Pathway Tracker */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <PathwayTracker />
          </motion.div>

          {/* Saved Bookmarks */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6">
            <SavedBookmarks />
          </motion.div>

          {/* Personal AI Genius */}
          <div className="mt-6">
            <PersonalAIGenius />
          </div>

          {/* Resource Hub Link */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Link
              to="/resources"
              className="group block bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card hover:shadow-hover transition-all hover:-translate-y-0.5 mb-6"
            >
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
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-card mb-6"
          >
            <h2 className="font-display text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> Language Choice
            </h2>
            <p className="text-sm text-muted-foreground mb-5">Choose your preferred language for the app experience.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setProfile({ ...profile, preferred_language: lang })}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    profile.preferred_language === lang
                      ? "gradient-hero text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-xl gradient-hero text-primary-foreground font-semibold shadow-soft hover:shadow-hover transition-all hover:scale-[1.01] disabled:opacity-60"
            >
              {saving ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</>
              ) : saved ? (
                <><Check className="w-5 h-5" /> Saved!</>
              ) : (
                <><Save className="w-5 h-5" /> Save Profile</>
              )}
            </button>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default YourSpace;
