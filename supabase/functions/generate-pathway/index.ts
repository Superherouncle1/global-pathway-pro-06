import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { aiProfile, futureGoal } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const profileLines: string[] = [];
    if (aiProfile.education_level) profileLines.push(`Education Level: ${aiProfile.education_level}`);
    if (aiProfile.current_institution) profileLines.push(`Institution: ${aiProfile.current_institution}`);
    if (aiProfile.field_of_study) profileLines.push(`Field: ${aiProfile.field_of_study}`);
    if (aiProfile.graduation_year) profileLines.push(`Graduation: ${aiProfile.graduation_year}`);
    if (aiProfile.opportunity_types?.length) profileLines.push(`Seeking: ${aiProfile.opportunity_types.join(", ")}`);
    if (aiProfile.target_countries?.length) profileLines.push(`Target Countries: ${aiProfile.target_countries.join(", ")}`);
    if (aiProfile.preferred_study_duration) profileLines.push(`Duration: ${aiProfile.preferred_study_duration}`);
    if (aiProfile.career_goals) profileLines.push(`Career Goals: ${aiProfile.career_goals}`);
    if (aiProfile.study_abroad_goals) profileLines.push(`Study Abroad Goals: ${aiProfile.study_abroad_goals}`);
    if (aiProfile.help_areas?.length) profileLines.push(`Help Areas: ${aiProfile.help_areas.join(", ")}`);
    if (aiProfile.biggest_challenges) profileLines.push(`Challenges: ${aiProfile.biggest_challenges}`);
    if (aiProfile.additional_context) profileLines.push(`Additional: ${aiProfile.additional_context}`);

    const systemPrompt = `You are an expert global education pathway architect. Given a student's profile and their future goal, generate a comprehensive Global Study Pathway Map.

The student's future goal for their global experience: "${futureGoal}"

Student Profile:
${profileLines.join("\n")}

Generate a detailed, personalised pathway map. Use the suggest_pathway tool to return structured data.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate my Global Study Pathway Map. My future goal: "${futureGoal}". Reverse-engineer the best study abroad opportunities to help me achieve this goal. Be specific with real programs, real scholarships, and real institutions.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_pathway",
              description: "Return a structured Global Study Pathway Map for the student",
              parameters: {
                type: "object",
                properties: {
                  current_stage: {
                    type: "object",
                    properties: {
                      level: { type: "string", description: "e.g. Undergraduate, Graduate" },
                      field: { type: "string", description: "Field of study" },
                      institution: { type: "string", description: "Current institution" },
                      graduation_year: { type: "string" },
                    },
                    required: ["level", "field"],
                    additionalProperties: false,
                  },
                  opportunities: {
                    type: "array",
                    description: "3-5 specific global study opportunities",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Specific program name" },
                        type: { type: "string", description: "Exchange, Summer Program, Full Degree, Research, Internship" },
                        country: { type: "string" },
                        institution: { type: "string", description: "Specific university or organisation" },
                        duration: { type: "string" },
                        why_fit: { type: "string", description: "Why this fits the student's goals" },
                      },
                      required: ["title", "type", "country", "institution", "why_fit"],
                      additionalProperties: false,
                    },
                  },
                  country_matches: {
                    type: "array",
                    description: "Top 3-4 country recommendations with reasoning",
                    items: {
                      type: "object",
                      properties: {
                        country: { type: "string" },
                        flag_emoji: { type: "string" },
                        match_reason: { type: "string", description: "Why this country matches the student" },
                        key_programs: { type: "array", items: { type: "string" }, description: "2-3 specific programs" },
                        strength: { type: "string", description: "What this country is known for in the student's field" },
                      },
                      required: ["country", "flag_emoji", "match_reason", "key_programs", "strength"],
                      additionalProperties: false,
                    },
                  },
                  funding_sources: {
                    type: "array",
                    description: "4-6 specific funding opportunities",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Specific scholarship/grant name" },
                        type: { type: "string", description: "Scholarship, Grant, Fellowship, Assistantship" },
                        provider: { type: "string" },
                        coverage: { type: "string", description: "What it covers: tuition, living, travel etc." },
                        eligibility_note: { type: "string", description: "Brief eligibility note for this student" },
                      },
                      required: ["name", "type", "provider", "coverage"],
                      additionalProperties: false,
                    },
                  },
                  skill_outcomes: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 skills and experiences the student will gain",
                  },
                  career_pathways: {
                    type: "array",
                    items: { type: "string" },
                    description: "4-6 long-term career opportunities that open up",
                  },
                  career_insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "3-4 specific insights about how global experience connects to career outcomes",
                  },
                },
                required: ["current_stage", "opportunities", "country_matches", "funding_sources", "skill_outcomes", "career_pathways", "career_insights"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_pathway" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate pathway" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Failed to generate structured pathway data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let pathwayData;
    try {
      pathwayData = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid pathway data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ pathway: pathwayData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-pathway error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
