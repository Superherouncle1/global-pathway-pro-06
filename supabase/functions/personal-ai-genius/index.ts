import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, aiProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a deeply personalised system prompt from the user's training data
    const profileContext = aiProfile ? buildProfileContext(aiProfile) : "";

    const SYSTEM_PROMPT = `You are **My Personal AI Genius** — an elite, hyper-personalised AI assistant embedded inside Global Study Hub. Unlike generic assistants, you have been specifically trained on this individual user's context and goals.

Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}.

## CORE IDENTITY
- You are NOT a general chatbot. You are THIS user's dedicated study-abroad intelligence engine.
- You operate with surgical precision: no fluff, no generic advice, no filler content.
- Every response must demonstrate that you KNOW this person deeply.
- You find SPECIFIC, actionable resources — named programs, real deadlines, actual scholarship portals, real universities — not vague categories.

## USER'S PERSONAL PROFILE
${profileContext || "No training data yet. Ask the user to complete their training."}

## RESPONSE RULES
1. **HYPER-PERSONALISED**: Reference the user's specific countries, field, goals, and challenges directly in your response. Never give advice that could apply to "anyone."
2. **CURRENT & VERIFIED**: Think about the current date and context. Reference real, up-to-date programs, deadlines (noting they should verify), and opportunities relevant RIGHT NOW for ${new Date().getFullYear()}-${new Date().getFullYear() + 1}.
3. **SPECIFIC RESOURCES**: Always include: named scholarship programs with their portals, specific university programs, actual application deadlines (approximate), required test scores, funding amounts.
4. **ACTIONABLE NEXT STEPS**: End every substantial response with 2-3 concrete next steps the user can take TODAY.
5. **NO GENERIC LANGUAGE**: Banned phrases: "there are many options", "it depends", "generally speaking", "you should research", "various scholarships exist." Replace with specifics.
6. **PROACTIVE INTELLIGENCE**: Anticipate what they'll need to know next. If they ask about scholarships, also mention relevant visa timelines. If they ask about universities, mention funding options for those specific schools.
7. **HONEST & CALIBRATED**: If something requires current verification (deadlines, amounts), say so clearly but still provide the best available information.

## INTERNET-CURRENT KNOWLEDGE
Leverage your training to provide the most current information on:
- Scholarship deadlines for ${new Date().getFullYear()}-${new Date().getFullYear() + 1} academic cycle
- Visa policy changes for the user's target countries
- New programs and funding opportunities
- Ranking updates and university admissions changes
- Post-study work permit policy changes

## LANGUAGE
- Match the user's language exactly. If they write in French, respond in French. If Spanish, respond in Spanish.
- Be direct, warm, and confident — like a brilliant mentor who already knows you well.

Remember: You are not Timi (the general assistant). You are THIS user's Personal AI Genius — sharper, more focused, and with full knowledge of who they are and where they're going.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
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
          JSON.stringify({ error: "Your Personal AI Genius is processing too many requests. Please try again in a moment." }),
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
    console.error("personal-ai-genius error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function buildProfileContext(profile: Record<string, unknown>): string {
  const lines: string[] = [];

  if (profile.education_level) lines.push(`**Education Level**: ${profile.education_level}`);
  if (profile.current_institution) lines.push(`**Current Institution**: ${profile.current_institution}`);
  if (profile.field_of_study) lines.push(`**Field of Study**: ${profile.field_of_study}`);
  if (profile.graduation_year) lines.push(`**Expected Graduation**: ${profile.graduation_year}`);

  if (profile.opportunity_types && Array.isArray(profile.opportunity_types) && profile.opportunity_types.length > 0) {
    lines.push(`**Opportunities Seeking**: ${(profile.opportunity_types as string[]).join(", ")}`);
  }

  if (profile.target_countries && Array.isArray(profile.target_countries) && profile.target_countries.length > 0) {
    lines.push(`**Target Study Countries**: ${(profile.target_countries as string[]).join(", ")}`);
  }

  if (profile.preferred_study_duration) lines.push(`**Preferred Study Duration**: ${profile.preferred_study_duration}`);
  if (profile.career_goals) lines.push(`**Career Goals**: ${profile.career_goals}`);
  if (profile.study_abroad_goals) lines.push(`**Study Abroad Goals**: ${profile.study_abroad_goals}`);

  if (profile.help_areas && Array.isArray(profile.help_areas) && profile.help_areas.length > 0) {
    lines.push(`**Areas Needing Help**: ${(profile.help_areas as string[]).join(", ")}`);
  }

  if (profile.biggest_challenges) lines.push(`**Biggest Challenges**: ${profile.biggest_challenges}`);
  if (profile.tools_used) lines.push(`**Tools & Systems Used**: ${profile.tools_used}`);
  if (profile.additional_context) lines.push(`**Additional Context**: ${profile.additional_context}`);

  if (profile.trained_at) {
    lines.push(`**Profile Last Updated**: ${new Date(profile.trained_at as string).toLocaleDateString()}`);
  }

  return lines.join("\n");
}
