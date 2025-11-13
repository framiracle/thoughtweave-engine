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
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is admin
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { command, data } = await req.json();

    let result = {};

    switch (command) {
      case 'boost_growth':
        const gain = data?.gain || 5;
        const { data: currentGrowth } = await supabase
          .from('ai_growth')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const newLevel = Math.min(100, (currentGrowth?.knowledge_level || 0) + gain);
        let newTier = 'Bronze';
        if (newLevel > 90) newTier = 'Quantum';
        else if (newLevel > 70) newTier = 'Gold';
        else if (newLevel > 40) newTier = 'Silver';

        await supabase
          .from('ai_growth')
          .insert({
            knowledge_level: newLevel,
            evolution_tier: newTier,
            learning_rate: currentGrowth?.learning_rate || 0.1,
          });

        result = { level: newLevel, tier: newTier };
        break;

      case 'run_experiment':
        const experimentName = data?.name || `Experiment ${Date.now()}`;
        const success = Math.random() > 0.3; // 70% success rate
        
        await supabase
          .from('ai_lab_logs')
          .insert({
            experiment_name: experimentName,
            result_summary: success ? 'Experiment completed successfully' : 'Experiment failed - needs refinement',
            success: success,
            user_id: user.id,
          });

        result = { experiment: experimentName, success };
        break;

      case 'update_status':
        await supabase
          .from('carolina_status')
          .insert({
            battery_level: data?.battery_level || 100,
            learning_mode: data?.learning_mode || 'active',
            health_status: data?.health_status || 'optimal',
            ai_mood: data?.ai_mood || 'Calm',
          });

        result = { message: 'Status updated' };
        break;

      case 'reboot':
        await supabase
          .from('activity_log')
          .insert({
            action: 'System reboot initiated',
            performed_by: user.email,
            result: 'Success',
          });

        result = { message: 'System rebooted' };
        break;

      case 'backup':
        await supabase
          .from('activity_log')
          .insert({
            action: 'System backup created',
            performed_by: user.email,
            result: 'Success',
          });

        result = { message: 'Backup created successfully' };
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown command' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-admin:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});