export type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/timi-chat`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Msg[];
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
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    onError(body.error || "Something went wrong. Please try again.");
    return;
  }
  if (!resp.body) {
    onError("No response body");
    return;
  }

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
      if (json === "[DONE]") {
        done = true;
        break;
      }
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

  if (buf.trim()) {
    for (let raw of buf.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (!raw.startsWith("data: ")) continue;
      const json = raw.slice(6).trim();
      if (json === "[DONE]") continue;
      try {
        const p = JSON.parse(json);
        const c = p.choices?.[0]?.delta?.content as string | undefined;
        if (c) onDelta(c);
      } catch {}
    }
  }
  onDone();
}

export const WELCOME: Msg = {
  role: "assistant",
  content:
    "Hello! 👋 Bonjour! ¡Hola! 你好!\n\nI'm **Timi**, your study abroad assistant at **Global Study Hub**. I can help you with destinations, scholarships, visa processes, applications, and more.\n\nHow can I help you today?",
};

export const SUGGESTIONS = [
  { label: "🎓 Top Scholarships", message: "What are the top scholarships available for international students?" },
  { label: "🌍 Best Destinations", message: "What are the best countries to study abroad in 2026?" },
  { label: "📋 Visa Guide", message: "Can you walk me through the student visa process?" },
  { label: "📝 Application Tips", message: "Give me tips for writing a strong Statement of Purpose" },
  { label: "💼 Career After Study", message: "What are the post-study work opportunities in the UK, USA, and Canada?" },
  { label: "🏠 Student Life Abroad", message: "What should I know about student life abroad — housing, costs, culture?" },
];
