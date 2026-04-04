import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, Calendar, ExternalLink, Globe, GraduationCap, Briefcase,
  Award, BookOpen, Plus, X, Loader2, MapPin, Mail, Filter, Users
} from "lucide-react";
import BookmarkButton from "@/components/BookmarkButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Listing {
  id: string;
  posted_by: string;
  institution_name: string;
  title: string;
  description: string;
  listing_type: string;
  country: string | null;
  deadline: string | null;
  application_link: string | null;
  contact_email: string | null;
  is_active: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  name: string | null;
  country: string | null;
  field_of_study: string | null;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
}

type SelectedProfile = Profile | null;

const typeConfig: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  admission: { icon: GraduationCap, label: "Admission", className: "bg-primary/10 text-primary border-primary/20" },
  recruitment: { icon: Briefcase, label: "Recruitment", className: "bg-accent/10 text-accent border-accent/20" },
  scholarship: { icon: Award, label: "Scholarship", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  program: { icon: BookOpen, label: "Program", className: "bg-violet-500/10 text-violet-600 border-violet-500/20" },
};

const OpportunitiesBoard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterCountry, setFilterCountry] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);
  const [studentProfiles, setStudentProfiles] = useState<Profile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<SelectedProfile>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    institution_name: "",
    title: "",
    description: "",
    listing_type: "admission",
    country: "",
    deadline: "",
    application_link: "",
    contact_email: "",
  });

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const { data } = await supabase
      .from("opportunity_listings")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (data) setListings(data);
    setLoading(false);
  };

  const loadStudentProfiles = async () => {
    setLoadingProfiles(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, name, country, field_of_study, avatar_url, bio, email")
      .order("created_at", { ascending: false });
    if (data) setStudentProfiles(data);
    setLoadingProfiles(false);
  };

  const handleSubmit = async () => {
    if (!user || !form.institution_name.trim() || !form.title.trim() || !form.description.trim()) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("opportunity_listings").insert({
      posted_by: user.id,
      institution_name: form.institution_name.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      listing_type: form.listing_type,
      country: form.country.trim() || null,
      deadline: form.deadline || null,
      application_link: form.application_link.trim() || null,
      contact_email: form.contact_email.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Failed to post listing", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Listing posted successfully!" });
      setForm({ institution_name: "", title: "", description: "", listing_type: "admission", country: "", deadline: "", application_link: "", contact_email: "" });
      setShowForm(false);
      loadListings();
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("opportunity_listings").delete().eq("id", id);
    setListings((prev) => prev.filter((l) => l.id !== id));
    toast({ title: "Listing removed" });
  };

  const filtered = listings.filter((l) => {
    if (filterType !== "all" && l.listing_type !== filterType) return false;
    if (filterCountry && !(l.country || "").toLowerCase().includes(filterCountry.toLowerCase())) return false;
    return true;
  });

  const countries = [...new Set(listings.map((l) => l.country).filter(Boolean))] as string[];

  const getInitials = (name: string | null) =>
    (name || "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const formatDeadline = (d: string | null) => {
    if (!d) return null;
    const date = new Date(d);
    const now = new Date();
    const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const formatted = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    if (diffDays < 0) return { text: `Closed ${formatted}`, urgent: true };
    if (diffDays <= 7) return { text: `${diffDays}d left — ${formatted}`, urgent: true };
    return { text: formatted, urgent: false };
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Marketplace description */}
      <div className="text-center mb-8 p-6 bg-card border border-border rounded-2xl">
        <h2 className="font-display text-xl font-semibold text-foreground mb-2">Opportunities Marketplace</h2>
        <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
          This space is for universities, institutions, and programs to post admissions openings, scholarships, and recruitment opportunities. 
          Institutions can also browse student profiles to discover and reach out to potential candidates directly.
        </p>
      </div>

      {/* Header actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Button onClick={() => setShowForm(true)} className="gradient-hero text-primary-foreground gap-2">
          <Plus className="w-4 h-4" /> Post an Opportunity
        </Button>
        <Dialog open={showDirectory} onOpenChange={(open) => { setShowDirectory(open); if (open) loadStudentProfiles(); }}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="w-4 h-4" /> Browse Student Profiles
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Student Profiles</DialogTitle>
            </DialogHeader>
            {loadingProfiles ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="grid gap-3 mt-4">
                {studentProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedProfile(p)}
                    className="flex items-start gap-3 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/40 hover:bg-muted transition-all cursor-pointer text-left w-full"
                  >
                    <div className="w-10 h-10 rounded-full gradient-hero flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-semibold overflow-hidden">
                      {p.avatar_url ? <img src={p.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(p.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground">{p.name || "Anonymous"}</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {p.country && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{p.country}</span>
                        )}
                        {p.field_of_study && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1"><GraduationCap className="w-3 h-3" />{p.field_of_study}</span>
                        )}
                      </div>
                      {p.bio && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{p.bio}</p>}
                    </div>
                    <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                  </button>
                ))}
                {studentProfiles.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No student profiles found.</p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Student Profile Detail Dialog */}
        <Dialog open={!!selectedProfile} onOpenChange={(open) => { if (!open) setSelectedProfile(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Student Profile</DialogTitle>
            </DialogHeader>
            {selectedProfile && (
              <div className="space-y-4 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full gradient-hero flex-shrink-0 flex items-center justify-center text-primary-foreground text-lg font-semibold overflow-hidden">
                    {selectedProfile.avatar_url ? <img src={selectedProfile.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(selectedProfile.name)}
                  </div>
                  <div>
                    <p className="font-display text-lg font-bold text-foreground">{selectedProfile.name || "Anonymous"}</p>
                    {selectedProfile.country && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedProfile.country}</p>
                    )}
                  </div>
                </div>
                {selectedProfile.field_of_study && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground font-medium">{selectedProfile.field_of_study}</span>
                  </div>
                )}
                {selectedProfile.bio && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">About</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{selectedProfile.bio}</p>
                  </div>
                )}
                {selectedProfile.email && (
                  <a
                    href={`mailto:${selectedProfile.email}`}
                    className="flex items-center gap-2 w-full justify-center py-2.5 rounded-xl gradient-hero text-primary-foreground text-sm font-medium hover:shadow-soft transition-all"
                  >
                    <Mail className="w-4 h-4" /> Contact Student
                  </a>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Filter className="w-4 h-4" /> Filter:</div>
        {["all", "admission", "recruitment", "scholarship", "program"].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterType === t ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t === "all" ? "All" : typeConfig[t]?.label}
          </button>
        ))}
        {countries.length > 0 && (
          <Select value={filterCountry} onValueChange={setFilterCountry}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_countries">All Countries</SelectItem>
              {countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Post form dialog */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-hover">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-lg font-semibold text-foreground">Post an Opportunity</h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Institution Name *</label>
                  <Input value={form.institution_name} onChange={(e) => setForm((f) => ({ ...f, institution_name: e.target.value }))} placeholder="e.g. University of Oxford" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Listing Title *</label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Fall 2026 MBA Admissions Open" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Type *</label>
                  <Select value={form.listing_type} onValueChange={(v) => setForm((f) => ({ ...f, listing_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admission">Admission</SelectItem>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                      <SelectItem value="scholarship">Scholarship</SelectItem>
                      <SelectItem value="program">Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
                  <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe the opportunity, eligibility, and benefits..." rows={4} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Country</label>
                    <Input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} placeholder="e.g. United Kingdom" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Deadline</label>
                    <Input type="date" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Application Link</label>
                  <Input value={form.application_link} onChange={(e) => setForm((f) => ({ ...f, application_link: e.target.value }))} placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Contact Email</label>
                  <Input type="email" value={form.contact_email} onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))} placeholder="admissions@university.edu" />
                </div>
                <Button onClick={handleSubmit} disabled={submitting} className="w-full gradient-hero text-primary-foreground">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {submitting ? "Posting..." : "Post Listing"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Listings grid */}
      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No opportunities posted yet</p>
          <p className="text-sm mt-1">Be the first institution to post!</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((listing, i) => {
            const cfg = typeConfig[listing.listing_type] || typeConfig.admission;
            const Icon = cfg.icon;
            const dl = formatDeadline(listing.deadline);
            return (
              <motion.div key={listing.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-hover transition-all hover:-translate-y-0.5 h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                            <Icon className="w-3 h-3 mr-1" />{cfg.label}
                          </Badge>
                          {listing.country && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="w-3 h-3" />{listing.country}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-base leading-tight">{listing.title}</CardTitle>
                      </div>
                      {listing.posted_by === user?.id && (
                        <button onClick={() => handleDelete(listing.id)} className="text-muted-foreground hover:text-destructive p-1 rounded" title="Delete">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span className="font-medium">{listing.institution_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{listing.description}</p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      {dl && (
                        <span className={`text-xs flex items-center gap-1 ${dl.urgent ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                          <Calendar className="w-3 h-3" />{dl.text}
                        </span>
                      )}
                      {listing.contact_email && (
                        <a href={`mailto:${listing.contact_email}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Mail className="w-3 h-3" />{listing.contact_email}
                        </a>
                      )}
                    </div>
                    {listing.application_link && (
                      <a href={listing.application_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1">
                        Apply Now <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesBoard;
