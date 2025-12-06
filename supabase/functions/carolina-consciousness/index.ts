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
    const { memoryId, message, intent, curiosity_level, emotional_weight } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Analyze intent if not provided
    const analyzedIntent = intent || analyzeIntent(message);
    const analyzedCuriosity = curiosity_level ?? calculateCuriosity(message);
    const analyzedWeight = emotional_weight ?? calculateEmotionalWeight(message);

    // Insert consciousness log
    const { data, error } = await supabase
      .from('carolina_intent_map')
      .insert({
        message_id: memoryId || null,
        message,
        intent: analyzedIntent,
        curiosity_level: analyzedCuriosity,
        emotional_weight: analyzedWeight,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Consciousness logged: intent=${analyzedIntent}, curiosity=${analyzedCuriosity}`);

    return new Response(
      JSON.stringify({ 
        result: "Consciousness logged",
        data: {
          intent: analyzedIntent,
          curiosity_level: analyzedCuriosity,
          emotional_weight: analyzedWeight,
          id: data.id
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-consciousness:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function analyzeIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('?')) return 'inquiry';
  if (lowerMessage.includes('help') || lowerMessage.includes('assist')) return 'assistance';
  if (lowerMessage.includes('learn') || lowerMessage.includes('teach')) return 'learning';
  if (lowerMessage.includes('create') || lowerMessage.includes('make')) return 'creation';
  if (lowerMessage.includes('analyze') || lowerMessage.includes('check')) return 'analysis';
  if (lowerMessage.includes('remember') || lowerMessage.includes('recall')) return 'memory';
  
  return 'general';
}

function calculateCuriosity(message: string): number {
  let score = 0.5;
  
  if (message.includes('?')) score += 0.2;
  if (message.includes('why') || message.includes('how')) score += 0.15;
  if (message.includes('what if')) score += 0.1;
  if (message.length > 100) score += 0.05;
  
  return Math.min(1, score);
}

function calculateEmotionalWeight(message: string): number {
  const lowerMessage = message.toLowerCase();
  let weight = 0.3;
  
  const emotionalWords = ['love', 'hate', 'fear', 'happy', 'sad', 'angry', 'excited', 'worried'];
  emotionalWords.forEach(word => {
    if (lowerMessage.includes(word)) weight += 0.1;
  });
  
  if (message.includes('!')) weight += 0.1;
  
  return Math.min(1, weight);
}
