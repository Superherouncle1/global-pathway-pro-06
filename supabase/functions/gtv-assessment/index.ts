import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { aiProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Credit check
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      if (token !== Deno.env.get("SUPABASE_ANON_KEY")) {
        const { data: userData } = await supabaseClient.auth.getUser(token);
        userId = userData?.user?.id ?? null;
      }
    }

    if (userId) {
      const { data: isSuperAdmin } = await supabaseClient.rpc("is_super_admin", { _user_id: userId });
      if (!isSuperAdmin) {
        const { data: creditData } = await supabaseClient
          .from("user_credits").select("credits").eq("user_id", userId).single();
        const currentCredits = creditData?.credits ?? 0;
        if (currentCredits <= 0) {
          return new Response(
            JSON.stringify({ error: "You've used all your credits. Upgrade your plan to continue." }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await supabaseClient.from("user_credits")
          .update({ credits: currentCredits - 1, updated_at: new Date().toISOString() })
          .eq("user_id", userId);
      }
    }

    const profileSummary = `
Field of Study: ${aiProfile.field_of_study || "Not specified"}
Education Level: ${aiProfile.education_level || "Not specified"}
Institution: ${aiProfile.current_institution || "Not specified"}
Graduation Year: ${aiProfile.graduation_year || "Not specified"}
Career Goals: ${aiProfile.career_goals || "Not specified"}
Target Countries: ${(aiProfile.target_countries || []).join(", ") || "Not specified"}
Opportunity Types: ${(aiProfile.opportunity_types || []).join(", ") || "Not specified"}
Study Abroad Goals: ${aiProfile.study_abroad_goals || "Not specified"}
Biggest Challenges: ${aiProfile.biggest_challenges || "Not specified"}
Additional Context: ${aiProfile.additional_context || "Not specified"}
    `.trim();

    const systemPrompt = `You are an expert UK Global Talent Visa advisor. Evaluate the applicant's eligibility based on their profile.

The Global Talent Visa has these endorsing bodies:
- Tech Nation (digital technology)
- Arts Council England (arts & culture)
- British Academy (humanities & social sciences)
- Royal Society (natural sciences, maths, engineering, medicine)
- Royal Academy of Engineering (engineering)
- UK Research and Innovation (UKRI) (research & academia)

Two routes exist:
- **Exceptional Talent**: Recognised leader in their field (senior professionals, established researchers)
- **Exceptional Promise**: Emerging leader showing potential (early-career, PhD students, recent graduates with strong output)

You MUST respond with a valid JSON object matching this exact schema:
{
  "overall_score": <number 0-100>,
  "verdict": "<strong|moderate|weak>",
  "summary": "<2-3 sentence overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "recommended_route": "<Exceptional Talent or Exceptional Promise>",
  "endorsing_body": "<most relevant endorsing body>",
  "next_steps": ["<step 1>", "<step 2>", "<step 3>", ...]
}

Score guidelines:
- 70-100 = "strong" (clear alignment, strong evidence potential)
- 40-69 = "moderate" (some alignment but gaps exist)
- 0-39 = "weak" (significant gaps, not yet ready)

Be honest, specific, and actionable. Reference their actual field and goals.`;

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
          { role: "user", content: `Please assess this applicant's Global Talent Visa eligibility:\n\n${profileSummary}` },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from response (handle markdown code blocks)
    let assessment;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      assessment = JSON.parse(jsonMatch[1].trim());
    } catch {
      assessment = JSON.parse(content.trim());
    }

    return new Response(JSON.stringify({ assessment }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("GTV assessment error:", e);
    return new Response(JSON.stringify({ error: e.message || "Assessment failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
