import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, MessageSquare, BarChart3, Trash2, Shield,
  Ban, CheckCircle, MessagesSquare, Crown, UserX, ClipboardList, Star,
} from "lucide-react";
import ActivityLog from "@/components/admin/ActivityLog";
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
  banned_at: string | null;
}

interface ChatMessage {
  id: string;
  message: string;
  created_at: string;
  sender_id: string;
  profiles?: { name: string | null; email: string | null } | null;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user" | "super_admin";
}

interface ActivityEntry {
  id: string;
  admin_id: string;
  action_type: string;
  target_user_id: string | null;
  details: string | null;
  created_at: string;
  admin_profile?: { name: string | null; email: string | null } | null;
  target_profile?: { name: string | null; email: string | null } | null;
}

type TabKey = "messages" | "members" | "chat" | "stats" | "activity";

const Admin = () => {
  const { isAdmin, isSuperAdmin, loading: adminLoading } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabKey>("messages");
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [members, setMembers] = useState<Profile[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
    if (!authLoading && !adminLoading && !isAdmin && user) navigate("/");
  }, [authLoading, adminLoading, isAdmin, user, navigate]);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoadingData(true);
      const [subsRes, membersRes, chatRes, rolesRes, logRes] = await Promise.all([
        supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("chat_messages").select("*, profiles(name, email)").order("created_at", { ascending: false }).limit(100),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("admin_activity_log").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      if (subsRes.data) setSubmissions(subsRes.data);
      if (membersRes.data) setMembers(membersRes.data as Profile[]);
      if (chatRes.data) setChatMessages(chatRes.data as ChatMessage[]);
      if (rolesRes.data) setUserRoles(rolesRes.data as UserRole[]);
      
      // Enrich activity log with profile data
      if (logRes.data) {
        const profileMap = new Map((membersRes.data || []).map((p: Profile) => [p.id, { name: p.name, email: p.email }]));
        const enriched = logRes.data.map((entry: any) => ({
          ...entry,
          admin_profile: profileMap.get(entry.admin_id) || null,
          target_profile: entry.target_user_id ? profileMap.get(entry.target_user_id) || null : null,
        }));
        setActivityLog(enriched);
      }
      setLoadingData(false);
    };

    fetchData();
  }, [isAdmin]);

  const logActivity = async (action_type: string, target_user_id?: string, details?: string) => {
    if (!user) return;
    await supabase.from("admin_activity_log").insert({
      admin_id: user.id,
      action_type,
      target_user_id: target_user_id || null,
      details: details || null,
    });
  };

  const handleDeleteSubmission = async (id: string) => {
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (!error) {
      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      await logActivity("delete_submission", undefined, `Deleted contact submission ${id}`);
    }
  };

  const handleDeleteChat = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (!error) {
      setChatMessages((prev) => prev.filter((m) => m.id !== id));
      await logActivity("delete_message", undefined, `Deleted chat message ${id}`);
    }
    setActionLoading(null);
  };

  const handleToggleBan = async (memberId: string, isBanned: boolean) => {
    setActionLoading(memberId);
    const { error } = await supabase
      .from("profiles")
      .update({ banned_at: isBanned ? null : new Date().toISOString() })
      .eq("id", memberId);
    if (!error) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId ? { ...m, banned_at: isBanned ? null : new Date().toISOString() } : m
        )
      );
      await logActivity(isBanned ? "unban" : "ban", memberId);
    }
    setActionLoading(null);
  };

  const handleSetRole = async (userId: string, role: "admin" | "moderator" | "user") => {
    setActionLoading(`role-${userId}`);
    const oldRole = getUserRole(userId);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    if (role !== "user") {
      await supabase.from("user_roles").insert({ user_id: userId, role });
    }
    const { data } = await supabase.from("user_roles").select("user_id, role");
    if (data) setUserRoles(data as UserRole[]);
    await logActivity("role_change", userId, `Changed role from ${oldRole} to ${role}`);
    setActionLoading(null);
  };

  const getUserRole = (userId: string): string => {
    const r = userRoles.find((ur) => ur.user_id === userId);
    return r ? r.role : "user";
  };

  const isTargetSuperAdmin = (userId: string): boolean => {
    const r = userRoles.find((ur) => ur.user_id === userId);
    return r?.role === "super_admin";
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
    { key: "messages" as const, label: "Messages", icon: MessageSquare, count: submissions.length },
    { key: "members" as const, label: "User Management", icon: Users, count: members.length },
    { key: "chat" as const, label: "Chat Moderation", icon: MessagesSquare, count: chatMessages.length },
    { key: "activity" as const, label: "Activity Log", icon: ClipboardList, count: activityLog.length },
    { key: "stats" as const, label: "Stats", icon: BarChart3 },
  ];

  const bannedCount = members.filter((m) => m.banned_at).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage users, moderate content, and monitor your platform.</p>
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

              {/* User Management */}
              {activeTab === "members" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {bannedCount > 0 && (
                    <div className="mb-4 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive flex items-center gap-2">
                      <UserX className="w-4 h-4" />
                      {bannedCount} user{bannedCount > 1 ? "s" : ""} currently banned
                    </div>
                  )}
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
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">User</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Country</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Role</th>
                              <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                              <th className="text-right px-5 py-3 font-medium text-muted-foreground">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((m) => {
                              const role = getUserRole(m.id);
                              const isBanned = !!m.banned_at;
                              const isSelf = m.id === user?.id;
                              const targetIsSuperAdmin = isTargetSuperAdmin(m.id);
                              const canModify = !isSelf && (isSuperAdmin || !targetIsSuperAdmin);

                              return (
                                <tr key={m.id} className={`border-b border-border last:border-0 transition-colors ${isBanned ? "bg-destructive/5" : "hover:bg-muted/30"}`}>
                                  <td className="px-5 py-3">
                                    <div className="flex items-center gap-2">
                                      <p className="text-foreground font-medium">{m.name || "—"}</p>
                                      {targetIsSuperAdmin && <Star className="w-3.5 h-3.5 text-amber-500" />}
                                    </div>
                                    <p className="text-xs text-muted-foreground">{m.email || "—"}</p>
                                  </td>
                                  <td className="px-5 py-3 text-muted-foreground">{m.country || "—"}</td>
                                  <td className="px-5 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                      role === "super_admin"
                                        ? "bg-amber-500/15 text-amber-600"
                                        : role === "admin"
                                        ? "bg-primary/15 text-primary"
                                        : role === "moderator"
                                        ? "bg-accent text-accent-foreground"
                                        : "bg-muted text-muted-foreground"
                                    }`}>
                                      {role === "super_admin" && <Star className="w-3 h-3" />}
                                      {role === "admin" && <Crown className="w-3 h-3" />}
                                      {role === "moderator" && <Shield className="w-3 h-3" />}
                                      {role === "super_admin" ? "Super Admin" : role.charAt(0).toUpperCase() + role.slice(1)}
                                    </span>
                                  </td>
                                  <td className="px-5 py-3">
                                    {isBanned ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive/15 text-destructive">
                                        <Ban className="w-3 h-3" /> Banned
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/15 text-green-600">
                                        <CheckCircle className="w-3 h-3" /> Active
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3">
                                    {canModify ? (
                                      <div className="flex items-center justify-end gap-1">
                                        <select
                                          value={role}
                                          onChange={(e) => handleSetRole(m.id, e.target.value as "admin" | "moderator" | "user")}
                                          disabled={actionLoading === `role-${m.id}`}
                                          className="px-2 py-1.5 rounded-lg text-xs bg-muted border border-border text-foreground cursor-pointer disabled:opacity-50"
                                        >
                                          <option value="user">User</option>
                                          <option value="moderator">Moderator</option>
                                          <option value="admin">Admin</option>
                                        </select>
                                        <button
                                          onClick={() => handleToggleBan(m.id, isBanned)}
                                          disabled={actionLoading === m.id}
                                          className={`p-1.5 rounded-lg text-xs transition-colors disabled:opacity-50 ${
                                            isBanned
                                              ? "text-green-600 hover:bg-green-500/10"
                                              : "text-destructive hover:bg-destructive/10"
                                          }`}
                                          title={isBanned ? "Unban user" : "Ban user"}
                                        >
                                          {isBanned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                        </button>
                                      </div>
                                    ) : isSelf ? (
                                      <span className="text-xs text-muted-foreground italic">You</span>
                                    ) : (
                                      <span className="text-xs text-muted-foreground italic">Protected</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Chat Moderation */}
              {activeTab === "chat" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground bg-card rounded-2xl border border-border">
                      <MessagesSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                      <p>No chat messages to moderate.</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => (
                      <div key={msg.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-foreground">
                              {msg.profiles?.name || "Unknown"}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {msg.profiles?.email}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              · {new Date(msg.created_at).toLocaleDateString("en-US", {
                                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{msg.message}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteChat(msg.id)}
                          disabled={actionLoading === msg.id}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {/* Activity Log */}
              {activeTab === "activity" && (
                <ActivityLog entries={activityLog} />
              )}

              {/* Platform Stats */}
              {activeTab === "stats" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                      <MessagesSquare className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">{chatMessages.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">Chat Messages</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <Ban className="w-8 h-8 text-destructive mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">{bannedCount}</p>
                      <p className="text-sm text-muted-foreground mt-1">Banned Users</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <BarChart3 className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">
                        {members.filter((m) => m.country).map((m) => m.country).filter((v, i, a) => a.indexOf(v) === i).length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Countries</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <Crown className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">
                        {userRoles.filter((r) => r.role === "admin").length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Admins</p>
                    </div>
                    <div className="bg-card rounded-xl border border-border p-6 text-center">
                      <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                      <p className="font-display text-3xl font-bold text-foreground">
                        {userRoles.filter((r) => r.role === "moderator").length}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Moderators</p>
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
