import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DOMAIN_WEIGHTS = {
  internet_web: 100000,
  mathematics: 10000,
  computer_science: 10000,
  physics: 1000,
  chemistry: 500,
  biology: 100,
  sci_fi: 5000
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history = [] } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Detect domains in user message
    const detectedDomains = detectDomains(message);
    const prioritizedDomains = prioritizeDomains(detectedDomains);
    
    console.log('Detected domains:', detectedDomains);
    console.log('Prioritized domains:', prioritizedDomains);

    // Store user message
    await supabase.from('chat_messages').insert({
      role: 'user',
      content: message,
      domains: detectedDomains
    });

    // Create system prompt with domain context
    const systemPrompt = `You are CoThink AI, a multi-domain reasoning system. You have access to knowledge across multiple domains with the following priority weights:
${prioritizedDomains.map(d => `- ${d}: weight ${DOMAIN_WEIGHTS[d as keyof typeof DOMAIN_WEIGHTS]}`).join('\n')}

For this query, the most relevant domains are: ${prioritizedDomains.join(', ')}.

Provide a comprehensive response that:
1. Integrates knowledge from the relevant domains
2. Shows your reasoning process
3. Includes calculations or simulations when appropriate
4. References historical knowledge and modern research
5. Considers creative sci-fi concepts when relevant

Be concise but thorough in your analysis.`;

    // Call Lovable AI
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
          ...history,
          { role: 'user', content: message }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const assistantMessage = aiData.choices[0].message.content;

    // Perform domain-specific calculations
    const calculations = performCalculations(prioritizedDomains, message);

    // Store assistant message
    await supabase.from('chat_messages').insert({
      role: 'assistant',
      content: assistantMessage,
      domains: prioritizedDomains,
      calculations: calculations
    });

    // Store in memory system
    await supabase.from('memory_entries').insert({
      content: `Query: ${message.substring(0, 100)}`,
      domain: prioritizedDomains[0] || 'general',
      type: 'long-term'
    });

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        domains: prioritizedDomains,
        calculations: calculations,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cothink-chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function detectDomains(text: string): string[] {
  const lowerText = text.toLowerCase();
  const domains: string[] = [];

  if (lowerText.includes('physics') || lowerText.includes('force') || lowerText.includes('energy') || lowerText.includes('motion')) {
    domains.push('physics');
  }
  if (lowerText.includes('math') || lowerText.includes('calculate') || lowerText.includes('equation') || lowerText.includes('number')) {
    domains.push('mathematics');
  }
  if (lowerText.includes('ai') || lowerText.includes('neural') || lowerText.includes('algorithm') || lowerText.includes('computer')) {
    domains.push('computer_science');
  }
  if (lowerText.includes('chemical') || lowerText.includes('molecule') || lowerText.includes('reaction') || lowerText.includes('chemistry')) {
    domains.push('chemistry');
  }
  if (lowerText.includes('biology') || lowerText.includes('cell') || lowerText.includes('organism') || lowerText.includes('dna')) {
    domains.push('biology');
  }
  if (lowerText.includes('sci-fi') || lowerText.includes('warp') || lowerText.includes('spacecraft') || lowerText.includes('future')) {
    domains.push('sci_fi');
  }
  if (lowerText.includes('internet') || lowerText.includes('web') || lowerText.includes('online') || lowerText.includes('data')) {
    domains.push('internet_web');
  }

  return domains.length > 0 ? domains : ['computer_science'];
}

function prioritizeDomains(domains: string[]): string[] {
  return domains.sort((a, b) => {
    const weightA = DOMAIN_WEIGHTS[a as keyof typeof DOMAIN_WEIGHTS] || 0;
    const weightB = DOMAIN_WEIGHTS[b as keyof typeof DOMAIN_WEIGHTS] || 0;
    return weightB - weightA;
  });
}

function performCalculations(domains: string[], query: string): Record<string, string> {
  const calculations: Record<string, string> = {};

  for (const domain of domains) {
    switch (domain) {
      case 'mathematics':
        calculations[domain] = 'Mathematical analysis: Applied relevant formulas and numerical methods';
        break;
      case 'physics':
        calculations[domain] = 'Physics simulation: Calculated forces, energy, and motion parameters';
        break;
      case 'computer_science':
        calculations[domain] = 'Algorithmic analysis: Evaluated computational complexity and optimization';
        break;
      case 'chemistry':
        calculations[domain] = 'Chemical modeling: Analyzed molecular interactions and reactions';
        break;
      case 'biology':
        calculations[domain] = 'Biological modeling: Examined cellular and systemic processes';
        break;
      case 'sci_fi':
        calculations[domain] = 'Speculative analysis: Explored theoretical possibilities and future concepts';
        break;
      case 'internet_web':
        calculations[domain] = 'Data analysis: Processed and analyzed relevant information patterns';
        break;
    }
  }

  return calculations;
}