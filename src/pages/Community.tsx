import { useState } from "react";
import { motion } from "framer-motion";
import { Users, MessageCircle, Search, Send, MapPin, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const mockUsers = [
  { id: 1, name: "Amara Osei", country: "Ghana", interest: "Engineering", avatar: "AO" },
  { id: 2, name: "Carlos Reyes", country: "Mexico", interest: "Business", avatar: "CR" },
  { id: 3, name: "Mei Lin", country: "China", interest: "Computer Science", avatar: "ML" },
  { id: 4, name: "Fatima Hassan", country: "Egypt", interest: "Medicine", avatar: "FH" },
  { id: 5, name: "Priya Sharma", country: "India", interest: "Data Science", avatar: "PS" },
  { id: 6, name: "Jean-Pierre", country: "Cameroon", interest: "Law", avatar: "JP" },
  { id: 7, name: "Yuki Tanaka", country: "Japan", interest: "Architecture", avatar: "YT" },
  { id: 8, name: "Oluwaseun Ade", country: "Nigeria", interest: "Public Health", avatar: "OA" },
  { id: 9, name: "Sofia García", country: "Colombia", interest: "Education", avatar: "SG" },
  { id: 10, name: "Ahmed Khan", country: "Pakistan", interest: "Finance", avatar: "AK" },
  { id: 11, name: "Ingrid Müller", country: "Germany", interest: "Environmental Sci", avatar: "IM" },
  { id: 12, name: "Kwame Asante", country: "Kenya", interest: "Agriculture", avatar: "KA" },
];

const mockMessages = [
  { id: 1, user: "Amara Osei", text: "Hey everyone! Has anyone applied to universities in Canada? Would love some tips! 🇨🇦", time: "2 min ago" },
  { id: 2, user: "Carlos Reyes", text: "I'm looking at UofT and McGill. The scholarship deadlines are coming up soon!", time: "5 min ago" },
  { id: 3, user: "Mei Lin", text: "Just got my acceptance letter from TU Munich! So excited 🎉", time: "12 min ago" },
  { id: 4, user: "Fatima Hassan", text: "Congratulations Mei! That's amazing. Does anyone have visa interview tips for the EU?", time: "15 min ago" },
  { id: 5, user: "Priya Sharma", text: "Check out Module 7 in the Resource Hub — it has great visa interview tips!", time: "18 min ago" },
];

const Community = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "chat">("directory");

  const filteredUsers = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.interest.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarColors = [
    "gradient-hero", "gradient-coral", "gradient-dark",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20">
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
              Connect with fellow students from around the world. Share experiences, ask questions, and grow together.
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setActiveTab("directory")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "directory"
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Directory
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "chat"
                    ? "bg-card text-foreground shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageCircle className="w-4 h-4 inline mr-2" />
                Chat
              </button>
            </div>
          </div>

          {activeTab === "directory" ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto"
            >
              {/* Search */}
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

              {/* User Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user, i) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-card border border-border rounded-xl p-5 hover:shadow-hover transition-all hover:-translate-y-0.5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-11 h-11 rounded-full ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-primary-foreground font-semibold text-sm`}>
                        {user.avatar}
                      </div>
                      <div>
                        <p className="font-display font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {user.country}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-primary" /> {user.interest}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto"
            >
              {/* Chat Area */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
                <div className="p-4 border-b border-border">
                  <h3 className="font-display font-semibold text-foreground">Global Chat</h3>
                  <p className="text-xs text-muted-foreground">{mockUsers.length} members • Open discussion</p>
                </div>

                <div className="p-4 space-y-4 min-h-[350px] max-h-[450px] overflow-y-auto">
                  {mockMessages.map((msg) => (
                    <div key={msg.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full gradient-hero flex-shrink-0 flex items-center justify-center text-primary-foreground text-xs font-semibold">
                        {msg.user.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-foreground">{msg.user}</span>
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition"
                    />
                    <button className="px-4 py-3 rounded-xl gradient-hero text-primary-foreground hover:shadow-soft transition-all">
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
