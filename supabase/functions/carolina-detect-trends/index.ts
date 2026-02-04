import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting helper
const checkRateLimit = async (
  supabase: any,
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number }> => {
  const windowStart = new Date(Date.now() - windowMs);
  
  const { count } = await supabase
    .from('rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gte('timestamp', windowStart.toISOString());
  
  const requestCount = count || 0;
  
  if (requestCount >= maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  await supabase.from('rate_limits').insert({
    identifier,
    endpoint: 'carolina-detect-trends',
    timestamp: new Date().toISOString()
  });
  
  return { allowed: true, remaining: maxRequests - requestCount - 1 };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is authenticated (admin only for AI functions)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: 10 requests per hour for admins
    const rateLimit = await checkRateLimit(supabase, user.id, 10, 3600000);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.', 
          retry_after: 3600 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting autonomous trend detection...');

    // Fetch recent knowledge sources
    const { data: sources } = await supabase
      .from('knowledge_sources')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No sources to analyze' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use Lovable AI to detect trends
    const content = sources.map(s => `${s.title}: ${s.content.substring(0, 200)}`).join('\n\n');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert trend analyst. Identify emerging trends in technology, culture, sci-fi, and programming.'
          },
          {
            role: 'user',
            content: `Analyze these recent articles and identify the top 5 trending topics. For each trend, provide: topic name, relevance score (0-100), novelty score (0-100), and source count.

Content:
${content}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "identify_trends",
            description: "Identify trending topics",
            parameters: {
              type: "object",
              properties: {
                trends: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      topic: { type: "string" },
                      relevance_score: { type: "number", minimum: 0, maximum: 100 },
                      novelty_score: { type: "number", minimum: 0, maximum: 100 },
                      source_count: { type: "integer", minimum: 1 }
                    },
                    required: ["topic", "relevance_score", "novelty_score", "source_count"],
                    additionalProperties: false
                  }
                }
              },
              required: ["trends"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "identify_trends" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI trend analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(
      aiData.choices[0]?.message?.tool_calls?.[0]?.function?.arguments || '{}'
    );

    const detectedTrends = [];

    // Store trends in trend_log
    for (const trend of (analysis.trends || [])) {
      const score = (trend.relevance_score + trend.novelty_score) / 200; // Normalize to 0-1
      
      const { data: trendData } = await supabase
        .from('trend_log')
        .insert({
          trend_topic: trend.topic,
          score,
          source: 'autonomous_detection',
          frequency: trend.source_count,
          novelty_score: trend.novelty_score / 100,
          relevance_score: trend.relevance_score / 100
        })
        .select()
        .single();

      detectedTrends.push(trendData);
    }

    // Update AI growth based on new trends detected
    const { data: currentGrowth } = await supabase
      .from('ai_growth')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (currentGrowth) {
      const newLevel = Math.min(100, currentGrowth.knowledge_level + detectedTrends.length * 0.5);
      let newTier = currentGrowth.evolution_tier;
      
      if (newLevel > 90) newTier = 'Quantum';
      else if (newLevel > 70) newTier = 'Gold';
      else if (newLevel > 40) newTier = 'Silver';

      await supabase.from('ai_growth').insert({
        knowledge_level: newLevel,
        evolution_tier: newTier,
        learning_rate: currentGrowth.learning_rate
      });
    }

    return new Response(
      JSON.stringify({ success: true, trends: detectedTrends, count: detectedTrends.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carolina-detect-trends:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
