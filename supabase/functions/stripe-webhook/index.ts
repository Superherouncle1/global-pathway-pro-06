import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const signature = req.headers.get("stripe-signature");
    if (!signature) throw new Error("No Stripe signature found");

    const body = await req.text();
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET not configured");

    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata?.type === "credit_topup" && metadata?.user_id && metadata?.credits) {
        const userId = metadata.user_id;
        const creditsToAdd = parseInt(metadata.credits, 10);
        logStep("Processing credit top-up", { userId, creditsToAdd });

        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        // Get current credits
        const { data: existing, error: fetchErr } = await supabaseAdmin
          .from("user_credits")
          .select("credits")
          .eq("user_id", userId)
          .single();

        if (fetchErr) {
          logStep("Error fetching credits", { error: fetchErr.message });
          // Try inserting if no row exists
          const { error: insertErr } = await supabaseAdmin
            .from("user_credits")
            .insert({ user_id: userId, credits: creditsToAdd });
          if (insertErr) throw insertErr;
          logStep("Credits row created", { credits: creditsToAdd });
        } else {
          const newCredits = (existing?.credits ?? 0) + creditsToAdd;
          const { error: updateErr } = await supabaseAdmin
            .from("user_credits")
            .update({ credits: newCredits, updated_at: new Date().toISOString() })
            .eq("user_id", userId);
          if (updateErr) throw updateErr;
          logStep("Credits updated", { previous: existing.credits, new: newCredits });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
