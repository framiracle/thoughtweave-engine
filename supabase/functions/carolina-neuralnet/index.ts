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
    const { action, data } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    switch (action) {
      case 'standardize':
        // Standardize knowledge atoms for multi-AI networking
        result = standardizeKnowledge(data);
        break;
      
      case 'encode':
        // Encode data for neural network transmission
        result = encodeForTransmission(data);
        break;
      
      case 'decode':
        // Decode received neural data
        result = decodeTransmission(data);
        break;
      
      case 'analyze_pattern':
        // Analyze patterns in knowledge base
        const { data: memories } = await supabase
          .from('carolina_memory')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        result = analyzePatterns(memories || []);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`NeuralNet processed action: ${action}`);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-neuralnet:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function standardizeKnowledge(data: any): any {
  return {
    format: 'carolina-v2210',
    timestamp: new Date().toISOString(),
    atoms: Array.isArray(data) ? data.map(item => ({
      id: crypto.randomUUID(),
      content: item.content || item,
      weight: item.weight || 1,
      category: item.category || 'general'
    })) : [{
      id: crypto.randomUUID(),
      content: data,
      weight: 1,
      category: 'general'
    }]
  };
}

function encodeForTransmission(data: any): string {
  const jsonStr = JSON.stringify(data);
  return btoa(jsonStr);
}

function decodeTransmission(encodedData: string): any {
  try {
    const jsonStr = atob(encodedData);
    return JSON.parse(jsonStr);
  } catch {
    return { error: 'Failed to decode transmission' };
  }
}

function analyzePatterns(memories: any[]): any {
  const emotions: Record<string, number> = {};
  const sentiments: Record<string, number> = {};
  
  memories.forEach(memory => {
    if (memory.emotion) {
      emotions[memory.emotion] = (emotions[memory.emotion] || 0) + 1;
    }
    if (memory.sentiment) {
      sentiments[memory.sentiment] = (sentiments[memory.sentiment] || 0) + 1;
    }
  });

  return {
    totalMemories: memories.length,
    emotionDistribution: emotions,
    sentimentDistribution: sentiments,
    analyzedAt: new Date().toISOString()
  };
}
