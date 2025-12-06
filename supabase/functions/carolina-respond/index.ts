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
    const { message, memoryId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate AI response (placeholder - integrate with AI service)
    const response = generateResponse(message);

    // Update memory with response if memoryId provided
    if (memoryId) {
      await supabase
        .from('carolina_memory')
        .update({ response })
        .eq('id', memoryId);
    } else {
      // Create new memory entry
      await supabase
        .from('carolina_memory')
        .insert({ message, response, role: 'admin' });
    }

    console.log(`Carolina responded to: ${message.substring(0, 50)}...`);

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-respond:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateResponse(message: string): string {
  // Emotional Intelligence Engine (EIE) placeholder
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm Carolina, your AI assistant. How can I help you today?";
  }
  if (lowerMessage.includes('status')) {
    return "All systems operational. Brain battery at optimal levels. Ready to assist.";
  }
  if (lowerMessage.includes('learn')) {
    return "I'm always learning and evolving. My knowledge base expands with every interaction.";
  }
  if (lowerMessage.includes('help')) {
    return "I can help you with various tasks including analysis, learning tracking, and system management. What would you like to explore?";
  }
  
  return `I've processed your message: "${message}". How would you like me to proceed?`;
}
