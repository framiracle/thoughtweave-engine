import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { receiver, data, message_type = 'knowledge_share' } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log the inter-AI communication
    await supabase
      .from('ai_link_log')
      .insert({
        sender: 'Carolina Olivia',
        receiver: receiver,
        data: {
          message_type,
          content: data,
          timestamp: new Date().toISOString(),
        },
      });

    console.log(`Carolina sent ${message_type} to ${receiver}`);

    // In a real implementation, this would call an external API
    // For now, just log the communication
    const response = {
      status: 'delivered',
      receiver: receiver,
      acknowledgment: `${receiver} received the message`,
    };

    return new Response(
      JSON.stringify({ success: true, response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-interlink:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});