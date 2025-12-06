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
    const { action, data } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let result;

    switch (action) {
      case 'generate':
        // Generate autonomous self-learning tasks (Dream Mode)
        result = await generateResearchTasks(supabase);
        break;
      
      case 'list':
        // List all research tasks
        const { data: tasks } = await supabase
          .from('carolina_research')
          .select('*')
          .order('priority', { ascending: false });
        result = { tasks };
        break;
      
      case 'complete':
        // Mark task as complete
        await supabase
          .from('carolina_research')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', data.taskId);
        result = { completed: true, taskId: data.taskId };
        break;
      
      case 'analyze':
        // Analyze research progress
        result = await analyzeResearchProgress(supabase);
        break;
      
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Research action completed: ${action}`);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in carolina-research:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateResearchTasks(supabase: any) {
  // Get current learning state to identify gaps
  const { data: learning } = await supabase
    .from('carolina_learning')
    .select('*')
    .order('mastery_level', { ascending: true })
    .limit(5);

  // Generate research tasks based on knowledge gaps
  const researchTopics = [
    { task_name: 'Deep Emotional Analysis', description: 'Improve emotional intelligence algorithms', priority: 3 },
    { task_name: 'Pattern Recognition Enhancement', description: 'Better pattern matching in conversations', priority: 2 },
    { task_name: 'Context Memory Optimization', description: 'Improve long-term context retention', priority: 3 },
    { task_name: 'Multi-Modal Learning', description: 'Integrate different learning modalities', priority: 1 },
    { task_name: 'Ethics Framework Update', description: 'Refine ethical decision-making weights', priority: 2 },
  ];

  // Add low mastery topics as research tasks
  if (learning) {
    learning.forEach((topic: any) => {
      if (topic.mastery_level < 50) {
        researchTopics.push({
          task_name: `Master: ${topic.topic}`,
          description: `Improve mastery from ${topic.mastery_level}% to higher levels`,
          priority: Math.ceil((100 - topic.mastery_level) / 20)
        });
      }
    });
  }

  // Insert new tasks
  const { data: insertedTasks, error } = await supabase
    .from('carolina_research')
    .insert(researchTopics.slice(0, 5))
    .select();

  if (error) throw error;

  return {
    generated: insertedTasks?.length || 0,
    tasks: insertedTasks
  };
}

async function analyzeResearchProgress(supabase: any) {
  const { data: allTasks } = await supabase
    .from('carolina_research')
    .select('*');

  if (!allTasks) return { error: 'No tasks found' };

  const completed = allTasks.filter((t: any) => t.status === 'completed').length;
  const pending = allTasks.filter((t: any) => t.status === 'pending').length;
  const inProgress = allTasks.filter((t: any) => t.status === 'in_progress').length;

  return {
    total: allTasks.length,
    completed,
    pending,
    inProgress,
    completionRate: allTasks.length > 0 ? (completed / allTasks.length * 100).toFixed(1) : 0,
    analyzedAt: new Date().toISOString()
  };
}
