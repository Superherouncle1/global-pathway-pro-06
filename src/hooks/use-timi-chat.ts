import { useState, useRef, useEffect } from "react";
import { streamChat, WELCOME, type Msg } from "@/lib/timi-stream";

export function useTimiChat() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const showSuggestions = messages.length === 1 && messages[0] === WELCOME && !loading;

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
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg].filter((m) => m !== WELCOME || messages.indexOf(m) > 0),
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

  const send = () => sendMessage(input);

  return { messages, input, setInput, loading, endRef, send, sendMessage, showSuggestions };
}
