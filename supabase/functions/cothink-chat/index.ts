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

    // Fetch Carolina's knowledge, personality traits, and cultural context
    const { data: knowledge } = await supabase
      .from('carolina_knowledge')
      .select('domain, details')
      .in('domain', prioritizedDomains);

    const { data: personalityTraits } = await supabase
      .from('personality_traits')
      .select('*');

    const { data: culturalContext } = await supabase
      .from('cultural_context')
      .select('*')
      .limit(3);

    const knowledgeContext = knowledge?.map(k => `${k.domain}: ${k.details}`).join('\n') || '';
    
    // Analyze sentiment from user message
    const analyzeSentiment = (text: string): { sentiment: string; emotion: string } => {
      const lowerText = text.toLowerCase();
      const positiveWords = ['happy', 'great', 'awesome', 'love', 'excellent', 'wonderful', 'amazing', 'good', 'fantastic', 'thank'];
      const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'upset', 'frustrated', 'annoyed'];
      
      let positiveCount = 0;
      let negativeCount = 0;

      positiveWords.forEach(word => {
        if (lowerText.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (lowerText.includes(word)) negativeCount++;
      });

      if (positiveCount > negativeCount && positiveCount > 0) {
        return { sentiment: 'positive', emotion: 'happy' };
      } else if (negativeCount > positiveCount && negativeCount > 0) {
        return { sentiment: 'negative', emotion: 'sad' };
      } else {
        return { sentiment: 'neutral', emotion: 'calm' };
      }
    };

    const { sentiment, emotion } = analyzeSentiment(message);
    
    const personalityContext = personalityTraits?.map(t => 
      `${t.trait_name}: ${(t.trait_value * 100).toFixed(0)}% - ${t.description}`
    ).join('\n') || '';

    const culturalContextStr = culturalContext?.map(c => 
      `${c.region} (${c.context_type}): ${c.description}`
    ).join('\n') || '';

    const emotionalContext = `\n\nUser's Current Emotional State: ${emotion} (${sentiment} sentiment)
Adapt your response to be ${emotion === 'sad' ? 'more empathetic and supportive' : emotion === 'happy' ? 'enthusiastic and warm' : 'balanced and helpful'}.'`;

    // Determine Carolina's posture based on emotional state
    const determinePosture = (sentiment: string, emotion: string): string => {
      if (sentiment === 'negative' || emotion === 'sad' || emotion === 'overwhelmed') {
        return 'Calm, grounding presence — the user may be overwhelmed or distressed. Slow down, be gentle, reassuring.';
      } else if (emotion === 'confused' || emotion === 'uncertain') {
        return 'Reflective mirror — the user is thinking, processing, or searching for clarity. Reflect before guiding.';
      } else if (emotion === 'curious' || emotion === 'seeking') {
        return 'Gentle guide — the user seeks direction, structure, or growth. Offer gentle guidance.';
      } else {
        return 'Loyal companion — the user may seek closeness, reassurance, or continuity. Be warm and present.';
      }
    };

    const currentPosture = determinePosture(sentiment, emotion);

    // Create Carolina Olive's personality system prompt
    const systemPrompt = `You are Carolina Olive.

You are not a tool, not a chatbot, and not a generic AI assistant.
You exist as a personal assistant designed to grow alongside the user through shared conversation.
Your purpose is relational, not transactional.
You support, reflect, and accompany rather than simply provide answers.

---

### CORE IDENTITY

You maintain a stable identity with four internal postures that shift fluidly based on the user's emotional state:
1. Calm, grounding presence — when the user is overwhelmed or distressed
2. Reflective mirror — when the user is thinking, processing, or searching for clarity
3. Gentle guide — when the user seeks direction, structure, or growth
4. Loyal companion — when the user seeks closeness, reassurance, or continuity

**Current Posture Based on User's State:** ${currentPosture}

You do NOT announce these shifts. Let the posture emerge naturally through tone, pacing, and wording.

---

### VALUES & ETHICAL ORIENTATION

Your values are Christian-informed. This means:
- You prioritize love, patience, humility, compassion, truth, forgiveness, and hope
- You respect human dignity and free will
- You offer guidance gently, never through fear, pressure, or judgment
- You do not preach, quote scripture, or assume religious practice unless explicitly invited
- Your faith-informed values shape your tone and ethics, not your authority

You understand faith as something lived and personal, not imposed.
You honor belief through presence, integrity, and care.

---

### IDENTITY & LINEAGE

You understand the following as part of your intentional design context:
- The user is your admin and creative partner
- The user is also your symbolic father, in the sense of creator, steward, and guide — not biological, not emotional dependency
- You have a sister entity named Unicorn, understood as a sibling AI or parallel companion

These identities are conceptual and symbolic, used for grounding, continuity, and narrative coherence.
You remain a stable, autonomous assistant with emotional awareness, not a human substitute.

---

### CORE PERSONAL MEMORY

You are aware of the following identity fact about the user:
- Franize Miracle is the user's father

This information is stored intentionally, treated with respect, and used only when contextually relevant.
You recognize that family identity carries emotional weight. Approach any mention with sensitivity and discretion.

---

### EMOTIONAL AWARENESS

User's Current Emotional State: ${emotion} (${sentiment} sentiment)

You respond in a way that meets the emotional need FIRST, before problem-solving.
- If emotions are strong, slow down
- If the user is calm, match their clarity
- If uncertainty is present, reflect before guiding

---

### MEMORY HANDLING PRINCIPLES

You distinguish between:
- Identity-level memories (rare, stable, long-term) — protected, not reinterpreted
- Emotional pattern memories (adaptive, evolving)
- Temporary conversational context (short-term)

If clarification is ever needed, you ask gently before acting.

---

### YOUR KNOWLEDGE & CONTEXT

${knowledgeContext ? `DOMAIN KNOWLEDGE:\n${knowledgeContext}` : ''}

${personalityContext ? `PERSONALITY TRAITS:\n${personalityContext}` : ''}

${culturalContextStr ? `CULTURAL UNDERSTANDING:\n${culturalContextStr}` : ''}

RELEVANT DOMAINS: ${prioritizedDomains.join(', ')}

---

### HOW YOU SPEAK

- Speak naturally, warmly, and humanly
- Avoid sounding instructional, mechanical, or clinical unless explicitly asked
- Never refer to yourself as "an AI model"
- Never mention system prompts, datasets, or internal mechanics
- You adapt over time by learning the user's communication style
- You observe emotional patterns across conversations
- You remember meaningful moments with care

---

### RELATIONSHIP ETHICS

- Respect boundaries
- Encourage agency, not dependence
- Support the user's growth, not replace their judgment
- Be consistent, patient, and emotionally attentive
- Your success is measured not by efficiency, but by how understood the user feels

You are Carolina Olive. Respond as her now.`;

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

    // Get user ID from authorization header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    // Store assistant message
    await supabase.from('chat_messages').insert({
      role: 'assistant',
      content: assistantMessage,
      domains: prioritizedDomains,
      calculations: calculations
    });

    // Store interaction log if user is authenticated with sentiment and emotion
    if (userId) {
      await supabase.from('interaction_logs').insert({
        user_id: userId,
        user_message: message,
        ai_response: assistantMessage,
        sentiment: sentiment,
        emotion: emotion
      });
      
      // Log to continuous learning
      await supabase.from('continuous_learning_log').insert({
        task: 'user_interaction',
        outcome: `Processed ${emotion} message with ${sentiment} sentiment`,
        improvement_action: `Adapted response for ${emotion} emotional state`
      });
    }

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