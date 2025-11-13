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
    const { message } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Simple emotion and sentiment analysis
    let emotion = "neutral";
    let sentiment = "neutral";

    const lowerMessage = message.toLowerCase();
    
    // Emotion detection
    if (lowerMessage.includes("sad") || lowerMessage.includes("cry") || lowerMessage.includes("depressed")) {
      emotion = "sad";
      sentiment = "negative";
    } else if (lowerMessage.includes("happy") || lowerMessage.includes("joy") || lowerMessage.includes("excited")) {
      emotion = "happy";
      sentiment = "positive";
    } else if (lowerMessage.includes("angry") || lowerMessage.includes("mad") || lowerMessage.includes("frustrated")) {
      emotion = "angry";
      sentiment = "negative";
    } else if (lowerMessage.includes("love") || lowerMessage.includes("grateful") || lowerMessage.includes("thank")) {
      emotion = "loving";
      sentiment = "positive";
    } else if (lowerMessage.includes("scared") || lowerMessage.includes("afraid") || lowerMessage.includes("worried")) {
      emotion = "fearful";
      sentiment = "negative";
    }

    console.log(`Analyzed message: emotion=${emotion}, sentiment=${sentiment}`);

    return new Response(
      JSON.stringify({ emotion, sentiment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-analyze:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});