import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, MessageSquare, BarChart3, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  country: string | null;
  field_of_study: string | null;
  created_at: string;
}

const Admin = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"messages" | "members" | "stats">("messages");
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
    if (!authLoading && !adminLoading && !isAdmin && user) {
      navigate("/");
    }
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoadingData(true);
      const [subsRes, membersRes] = await Promise.all([
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      ]);

      if (subsRes.data) setSubmissions(subsRes.data);
      if (membersRes.data) setMembers(membersRes.data);
      setLoadingData(false);
    };

    fetchData();
  }, [isAdmin]);

  const handleDeleteSubmission = async (id: string) => {
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { key: "messages" as const, label: "Contact Messages", icon: MessageSquare, count: submissions.length },
    { key: "members" as const, label: "Community Members", icon: Users, count: members.length },
    { key: "stats" as const, label: "Platform Stats", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your platform from one place.</p>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "gradient-hero text-primary-foreground shadow-soft"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.key ? "bg-primary-foreground/20" : "bg-muted"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loadingData ? (
            <div className="text-center py-12 text-muted-foreground">Loading data...</div>
          ) : (
            <>
              {/* Contact Messages */}
              {activeTab === "messages" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  {submissions.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                      <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No contact messages yet.</p>
                    </div>
                  ) : (
                    submissions.map((sub) => (
                      <div key={sub.id} className="bg-card rounded-xl border border-border p-5 flex flex-col md:flex-row md:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-display font-semibold text-foreground">{sub.name}</p>
                            <span className="text-xs text-muted-foreground">{sub.email}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{sub.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(sub.created_at).toLocaleDateString("en-US", {
                              year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          className="self-start p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete submission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Community Members */}
              {activeTab === "members" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {members.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No community members yet.</p>
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/50">
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Name</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Email</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Country</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Field of Study</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Joined</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((m) => (
                              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3 text-foreground font-medium">{m.name || "—"}</td>
                                <td className="px-5 py-3 text-muted-foreground">{m.email || "—"}</td>
                                <td className="px-5 py-3 text-muted-foreground">{m.country || "—"}</td>
                                <td className="px-5 py-3 text-muted-foreground">{m.field_of_study || "—"}</td>
                                <td className="px-5 py-3 text-muted-foreground">
                                  {new Date(m.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Platform Stats */}
              {activeTab === "stats" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <Users className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">{members.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Total Members</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <MessageSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">{submissions.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Contact Messages</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">
                        {members.filter((m) => m.country).map((m) => m.country).filter((v, i, a) => a.indexOf(v) === i).length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Countries Represented</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Admin;
