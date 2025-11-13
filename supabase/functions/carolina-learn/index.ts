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
    const { topic, category = "general" } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if topic already exists in learning progress
    const { data: existing } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('source_id', topic)
      .single();

    if (existing) {
      // Update status to completed
      await supabase
        .from('learning_progress')
        .update({ status: 'completed', created_at: new Date().toISOString() })
        .eq('source_id', topic);
    } else {
      // Insert new learning progress
      await supabase
        .from('learning_progress')
        .insert({ source_id: topic, status: 'completed' });
    }

    // Log to continuous learning
    await supabase
      .from('continuous_learning_log')
      .insert({
        source_type: category,
        learned_content: `Improved understanding of: ${topic}`,
        reflection: `Carolina has deepened knowledge in ${category}`,
      });

    console.log(`Carolina learned about: ${topic} in ${category}`);

    return new Response(
      JSON.stringify({ message: `Carolina improved on ${topic}`, category }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-learn:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});