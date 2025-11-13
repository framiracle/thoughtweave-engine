-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table with proper security
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Carolina status table
CREATE TABLE public.carolina_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
  learning_mode TEXT DEFAULT 'active',
  health_status TEXT DEFAULT 'stable',
  tasks_completed INTEGER DEFAULT 0,
  ai_mood TEXT DEFAULT 'Calm',
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.carolina_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view Carolina status"
ON public.carolina_status FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can update Carolina status"
ON public.carolina_status FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- AI Growth table
CREATE TABLE public.ai_growth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_level NUMERIC(5,2) DEFAULT 12.00 CHECK (knowledge_level >= 0 AND knowledge_level <= 100),
  learning_rate NUMERIC(5,3) DEFAULT 0.100,
  evolution_tier TEXT DEFAULT 'Bronze',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_growth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI growth"
ON public.ai_growth FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage AI growth"
ON public.ai_growth FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- AI Lab Logs table
CREATE TABLE public.ai_lab_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_name TEXT NOT NULL,
  result_summary TEXT,
  success BOOLEAN DEFAULT false,
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_lab_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own lab logs"
ON public.ai_lab_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create lab logs"
ON public.ai_lab_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all lab logs"
ON public.ai_lab_logs FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Memory Log table
CREATE TABLE public.memory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  emoji TEXT,
  summary TEXT,
  content TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.memory_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified memories"
ON public.memory_log FOR SELECT
TO authenticated
USING (verified = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage memories"
ON public.memory_log FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Reflection Log table
CREATE TABLE public.reflection_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES public.memory_log(id) ON DELETE CASCADE,
  feedback TEXT NOT NULL,
  correction TEXT,
  reflection_result TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.reflection_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all reflections"
ON public.reflection_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage reflections"
ON public.reflection_log FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- AI Link Log table (for inter-AI communication)
CREATE TABLE public.ai_link_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.ai_link_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view AI link logs"
ON public.ai_link_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert AI link logs"
ON public.ai_link_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Activity Log table
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  performed_by TEXT,
  result TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity logs"
ON public.activity_log FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert activity logs"
ON public.activity_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- Seed initial Carolina status
INSERT INTO public.carolina_status (battery_level, learning_mode, health_status, ai_mood)
VALUES (85, 'active', 'optimal', 'Calm');

-- Seed initial AI growth
INSERT INTO public.ai_growth (knowledge_level, learning_rate, evolution_tier)
VALUES (12.00, 0.100, 'Bronze');

-- Update admin_users table to use new role system
UPDATE public.admin_users SET user_id = user_id WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = admin_users.user_id
);

-- Grant admin role to existing admins
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.admin_users
ON CONFLICT (user_id, role) DO NOTHING;