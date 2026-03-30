import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const log = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[VERIFY-APPLE-RECEIPT] ${step}${d}`);
};

// Map Apple product IDs to credit amounts for top-ups
const TOPUP_CREDITS: Record<string, number> = {
  "com.globalgenie.credits.30": 30,
  "com.globalgenie.credits.80": 80,
  "com.globalgenie.credits.180": 180,
};

// Map Apple product IDs to subscription monthly credits
const SUBSCRIPTION_CREDITS: Record<string, number> = {
  "com.globalgenie.starter.monthly": 50,
  "com.globalgenie.professional.monthly": 150,
  "com.globalgenie.premium.monthly": 400,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    log("Function started");

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData } = await supabaseClient.auth.getUser(token);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    log("User authenticated", { userId: user.id });

    const body = await req.json();
    const { id: productId, transaction, type } = body;
    log("Receipt received", { productId, type, transactionId: transaction?.id });

    if (!productId || !transaction) {
      throw new Error("Missing product ID or transaction data");
    }

    // Validate with Apple's App Store Server API
    // For production, use https://buy.itunes.apple.com/verifyReceipt
    // For sandbox, use https://sandbox.itunes.apple.com/verifyReceipt
    const receiptData = transaction.appStoreReceipt || transaction.receipt;

    if (receiptData) {
      // Verify receipt with Apple
      const verifyUrl = Deno.env.get("APPLE_RECEIPT_ENV") === "production"
        ? "https://buy.itunes.apple.com/verifyReceipt"
        : "https://sandbox.itunes.apple.com/verifyReceipt";

      const appleSharedSecret = Deno.env.get("APPLE_SHARED_SECRET") || "";

      const appleResponse = await fetch(verifyUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          "receipt-data": receiptData,
          password: appleSharedSecret,
          "exclude-old-transactions": true,
        }),
      });

      const appleResult = await appleResponse.json();
      log("Apple verification response", { status: appleResult.status });

      // Status 0 = valid receipt
      // Status 21007 = sandbox receipt sent to production (retry with sandbox)
      if (appleResult.status !== 0 && appleResult.status !== 21007) {
        throw new Error(`Apple receipt validation failed with status: ${appleResult.status}`);
      }

      // If we got 21007, it's a sandbox receipt — still valid for testing
      if (appleResult.status === 21007) {
        log("Sandbox receipt detected, re-verifying with sandbox URL");
        const sandboxResponse = await fetch(
          "https://sandbox.itunes.apple.com/verifyReceipt",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              "receipt-data": receiptData,
              password: appleSharedSecret,
              "exclude-old-transactions": true,
            }),
          }
        );
        const sandboxResult = await sandboxResponse.json();
        if (sandboxResult.status !== 0) {
          throw new Error(`Sandbox receipt validation failed: ${sandboxResult.status}`);
        }
      }
    }

    // Process based on product type
    if (TOPUP_CREDITS[productId]) {
      // Credit top-up — add credits to user's balance
      const creditsToAdd = TOPUP_CREDITS[productId];
      log("Processing top-up", { creditsToAdd });

      const { data: existing } = await supabaseAdmin
        .from("user_credits")
        .select("credits")
        .eq("user_id", user.id)
        .single();

      const currentCredits = existing?.credits || 0;

      await supabaseAdmin
        .from("user_credits")
        .upsert(
          {
            user_id: user.id,
            credits: currentCredits + creditsToAdd,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      log("Credits added", { newTotal: currentCredits + creditsToAdd });
    } else if (SUBSCRIPTION_CREDITS[productId]) {
      // Subscription — set the user's credits to the tier amount
      const monthlyCredits = SUBSCRIPTION_CREDITS[productId];
      log("Processing subscription", { productId, monthlyCredits });

      await supabaseAdmin
        .from("user_credits")
        .upsert(
          {
            user_id: user.id,
            credits: monthlyCredits,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

      log("Subscription credits set", { credits: monthlyCredits });
    } else {
      log("Unknown product ID", { productId });
      throw new Error(`Unknown product: ${productId}`);
    }

    // Return success — cordova-plugin-purchase expects { ok: true }
    return new Response(JSON.stringify({ ok: true, data: { id: productId } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    log("ERROR", { message: msg });
    return new Response(JSON.stringify({ ok: false, data: { error: msg } }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // cordova-plugin-purchase expects 200 even on error
    });
  }
});
