import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Bot, Maximize2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { useTimiChat } from "@/hooks/use-timi-chat";
import { SUGGESTIONS } from "@/lib/timi-stream";

const TimiChat = () => {
  const [open, setOpen] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const { messages, input, setInput, loading, endRef, send, sendMessage, showSuggestions } = useTimiChat();
  const navigate = useNavigate();

  // Show welcome bubble after 2 seconds
  useEffect(() => {
    if (open || bubbleDismissed) return;
    const timer = setTimeout(() => setShowBubble(true), 2000);
    return () => clearTimeout(timer);
  }, [open, bubbleDismissed]);

  // Hide bubble when chat opens
  useEffect(() => {
    if (open) setShowBubble(false);
  }, [open]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {/* Welcome bubble */}
            <AnimatePresence>
              {showBubble && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="relative bg-card border border-border rounded-2xl rounded-br-md shadow-hover px-4 py-3 max-w-[240px] cursor-pointer"
                  onClick={() => { setShowBubble(false); setOpen(true); }}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); setBubbleDismissed(true); setShowBubble(false); }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="text-sm text-foreground font-medium">Hi there! 👋 I'm <span className="text-primary font-semibold">Timi</span></p>
                  <p className="text-xs text-muted-foreground mt-1">Need help with studying abroad? Click to chat!</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Floating button with pulse ring */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              onClick={() => setOpen(true)}
              className="relative w-14 h-14 rounded-full gradient-hero text-primary-foreground shadow-hover flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="Open Timi chat"
            >
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full gradient-hero opacity-40 animate-ping" style={{ animationDuration: "2.5s" }} />
              <Bot className="w-6 h-6 relative z-10" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-card border border-border rounded-2xl shadow-hover flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-hero px-4 py-3 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-primary-foreground text-sm">Timi</p>
                <p className="text-primary-foreground/70 text-xs">Study Abroad Assistant</p>
              </div>
              <button
                onClick={() => { setOpen(false); navigate("/timi"); }}
                className="text-primary-foreground/70 hover:text-primary-foreground transition-colors mr-1"
                title="Open full screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "gradient-hero text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                </div>
              ))}

              {/* Suggestion chips */}
              {showSuggestions && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => sendMessage(s.message)}
                      className="px-3 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-medium hover:bg-primary/10 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {loading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex-shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                  placeholder="Ask Timi anything..."
                  className="flex-1 px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition"
                  disabled={loading}
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  className="px-3 py-2.5 rounded-xl gradient-hero text-primary-foreground hover:shadow-soft transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TimiChat;
