-- Create carolina_memory table for chat messages and AI responses
CREATE TABLE IF NOT EXISTS public.carolina_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  response TEXT,
  emotion TEXT DEFAULT 'neutral',
  sentiment TEXT DEFAULT 'neutral',
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create carolina_intent_map for consciousness tracking
CREATE TABLE IF NOT EXISTS public.carolina_intent_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES public.carolina_memory(id) ON DELETE CASCADE,
  message TEXT,
  intent TEXT NOT NULL,
  curiosity_level NUMERIC DEFAULT 0,
  emotional_weight NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create carolina_learning table for topic mastery
CREATE TABLE IF NOT EXISTS public.carolina_learning (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL UNIQUE,
  mastery_level NUMERIC DEFAULT 0,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create carolina_research for autonomous research tasks
CREATE TABLE IF NOT EXISTS public.carolina_research (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority NUMERIC DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create error_logs for system errors
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message TEXT NOT NULL,
  stack_trace TEXT,
  severity TEXT DEFAULT 'error',
  source TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create lab_progress for admin learning modules
CREATE TABLE IF NOT EXISTS public.lab_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  status TEXT DEFAULT 'not_started',
  completion_percentage NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.carolina_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carolina_intent_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carolina_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carolina_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for carolina_memory
CREATE POLICY "Admins can manage carolina_memory" ON public.carolina_memory
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view carolina_memory" ON public.carolina_memory
FOR SELECT USING (true);

-- RLS policies for carolina_intent_map
CREATE POLICY "Admins can manage intent_map" ON public.carolina_intent_map
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view intent_map" ON public.carolina_intent_map
FOR SELECT USING (true);

-- RLS policies for carolina_learning
CREATE POLICY "Admins can manage learning" ON public.carolina_learning
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view learning" ON public.carolina_learning
FOR SELECT USING (true);

-- RLS policies for carolina_research
CREATE POLICY "Admins can manage research" ON public.carolina_research
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view research" ON public.carolina_research
FOR SELECT USING (true);

-- RLS policies for error_logs
CREATE POLICY "Admins can manage error_logs" ON public.error_logs
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can insert error_logs" ON public.error_logs
FOR INSERT WITH CHECK (true);

-- RLS policies for lab_progress
CREATE POLICY "Admins can manage lab_progress" ON public.lab_progress
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view lab_progress" ON public.lab_progress
FOR SELECT USING (true);