import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logic, emotion, ethics, context } = await req.json();
    
    // Validate inputs (0-1 range)
    const validLogic = Math.max(0, Math.min(1, logic ?? 0.5));
    const validEmotion = Math.max(0, Math.min(1, emotion ?? 0.5));
    const validEthics = Math.max(0, Math.min(1, ethics ?? 0.5));

    // Decision weighting formula
    const decisionScore = validLogic * 0.5 + validEmotion * 0.3 + validEthics * 0.2;
    
    // Determine decision confidence
    const confidence = calculateConfidence(validLogic, validEmotion, validEthics);
    
    // Generate recommendation based on score
    const recommendation = generateRecommendation(decisionScore, context);

    console.log(`Decision calculated: score=${decisionScore.toFixed(2)}, confidence=${confidence.toFixed(2)}`);

    return new Response(
      JSON.stringify({ 
        decisionScore,
        confidence,
        recommendation,
        weights: {
          logic: validLogic,
          emotion: validEmotion,
          ethics: validEthics
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-decision:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateConfidence(logic: number, emotion: number, ethics: number): number {
  // Higher confidence when values are consistent
  const avg = (logic + emotion + ethics) / 3;
  const variance = (
    Math.pow(logic - avg, 2) + 
    Math.pow(emotion - avg, 2) + 
    Math.pow(ethics - avg, 2)
  ) / 3;
  
  // Lower variance = higher confidence
  return Math.max(0.1, 1 - Math.sqrt(variance));
}

function generateRecommendation(score: number, context?: string): string {
  if (score >= 0.8) return "Highly recommended action - strong alignment across all factors";
  if (score >= 0.6) return "Recommended action - good balance of logic, emotion, and ethics";
  if (score >= 0.4) return "Proceed with caution - consider reviewing factors";
  if (score >= 0.2) return "Not recommended - significant concerns detected";
  return "Strongly advised against - high risk across multiple factors";
}
