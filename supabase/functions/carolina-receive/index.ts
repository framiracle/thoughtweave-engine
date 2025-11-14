// 🦄 Receive Unicorn AI Feedback
// Validates admin law → merges back into Carolina's brain

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ADMIN_SECRET = "Ayomide1.";

// Convert hash to hex
function toHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate admin hash
async function getAdminHash(): Promise<string> {
  const msgBuffer = new TextEncoder().encode(ADMIN_SECRET);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  return toHex(hashBuffer);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data = await req.json();
    const adminHash = await getAdminHash();

    // 1️⃣ Validate Admin Law
    if (data.auth !== adminHash) {
      console.warn("Admin Law validation failed - unauthorized interlink attempt");
      return new Response(
        JSON.stringify({
          status: "blocked",
          reason: "Admin Law validation failed",
        }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2️⃣ Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3️⃣ Log feedback into database
    await supabase
      .from('ai_link_log')
      .insert({
        sender: "Unicorn",
        receiver: "Carolina",
        data: data,
      });

    // 4️⃣ Update Carolina's memory
    await supabase
      .from('carolina_memory')
      .insert({
        message: "[UNICORN SYNC]",
        response: data.insight || data.content || "No insight provided",
        emotion: "sync",
        sentiment: "positive",
      });

    console.log("🟦 Sync with Unicorn complete. Admin Law validated.");

    // 5️⃣ Response back to Unicorn (success)
    return new Response(
      JSON.stringify({
        status: "success",
        message: "🟦 Sync with Unicorn complete. New shared insight integrated successfully. Admin Law validated. Cognitive synergy level increased.",
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in carolina-receive:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
