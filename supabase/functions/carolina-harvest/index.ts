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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { source_type, url, content, title } = await req.json();

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
