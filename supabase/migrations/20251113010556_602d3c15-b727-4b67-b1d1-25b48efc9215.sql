-- Create knowledge_sources table for multi-platform content harvesting
CREATE TABLE IF NOT EXISTS public.knowledge_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  url TEXT,
  sentiment TEXT,
  emotion TEXT,
  engagement_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trend_log table for autonomous trend detection
CREATE TABLE IF NOT EXISTS public.trend_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_topic TEXT NOT NULL,
  score NUMERIC NOT NULL,
  source TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  novelty_score NUMERIC DEFAULT 0,
  relevance_score NUMERIC DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create predictive_content_log table for proactive generation
CREATE TABLE IF NOT EXISTS public.predictive_content_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modality TEXT NOT NULL,
  content TEXT NOT NULL,
  predicted_trend TEXT,
  user_feedback INTEGER,
  engagement_metrics JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cultural_context table for evolving cultural intelligence
CREATE TABLE IF NOT EXISTS public.cultural_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_type TEXT NOT NULL,
  description TEXT NOT NULL,
  source TEXT,
  relevance_score NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trend_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictive_content_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cultural_context ENABLE ROW LEVEL SECURITY;

-- RLS Policies for knowledge_sources
CREATE POLICY "Anyone can view knowledge sources"
ON public.knowledge_sources FOR SELECT
USING (true);

CREATE POLICY "Admins can manage knowledge sources"
ON public.knowledge_sources FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for trend_log
CREATE POLICY "Anyone can view trends"
ON public.trend_log FOR SELECT
USING (true);

CREATE POLICY "Admins can manage trends"
ON public.trend_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for predictive_content_log
CREATE POLICY "Anyone can view predictive content"
ON public.predictive_content_log FOR SELECT
USING (true);

CREATE POLICY "Admins can manage predictive content"
ON public.predictive_content_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for cultural_context
CREATE POLICY "Anyone can view cultural context"
ON public.cultural_context FOR SELECT
USING (true);

CREATE POLICY "Admins can manage cultural context"
ON public.cultural_context FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for performance
CREATE INDEX idx_knowledge_sources_source_type ON public.knowledge_sources(source_type);
CREATE INDEX idx_knowledge_sources_created_at ON public.knowledge_sources(created_at DESC);
CREATE INDEX idx_trend_log_timestamp ON public.trend_log(timestamp DESC);
CREATE INDEX idx_trend_log_score ON public.trend_log(score DESC);
CREATE INDEX idx_predictive_content_log_timestamp ON public.predictive_content_log(timestamp DESC);