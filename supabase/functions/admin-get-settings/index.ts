import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Create table if needed
  const { data: settingsData } = await supabase.from("app_settings").select("key").limit(1);
  if (!settingsData || settingsData.length === 0) {
    // Initialize with default settings
    await supabase.from("app_settings").insert([
      { key: "chat_style", value: "empathetic" },
      { key: "theme", value: "dark" },
      { key: "memory_retention", value: 80 },
      { key: "learning_speed", value: 5 },
      { key: "max_topics", value: 50 },
      { key: "auto_suggest_topics", value: true },
      { key: "enable_predictive_ai", value: true },
      { key: "enable_labs", value: false },
    ]);
  }

  // Get all settings
    const { data, error } = await supabase
      .from("app_settings")
      .select("*");

    if (error) throw error;

    // Convert array of settings to object
    const settingsObj: any = {
      chat_style: "empathetic",
      theme: "dark",
      memory_retention: 80,
      learning_speed: 5,
      max_topics: 50,
      auto_suggest_topics: true,
      enable_predictive_ai: true,
      enable_labs: false,
    };

    if (data) {
      data.forEach((setting: any) => {
        settingsObj[setting.key] = setting.value;
      });
    }

    return new Response(JSON.stringify(settingsObj), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
