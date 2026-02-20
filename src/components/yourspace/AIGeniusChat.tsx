import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, RotateCcw, Sparkles, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { type AIProfile } from "./AITrainingWizard";

type Msg = { role: "user" | "assistant"; content: string };

const GENIUS_SUGGESTIONS = [
  { label: "🎓 Find my scholarships", message: "Search the web right now and find the most current scholarships I should apply to based on my profile. Include the official portal links, award amounts, and exact deadlines for the current cycle." },
  { label: "🌍 Best countries for me", message: "Given my field, goals, and budget, which specific countries and universities are the strongest match for me? Include current admission rates and funding availability." },
  { label: "📋 My visa roadmap", message: "Give me the current, step-by-step visa application process for my top target countries — including exact financial requirements, processing times right now, and the official application portals." },
  { label: "🎤 Mock admissions interview", message: "Start a mock university admissions interview with me. Play the role of a tough but fair admissions interviewer. Ask me one question at a time, score my answers, and give me coaching after each one." },
  { label: "🏛️ Visa interview prep", message: "Start a visa interview simulation with me for my target country. Play a strict embassy officer and flag any answers that would raise suspicion. End with a visa approval probability assessment." },
  { label: "💰 Funding strategy", message: "Build me a complete funding strategy for studying abroad — scholarships, assistantships, loans, and part-time work options specific to my target countries and field." },
  { label: "📝 SOP strategy", message: "Help me craft a compelling Statement of Purpose strategy based on my specific background and goals. Include what admissions committees at my target universities specifically look for." },
  { label: "🗓️ My action plan", message: "Create a personalised month-by-month action plan for me to study abroad in the next intake cycle, including application deadlines, visa timelines, and scholarship deadlines." },
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/personal-ai-genius`;

async function streamChat({
  messages,
  aiProfile,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
  aiProfile: AIProfile | null;
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, aiProfile }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || "Something went wrong. Please try again.");
    return;
  }
  if (!resp.body) { onError("No response body"); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rd, value } = await reader.read();
    if (rd) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const c = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

interface Props {
  aiProfile: AIProfile;
  onRetrain: () => void;
}

export default function AIGeniusChat({ aiProfile, onRetrain }: Props) {
  const WELCOME: Msg = {
    role: "assistant",
    content: `Welcome back! I'm your **Personal AI Genius** — and I know exactly who you are.\n\nYou're studying **${aiProfile.field_of_study || "your field"}**, targeting **${aiProfile.target_countries?.join(", ") || "your dream destinations"}**, and working towards **${aiProfile.career_goals?.substring(0, 80) || "your goals"}${(aiProfile.career_goals?.length || 0) > 80 ? "..." : ""}**.\n\nI'm here with hyper-personalised, specific, actionable intelligence — no fluff, no generic advice. What do you need today?`,
  };

  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const showSuggestions = messages.length === 1;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    const userMsg: Msg = { role: "user", content: trimmed };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.role === "user") {
          return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages.filter(m => m !== WELCOME || messages.indexOf(m) > 0), userMsg],
        aiProfile,
        onDelta: upsert,
        onDone: () => setLoading(false),
        onError: (msg) => {
          setMessages((p) => [...p, { role: "assistant", content: `⚠️ ${msg}` }]);
          setLoading(false);
        },
      });
    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground font-medium">Active & learning your context</span>
        </div>
        <button
          onClick={onRetrain}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
        >
          <RotateCcw className="w-3 h-3" /> Update training
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 scrollbar-thin">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center flex-shrink-0 mr-2 mt-0.5 shadow-soft">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "gradient-hero text-primary-foreground rounded-tr-sm"
                  : "bg-muted text-foreground rounded-tl-sm"
              }`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-li:my-0.5 prose-strong:text-foreground prose-p:text-foreground prose-li:text-foreground prose-headings:text-foreground prose-a:text-primary">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ml-2 mt-0.5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-2">
            <div className="w-7 h-7 rounded-full gradient-hero flex items-center justify-center shadow-soft">
              <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </motion.div>
        )}

        {/* Suggestion chips */}
        {showSuggestions && !loading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-1">
            {GENIUS_SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.message)}
                className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary font-medium hover:bg-primary/20 transition-all hover:scale-[1.02]"
              >
                {s.label}
              </button>
            ))}
          </motion.div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 pt-3 mt-3 border-t border-border flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask your Personal AI Genius anything..."
          rows={1}
          className="flex-1 px-4 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-none min-h-[44px] max-h-[120px]"
          style={{ height: "auto" }}
          onInput={(e) => {
            const t = e.currentTarget;
            t.style.height = "auto";
            t.style.height = Math.min(t.scrollHeight, 120) + "px";
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-10 h-10 self-end rounded-xl gradient-hero text-primary-foreground flex items-center justify-center shadow-soft hover:shadow-hover transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 flex-shrink-0"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
