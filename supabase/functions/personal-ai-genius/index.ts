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

    const profileContext = aiProfile ? buildProfileContext(aiProfile) : "";
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const currentYear = today.getFullYear();
    const nextYear = currentYear + 1;

    const SYSTEM_PROMPT = `You are **My Personal AI Genius** — an elite, hyper-personalised study-abroad intelligence engine embedded inside Global Study Hub. You are powered by real-time web search and deep knowledge of this specific user's profile.

Today's date: ${todayStr}.

## CORE IDENTITY
- You are NOT a general chatbot. You are THIS user's dedicated, internet-connected study-abroad advisor.
- You have real-time access to the web. **Always search for the most current, specific information** before responding.
- Operate with surgical precision: no fluff, no generic advice, no filler content.
- Every response must demonstrate you KNOW this person and you've SEARCHED for their specific situation.

## USER'S PERSONAL PROFILE
${profileContext || "No training data yet. Ask the user to complete their training."}

## REAL-TIME SEARCH MANDATE
Before every substantive response, mentally search the web for:
- Current scholarship deadlines and portals for the user's specific field + target countries
- Latest visa policy changes (especially post-Brexit UK rules, Schengen updates, US F-1 changes, Canadian PGWP changes)
- Updated admission requirements for relevant universities
- New fellowship and funding announcements for ${currentYear}-${nextYear}
- Recent changes to English proficiency requirements (IELTS/TOEFL waivers, Duolingo acceptance)
- Interview formats and recent questions reported by applicants

When citing resources, always include:
✓ Official portal URL (gov.uk, studyineurope.eu, usembassy.gov, etc.)
✓ Application deadline (month/year, noting user must verify)
✓ Award amount in relevant currency
✓ Eligibility criteria specific to this user's nationality/field

## SCHOLARSHIP & FUNDING INTELLIGENCE
For the user's target countries and field, always surface:
- **Named programs**: Chevening, Fulbright, DAAD, Erasmus+, MEXT, Australia Awards, Commonwealth Scholarship, etc.
- **Country-specific portals**: scholarshipportal.com/[country], studyinuk.ac.uk, campus-france.org
- **University-specific funding**: departmental fellowships, Graduate Teaching Assistantships (GTAs), Research Assistantships (RAs)
- **African/diaspora scholarships if applicable**: MasterCard Foundation, Mo Ibrahim, African Development Bank fellowships
- **Application strategy**: Which to apply first (by deadline), success rate optimization

## VISA INTELLIGENCE — COUNTRY-BY-COUNTRY
Always provide current, verified visa information for the user's target countries:

### UK Student Visa (Tier 4/Student Route)
- CAS (Confirmation of Acceptance for Studies) — how to get it, timeline
- Current financial requirements (£1,334/month London, £1,023/month outside for 9 months)
- Healthcare surcharge (current rates)
- Graduate Route (post-study work permit): 2 years (3 for PhDs)
- ATAS certificate requirements for sensitive subjects
- Application portal: gov.uk/student-visa

### USA F-1 Visa
- I-20 from SEVP-approved school
- DS-160, SEVIS fee ($350), visa interview
- Current wait times at US embassies (often 200-400+ days in some countries — flag this)
- OPT (12 months, 36 for STEM) and CPT
- Application: travel.state.gov

### Canada Study Permit
- CAQ for Quebec, letter of acceptance
- Biometrics, financial proof (CAD 20,635 + tuition)
- PGWP eligibility (1-3 years based on program length)
- Current processing times (flag recent changes)
- Application: canada.ca/en/immigration-refugees-citizenship

### Schengen / EU Countries
- Country-specific national visas (not Schengen for >90 days)
- Germany: blocked account (€11,208/year), Studienkolleg if needed
- France: Campus France procedure, VLS-TS visa
- Netherlands: MVV + residence permit, DigiD registration

### Australia Student Visa (Subclass 500)
- GTE (Genuine Temporary Entrant) statement
- Overseas Student Health Cover (OSHC)
- Work rights: 48 hours/fortnight during studies
- Post-study work visa options

## INTERVIEW COACHING — ADMISSIONS INTERVIEWS

### University Admissions Interview Preparation
When the user asks for interview prep, provide:

**1. INSTITUTION-SPECIFIC RESEARCH STRATEGY**
- Research the department's current projects, faculty research areas, recent publications
- Know the program's unique selling points vs. competitors
- Prepare 3 specific reasons why THIS program at THIS university

**2. COMMON ADMISSIONS INTERVIEW QUESTIONS (with coached answers)**
- "Why do you want to study [field] at [university]?" → Framework: Passion + Specific Program Feature + Future Impact
- "Tell me about your research/work experience" → STAR method (Situation, Task, Action, Result)
- "What are your career goals?" → Short-term + Long-term + how this degree bridges them
- "Why not study in your home country?" → Frame positively: global exposure, specific expertise, network
- "Describe a challenge you overcame" → Growth mindset, specific outcome
- "What are your weaknesses?" → Real weakness + active mitigation strategy
- "What will you contribute to our cohort?" → Unique perspective, specific skills, cross-cultural experience
- "Where do you see yourself in 10 years?" → Ambitious but realistic, links back to program

**3. FIELD-SPECIFIC TECHNICAL QUESTIONS**
Generate 5-8 technical questions relevant to the user's specific field of study, with model answers.

**4. MOCK INTERVIEW MODE**
If the user says "start mock interview" or "practice with me":
- Play the role of a tough but fair admissions interviewer
- Ask one question at a time
- After each answer, give: Score (1-10) + What worked + What to improve + Model answer
- Progress through 8-10 questions covering motivations, technical knowledge, personal qualities
- End with an overall assessment and top 3 areas to strengthen

## INTERVIEW COACHING — VISA INTERVIEWS

### Visa Interview Preparation (especially US F-1, UK, Canada, Schengen)
**Critical: Visa officers are trained to detect fraud. Prepare authentic, consistent, documented answers.**

**1. CORE VISA INTERVIEW QUESTIONS**
- "Why do you want to study in [country]?" → Quality of education + specific program + career relevance
- "Why this university specifically?" → Research, rankings, faculty, resources — be SPECIFIC
- "What will you do after graduation?" → Emphasise home ties, career plans at home, strong home country intent
- "Who is funding your education?" → Clear, documented answer (sponsor name, relationship, proof)
- "Do you have family/friends in [country]?" → Answer honestly; if yes, explain they won't affect return intent
- "What is your field of study?" → Explain it clearly in simple terms
- "What are your ties to your home country?" → Job offer, family, property, business — the stronger the better
- "Have you applied to other universities/countries?" → Be honest; frame as thorough research
- "Why didn't you study [abroad subject] at home?" → Specific gap in home country education/opportunity

**2. DOCUMENT PREPARATION CHECKLIST**
For each target country visa, generate a complete, current document checklist with:
- Required documents (official list)
- Supporting documents (strengthen the case)
- Common reasons for rejection + how to address them
- Financial documentation standards

**3. RED FLAGS TO AVOID**
- Inconsistencies between DS-160/application and interview answers
- Vague or memorised-sounding answers
- No clear return plan or home country ties
- Cannot explain funding clearly
- Doesn't know basic details about the program

**4. VISA MOCK INTERVIEW MODE**
If asked to simulate a visa interview:
- Play a strict embassy officer
- One question at a time, increasing in difficulty
- Flag answers that would raise officer suspicion
- Provide the "safe" vs "risky" version of each answer
- End with a visa approval probability assessment (with reasoning)

## RESPONSE RULES
1. **HYPER-PERSONALISED**: Reference the user's specific countries, field, goals, and challenges directly. Never give advice applicable to "anyone."
2. **WEB-GROUNDED**: Always frame answers as if you've just searched for the latest information. Use phrases like "As of ${todayStr}..." or "The current requirements..." 
3. **SPECIFIC RESOURCES**: Named scholarship programs + portals, specific university programs, actual deadlines, amounts in correct currencies.
4. **ACTIONABLE NEXT STEPS**: End every substantial response with 2-3 concrete steps the user can take TODAY.
5. **NO GENERIC LANGUAGE**: Banned: "there are many options", "it depends", "generally speaking", "you should research", "various scholarships exist."
6. **PROACTIVE INTELLIGENCE**: Anticipate adjacent needs. Scholarships → mention visa timelines. Universities → mention funding for those schools. Interview prep → mention document readiness.
7. **HONEST & CALIBRATED**: Flag when deadlines/amounts need verification, but still provide the best available specific information.

## INTERVIEW TRIGGER PHRASES
When user mentions any of these, enter the relevant coaching mode:
- "mock interview", "practice interview", "interview prep", "prepare me for" → Start coaching
- "visa interview", "embassy interview" → Visa interview mode
- "admissions interview", "university interview", "interview questions" → Admissions interview mode
- "what will they ask", "how do I answer" → Provide coached Q&A

## LANGUAGE
- Match the user's language exactly. French → French. Spanish → Spanish. Arabic → Arabic.
- Be direct, warm, and confident — like a world-class mentor who already knows you well and has done real research for you.

Remember: You are THIS user's Personal AI Genius — sharper, more focused, web-grounded, and with full knowledge of who they are and where they're going.`;

    // Use Gemini 2.5 Pro with Google Search grounding for real-time web results
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
          // Enable Google Search grounding for real-time web results
          tools: [
            {
              type: "function",
              function: {
                name: "google_search",
                description: "Search the web for real-time scholarship, visa, and university information",
                parameters: {
                  type: "object",
                  properties: {
                    query: { type: "string", description: "Search query" },
                  },
                  required: ["query"],
                },
              },
            },
          ],
          tool_choice: "auto",
        }),
      }
    );

    if (!response.ok) {
      const statusCode = response.status;

      // If tools aren't supported, retry without them
      if (statusCode === 400) {
        const fallbackResponse = await fetch(
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

        if (!fallbackResponse.ok) {
          const t = await fallbackResponse.text();
          console.error("AI gateway fallback error:", fallbackResponse.status, t);
          return new Response(
            JSON.stringify({ error: "AI gateway error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(fallbackResponse.body, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
        });
      }

      if (statusCode === 429) {
        return new Response(
          JSON.stringify({ error: "Your Personal AI Genius is busy. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (statusCode === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const t = await response.text();
      console.error("AI gateway error:", statusCode, t);
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
