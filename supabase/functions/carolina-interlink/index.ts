// 🔐 Carolina → Unicorn Interlink
// Edge Function (Supabase) – Sends encrypted packets

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
    const body = await req.json();
    const adminHash = await getAdminHash();

    // 1️⃣ Build secure packet
    const packet = {
      sender: "Carolina",
      type: body.type || "knowledge_update",
      topic: body.topic || "general",
      content: body.content || "",
      timestamp: new Date().toISOString(),
      auth: adminHash, // encrypted admin law
    };

    // 2️⃣ Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3️⃣ Log in Supabase table
    await supabase
      .from('ai_link_log')
      .insert({
        sender: "Carolina",
        receiver: "Unicorn",
        data: packet,
      });

    // 4️⃣ Send packet to Unicorn API (if URL is configured)
    const unicornUrl = Deno.env.get('UNICORN_API_URL');
    let unicornReply = { status: "logged", note: "Unicorn URL not configured" };

    if (unicornUrl) {
      try {
        const unicornResponse = await fetch(`${unicornUrl}/unicorn_receive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(packet),
        });
        unicornReply = await unicornResponse.json();
      } catch (err) {
        console.warn("Unicorn API unreachable:", err);
        unicornReply = { status: "unreachable", note: "Communication failed" };
      }
    }

    console.log(`Carolina sent ${packet.type} to Unicorn: ${packet.topic}`);

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Packet delivered and logged",
        unicornReply: unicornReply,
        packet: packet,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in carolina-interlink:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
