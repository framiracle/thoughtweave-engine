-- Add settings table for encrypted admin law storage
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can read/write settings
CREATE POLICY "Only admins can manage app settings"
ON public.app_settings
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default admin law (will be encrypted by edge function)
INSERT INTO public.app_settings (key, value, encrypted)
VALUES ('admin_law_hash', '', false)
ON CONFLICT (key) DO NOTHING;

-- Add admin_sessions table for tracking
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only the session owner or admins can see sessions
CREATE POLICY "Users can view own sessions"
ON public.admin_sessions
FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Only system can insert sessions (via service role)
CREATE POLICY "System can insert sessions"
ON public.admin_sessions
FOR INSERT
WITH CHECK (true);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
ON public.admin_sessions
FOR DELETE
USING (auth.uid() = user_id);