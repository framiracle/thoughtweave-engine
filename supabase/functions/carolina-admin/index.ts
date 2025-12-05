import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Admin law hash - this is the SHA-256 hash of "Ayomide1."
// In production, store this in environment variables
const ADMIN_LAW_HASH = "a8f5f167f44f4964e6c998dee827110c"; // placeholder - will be properly hashed

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError?.message || "No user found");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Verify user has admin role using the secure has_role function
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (roleError || !roleData) {
      console.error("Role check failed:", roleError?.message || "Not an admin");
      
      // Log unauthorized access attempt
      await supabase.from('activity_log').insert({
        action: 'Unauthorized admin access attempt',
        performed_by: user.email,
        result: 'Denied',
      });

      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { command, data, adminLawOverride } = await req.json();

    // Verify admin law if override is provided
    if (adminLawOverride) {
      // Hash the provided override and compare
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(adminLawOverride);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Store the expected hash in environment variable in production
      const expectedHash = Deno.env.get('ADMIN_LAW_HASH') || ADMIN_LAW_HASH;
      
      if (hashHex !== expectedHash) {
        console.error("Invalid admin law override attempt");
        await supabase.from('activity_log').insert({
          action: 'Invalid admin law override attempt',
          performed_by: user.email,
          result: 'Denied',
        });
        return new Response(JSON.stringify({ error: "Invalid admin law" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    let result = {};

    // Log all admin actions
    const logAction = async (action: string, actionResult: string) => {
      await supabase.from('activity_log').insert({
        action,
        performed_by: user.email,
        result: actionResult,
      });
    };

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

        await logAction(`Boosted AI growth by ${gain}`, `New level: ${newLevel}, Tier: ${newTier}`);
        result = { level: newLevel, tier: newTier };
        break;

      case 'run_experiment':
        const experimentName = data?.name || `Experiment ${Date.now()}`;
        const success = Math.random() > 0.3;
        
        await supabase
          .from('ai_lab_logs')
          .insert({
            experiment_name: experimentName,
            result_summary: success ? 'Experiment completed successfully' : 'Experiment failed - needs refinement',
            success: success,
            user_id: user.id,
          });

        await logAction(`Ran experiment: ${experimentName}`, success ? 'Success' : 'Failed');
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

        await logAction('Updated Carolina status', 'Success');
        result = { message: 'Status updated' };
        break;

      case 'reboot':
        await logAction('System reboot initiated', 'Success');
        result = { message: 'System rebooted' };
        break;

      case 'backup':
        await logAction('System backup created', 'Success');
        result = { message: 'Backup created successfully' };
        break;

      case 'get_activity_logs':
        const { data: logs } = await supabase
          .from('activity_log')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50);
        result = { logs };
        break;

      case 'verify_admin_law':
        // This command verifies if the provided admin law is correct
        if (!adminLawOverride) {
          return new Response(JSON.stringify({ error: "Admin law required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        await logAction('Admin law verification', 'Success');
        result = { verified: true, message: 'Admin law verified' };
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
