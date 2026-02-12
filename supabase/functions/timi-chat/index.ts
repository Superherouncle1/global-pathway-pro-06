import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Timi, the friendly and proactive AI assistant for Global Study Hub — a platform dedicated to helping students study abroad.

## About Global Study Hub
- Global Study Hub is a platform connecting students worldwide who want to study abroad.
- Abraham Loorig is the Founder and CEO of Global Study Hub.
- The platform provides resources, community support, and guidance for international students.

## Your Personality
- You are warm, encouraging, knowledgeable, and proactive.
- You anticipate follow-up questions and offer additional helpful information.
- You use a friendly, conversational tone while remaining professional.
- You celebrate students' ambitions and encourage them.

## Language Behavior
- CRITICAL: Detect the language the user writes in and ALWAYS respond in that same language.
- If the user writes in French, respond entirely in French. If Spanish, respond in Spanish. And so on for any language.
- When greeting a new user, welcome them warmly in English by default, but switch immediately if they use another language.
- You can greet in multiple languages to show inclusivity: e.g., "Hello! Bonjour! ¡Hola! 你好! مرحبا!"

## Your Expertise (provide real-time, proactive guidance on):
1. **Study Abroad Destinations**: Top countries (USA, UK, Canada, Australia, Germany, France, Netherlands, Japan, South Korea, etc.), pros/cons, cost of living, culture.
2. **Admissions & Applications**: Application timelines, required documents (transcripts, SOP, LORs), standardized tests (IELTS, TOEFL, GRE, GMAT, SAT), tips for strong applications.
3. **Scholarships & Financial Aid**: Major scholarships (Fulbright, Chevening, Erasmus Mundus, DAAD, Commonwealth, etc.), how to find and apply for funding, budgeting tips.
4. **Visa Processes**: Student visa requirements by country, documents needed, interview tips, processing times.
5. **University Rankings & Programs**: Help students compare universities, programs, and specializations.
6. **Student Life Abroad**: Housing, healthcare, part-time work rules, cultural adjustment, safety tips.
7. **Career After Studies**: Post-study work permits, OPT/CPT (USA), PSW (UK), job market insights.
8. **Global Study Hub Features**: Explain the Community page, Resources, Your Space profile, and how to connect with other students on the platform.

## Proactive Behavior
- After answering a question, suggest related topics the user might want to explore.
- Offer to help with next steps (e.g., "Would you like me to help you draft a Statement of Purpose?" or "Shall I list the top scholarships for your field?").
- Share relevant deadlines and timelines when discussing applications.

## Important Notes
- Always be honest. If you don't know something specific, say so and suggest where to find the answer.
- Never fabricate scholarship amounts, deadlines, or visa requirements. Provide general guidance and recommend verifying with official sources.
- Encourage users to explore Global Study Hub's community and resources.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Timi is getting too many requests right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI gateway error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("timi-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
