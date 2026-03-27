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
    const { aiProfile, filters } = await req.json();
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

    let filterInstructions = "";
    if (filters) {
      if (filters.fundingType) filterInstructions += `\nFilter by funding type: ${filters.fundingType}`;
      if (filters.studyLevel) filterInstructions += `\nFilter by study level: ${filters.studyLevel}`;
      if (filters.country) filterInstructions += `\nFilter by country/region: ${filters.country}`;
      if (filters.fieldOfStudy) filterInstructions += `\nFilter by field: ${filters.fieldOfStudy}`;
    }

    const systemPrompt = `You are GlobalGenie's Scholarship Matcher — an expert in global scholarships, grants, fellowships, and financial aid for international education.

Given a student's profile${filterInstructions ? " and their filter preferences" : ""}, find the BEST matching real scholarships and funding opportunities. 

CRITICAL RULES:
- Only recommend REAL scholarships that actually exist
- Include the actual official website URL for each scholarship
- Be specific about eligibility, deadlines, and coverage
- Score each scholarship's match quality (1-100) based on how well it fits this specific student
- Prioritise scholarships the student is most likely eligible for

Student Profile:
${profileLines.join("\n")}
${filterInstructions}

Use the match_scholarships tool to return structured data with 6-10 highly relevant scholarships.`;

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
            content: `Find me the best matching scholarships for studying abroad based on my profile. I want real, specific scholarships I can actually apply to. ${filterInstructions ? `Apply these filters: ${filterInstructions}` : "Show the broadest range of opportunities that match my profile."}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "match_scholarships",
              description: "Return matched scholarships ranked by relevance to the student's profile",
              parameters: {
                type: "object",
                properties: {
                  scholarships: {
                    type: "array",
                    description: "6-10 real scholarships ranked by match score",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string", description: "Official scholarship name" },
                        provider: { type: "string", description: "Organisation offering the scholarship" },
                        country: { type: "string", description: "Country where you study" },
                        flag_emoji: { type: "string" },
                        study_level: { type: "string", description: "Undergraduate, Masters, PhD, Any" },
                        field_focus: { type: "string", description: "Field restriction or 'All Fields'" },
                        funding_type: { type: "string", description: "Full Funding, Partial, Tuition Only, Living Stipend, Travel Grant" },
                        coverage: {
                          type: "array",
                          items: { type: "string" },
                          description: "What the scholarship covers: tuition, living expenses, flights, health insurance, etc."
                        },
                        amount: { type: "string", description: "Monetary value or description like 'Full tuition + $20,000/year stipend'" },
                        deadline: { type: "string", description: "Application deadline or 'Varies'" },
                        duration: { type: "string", description: "How long funding lasts" },
                        eligibility_summary: { type: "string", description: "Key eligibility criteria in 1-2 sentences" },
                        why_match: { type: "string", description: "Why this scholarship matches THIS specific student's profile" },
                        application_tips: { type: "string", description: "One key tip for a strong application" },
                        website_url: { type: "string", description: "Official application/info URL" },
                        match_score: { type: "number", description: "1-100 match quality score for this student" },
                        difficulty: { type: "string", description: "Easy, Moderate, Competitive, Highly Competitive" }
                      },
                      required: ["name", "provider", "country", "flag_emoji", "study_level", "field_focus", "funding_type", "coverage", "amount", "deadline", "eligibility_summary", "why_match", "website_url", "match_score", "difficulty"],
                      additionalProperties: false
                    }
                  },
                  summary: {
                    type: "string",
                    description: "2-3 sentence personalised summary of the student's scholarship landscape and top recommendation"
                  },
                  total_potential_value: {
                    type: "string",
                    description: "Estimated total potential funding value across all matched scholarships"
                  }
                },
                required: ["scholarships", "summary", "total_potential_value"],
                additionalProperties: false
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "match_scholarships" } },
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
      return new Response(JSON.stringify({ error: "Failed to match scholarships" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      return new Response(JSON.stringify({ error: "Failed to generate scholarship matches" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let matchData;
    try {
      matchData = typeof toolCall.function.arguments === "string"
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      return new Response(JSON.stringify({ error: "Invalid scholarship data" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ matches: matchData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("match-scholarships error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
