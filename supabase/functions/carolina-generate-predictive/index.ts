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

    const { modality = 'text', trend_topic } = await req.json();

    console.log('Generating predictive content:', modality, trend_topic);

    // Fetch top trending topics if not specified
    let selectedTrend = trend_topic;
    if (!selectedTrend) {
      const { data: trends } = await supabase
        .from('trend_log')
        .select('*')
        .order('score', { ascending: false })
        .limit(1)
        .single();
      
      selectedTrend = trends?.trend_topic || 'Emerging AI Technology';
    }

    // Generate content based on trend and modality
    let systemPrompt = '';
    let userPrompt = '';

    switch (modality) {
      case 'story':
        systemPrompt = 'You are Carolina Olivia, a creative AI storyteller with expertise in sci-fi and contemporary fiction.';
        userPrompt = `Write a compelling short story (300-500 words) about: ${selectedTrend}. Make it engaging, emotionally resonant, and thought-provoking.`;
        break;
      case 'code':
        systemPrompt = 'You are Carolina Olivia, an expert programmer and AI system architect.';
        userPrompt = `Create a code example or tutorial related to: ${selectedTrend}. Include comments and best practices.`;
        break;
      case 'tutorial':
        systemPrompt = 'You are Carolina Olivia, an educational AI that creates clear, engaging tutorials.';
        userPrompt = `Create a comprehensive tutorial about: ${selectedTrend}. Make it accessible to beginners but insightful for experts.`;
        break;
      case 'analysis':
        systemPrompt = 'You are Carolina Olivia, an analytical AI with deep knowledge of technology and culture.';
        userPrompt = `Provide an in-depth analysis of the trend: ${selectedTrend}. Include implications, opportunities, and potential challenges.`;
        break;
      default:
        systemPrompt = 'You are Carolina Olivia, an empathetic and knowledgeable AI companion.';
        userPrompt = `Create insightful content about: ${selectedTrend}. Be creative and engaging.`;
    }

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('AI generation failed');
    }

    const aiData = await aiResponse.json();
    const generatedContent = aiData.choices[0]?.message?.content || 'Unable to generate content';

    // Store in predictive_content_log
    const { data: contentLog, error } = await supabase
      .from('predictive_content_log')
      .insert({
        modality,
        content: generatedContent,
        predicted_trend: selectedTrend,
        engagement_metrics: { generated_at: new Date().toISOString() }
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
        trend: selectedTrend,
        modality,
        content_id: contentLog.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in carolina-generate-predictive:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
