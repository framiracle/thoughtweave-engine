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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Carolina's current status
    const { data: status } = await supabase
      .from('carolina_status')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get AI growth data
    const { data: growth } = await supabase
      .from('ai_growth')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Get recent activity counts
    const { count: totalLogs } = await supabase
      .from('interaction_logs')
      .select('*', { count: 'exact', head: true });

    const { count: labExperiments } = await supabase
      .from('ai_lab_logs')
      .select('*', { count: 'exact', head: true });

    const { count: totalMemories } = await supabase
      .from('memory_log')
      .select('*', { count: 'exact', head: true });

    return new Response(
      JSON.stringify({
        status: status || { health_status: 'unknown', battery_level: 0 },
        growth: growth || { knowledge_level: 0, evolution_tier: 'Bronze' },
        stats: {
          totalLogs: totalLogs || 0,
          labExperiments: labExperiments || 0,
          totalMemories: totalMemories || 0,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-status:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});