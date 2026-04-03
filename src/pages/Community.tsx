import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, MessageCircle, Search, Send, MapPin, GraduationCap, Loader2, Building2 } from "lucide-react";
import OpportunitiesBoard from "@/components/community/OpportunitiesBoard";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import BackButton from "@/components/BackButton";
import Footer from "@/components/Footer";

interface Profile {
  id: string;
  name: string | null;
  country: string | null;
  field_of_study: string | null;
  avatar_url: string | null;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  profiles?: { name: string | null; avatar_url: string | null } | null;
}

const Community = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "chat" | "opportunities">("directory");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadProfiles();
      loadMessages();
      setupRealtime();
    }
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProfiles = async () => {
    const { data } = await supabase.rpc("get_community_profiles");
    if (data) setProfiles(data);
    setLoadingData(false);
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, sender_id, message, created_at, profiles(name, avatar_url)")
      .order("created_at", { ascending: true })
      .limit(100);
    if (data) setMessages(data as ChatMessage[]);
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel("chat-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        async (payload) => {
          const { data } = await supabase.rpc("get_profile_display", {
            _user_id: payload.new.sender_id,
          });
          const profileData = data?.[0] || null;
          const newMsg: ChatMessage = {
            ...(payload.new as ChatMessage),
            profiles: data,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user || sending) return;
    setSending(true);
    await supabase.from("chat_messages").insert({
      sender_id: user.id,
      message: newMessage.trim(),
    });
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredProfiles = profiles.filter(
    (p) =>
      (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.country || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.field_of_study || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarColors = ["gradient-hero", "gradient-coral", "gradient-dark"];
  const getInitials = (name: string | null) =>
    (name || "?")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (authLoading || loadingData) {
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
        <div className="container mx-auto px-4">
          <BackButton />
        </div>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Global Network
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              The Community
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              A marketplace connecting students and institutions worldwide. Network with peers, chat in real-time, and discover admissions, scholarships &amp; recruitment opportunities.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8 overflow-x-auto">
            <div className="inline-flex bg-muted rounded-xl p-1 min-w-0">
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "directory" ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Directory ({profiles.length})
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "chat" ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat
              </button>
              <button
                onClick={() => setActiveTab("opportunities")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "opportunities" ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="w-4 h-4 inline mr-2" />
                Opportunities
              </button>
            </div>
          </div>

          {activeTab === "opportunities" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <OpportunitiesBoard />
            </motion.div>
          ) : activeTab === "directory" ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, country, or field of interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                />
              </div>

              {filteredProfiles.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No members found. Be the first to complete your profile!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProfiles.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-xl p-5 hover:shadow-hover transition-all hover:-translate-y-0.5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-11 h-11 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-primary-foreground font-semibold text-sm overflow-hidden`}>
                          {p.avatar_url ? (
                            <img src={p.avatar_url} alt={p.name || "User"} className="w-full h-full object-cover" />
                          ) : (
                            getInitials(p.name)
                          )}
                        </div>
                        <div>
                          <p className="font-display font-semibold text-foreground">{p.name || "Anonymous"}</p>
                          {p.country && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {p.country}
                            </p>
                          )}
                        </div>
                      </div>
                      {p.field_of_study && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-primary" /> {p.field_of_study}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto">
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="p-4 border-b border-border">
                  <h3 className="font-display font-semibold text-foreground">Global Chat</h3>
                  <p className="text-xs text-muted-foreground">{profiles.length} members • Live discussion</p>
                </div>

                <div className="p-4 space-y-4 min-h-[350px] max-h-[450px] overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                      <p>No messages yet. Start the conversation! 👋</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full gradient-hero flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-semibold overflow-hidden">
                          {msg.profiles?.avatar_url ? (
                            <img src={msg.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(msg.profiles?.name || null)
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-foreground">
                              {msg.profiles?.name || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">{timeAgo(msg.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="px-4 py-3 rounded-xl gradient-hero text-primary-foreground hover:shadow-soft transition-all disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Community;
