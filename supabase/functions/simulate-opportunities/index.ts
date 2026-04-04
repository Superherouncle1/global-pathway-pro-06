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

    const { aiProfile } = await req.json();
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

    const systemPrompt = `You are GlobalGenie's Global Opportunity Simulator — an expert education futurist. Given a student's profile, generate 3 distinct global education scenarios that show different possible futures.

Each scenario should feel like a different life path the student could take. Be specific with REAL programs, REAL institutions, REAL scholarships, and REAL career outcomes. Make each scenario feel dramatically different so the student can compare truly distinct futures.

Student Profile:
${profileLines.join("\n")}

Generate 3 vivid, personalised global education scenarios. Each must paint a clear picture of what that path unlocks. Use the simulate_opportunities tool to return structured data.`;

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
          {
            role: "user",
            content: `Generate 3 distinct Global Opportunity Scenarios for me. Each should represent a completely different global path I could take — different countries, different program types, different career trajectories. Be specific with real programs, real institutions, and real outcomes. Help me see three possible futures.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "simulate_opportunities",
              description: "Return 3 distinct global education scenario simulations for the student",
              parameters: {
                type: "object",
                properties: {
                  scenarios: {
                    type: "array",
                    description: "Exactly 3 distinct global education scenarios",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Vivid scenario title e.g. 'Semester in Germany: The Engineering Innovation Path'" },
                        emoji: { type: "string", description: "A single emoji representing this scenario" },
                        country: { type: "string", description: "Primary country" },
                        flag_emoji: { type: "string", description: "Country flag emoji" },
                        program_type: { type: "string", description: "Exchange, Summer Program, Full Degree, Research, Internship" },
                        program_name: { type: "string", description: "Specific real program name" },
                        institution: { type: "string", description: "Specific real university or organisation" },
                        duration: { type: "string", description: "e.g. '1 semester', '10 weeks', '2 years'" },
                        summary: { type: "string", description: "2-3 sentence vivid description of what this path looks like" },
                        outcomes: {
                          type: "array",
                          items: { type: "string" },
                          description: "3-4 specific outcomes/experiences this path unlocks"
                        },
                        skills_gained: {
                          type: "array",
                          items: { type: "string" },
                          description: "4-5 specific skills the student would develop"
                        },
                        career_opportunities: {
                          type: "array",
                          items: { type: "string" },
                          description: "3-4 specific career paths this experience opens"
                        },
                        funding_options: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string", description: "Specific real scholarship/grant name" },
                              coverage: { type: "string", description: "What it covers" },
                              provider: { type: "string" }
                            },
                            required: ["name", "coverage", "provider"],
                            additionalProperties: false
                          },
                          description: "2-3 specific real funding opportunities for this scenario"
                        },
                        career_impact_score: { type: "number", description: "1-10 rating of career impact potential" },
                        cultural_exposure_score: { type: "number", description: "1-10 rating of cultural immersion depth" },
                        network_growth_score: { type: "number", description: "1-10 rating of networking opportunity" }
                      },
                      required: ["title", "emoji", "country", "flag_emoji", "program_type", "program_name", "institution", "duration", "summary", "outcomes", "skills_gained", "career_opportunities", "funding_options", "career_impact_score", "cultural_exposure_score", "network_growth_score"],
                      additionalProperties: false
                    }
                  },
                  comparison_insight: {
                    type: "string",
                    description: "A 2-3 sentence insight comparing all three scenarios and helping the student think about which aligns best with their goals"
                  }
                },
                required: ["scenarios", "comparison_insight"],
                additionalProperties: false
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "simulate_opportunities" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Failed to generate scenarios" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Failed to generate structured scenario data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let scenarioData;
    try {
      scenarioData = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid scenario data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ simulation: scenarioData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("simulate-opportunities error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
