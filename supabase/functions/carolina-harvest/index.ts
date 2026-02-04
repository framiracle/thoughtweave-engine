import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const HarvestSchema = z.object({
  source_type: z.enum(['news', 'social', 'blog', 'research', 'article', 'other'], {
    errorMap: () => ({ message: 'Invalid source type' })
  }),
  url: z.string().url('Invalid URL format').max(2000, 'URL too long').optional(),
  content: z.string().min(10, 'Content too short').max(50000, 'Content too long (max 50000 characters)'),
  title: z.string().min(1, 'Title required').max(500, 'Title too long (max 500 characters)')
});

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
    endpoint: 'carolina-harvest',
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

    // Verify user is authenticated (admin only)
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

    // Rate limiting: 20 requests per hour for admins
    const rateLimit = await checkRateLimit(supabase, user.id, 20, 3600000);
    
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.', 
          retry_after: 3600 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const body = await req.json();
    const validationResult = HarvestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { source_type, url, content, title } = validationResult.data;

    console.log('Harvesting content from:', source_type);

    // Analyze sentiment and emotion using Lovable AI
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
            content: 'You are an expert at analyzing text for sentiment and emotional content. Respond with JSON only.'
          },
          {
            role: 'user',
            content: `Analyze this content and return JSON with: sentiment (positive/negative/neutral), emotion (joy/sadness/anger/fear/surprise/neutral), engagement_score (0-100).

Content: ${content.substring(0, 1000)}`
          }
        ],
        tools: [{
          type: "function",
          function: {
            name: "analyze_content",
            description: "Analyze content for sentiment and emotion",
            parameters: {
              type: "object",
              properties: {
                sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
                emotion: { type: "string", enum: ["joy", "sadness", "anger", "fear", "surprise", "neutral"] },
                engagement_score: { type: "number", minimum: 0, maximum: 100 }
              },
              required: ["sentiment", "emotion", "engagement_score"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "analyze_content" } }
      }),
    });

    if (!aiResponse.ok) {
      throw new Error('AI analysis failed');
    }

    const aiData = await aiResponse.json();
    const analysis = JSON.parse(
      aiData.choices[0]?.message?.tool_calls?.[0]?.function?.arguments || '{}'
    );

    // Store in knowledge_sources
    const { data: source, error } = await supabase
      .from('knowledge_sources')
      .insert({
        source_type,
        title,
        content,
        url,
        sentiment: analysis.sentiment || 'neutral',
        emotion: analysis.emotion || 'neutral',
        engagement_score: analysis.engagement_score || 0
      })
      .select()
      .single();

    if (error) throw error;

    // Update continuous learning log
    await supabase
      .from('continuous_learning_log' as any)
      .insert({
        topic: `${source_type}: ${title}`,
        source: url,
        status: 'completed',
        insights: `Sentiment: ${analysis.sentiment}, Emotion: ${analysis.emotion}`
      });

    return new Response(
      JSON.stringify({ success: true, source, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carolina-harvest:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
