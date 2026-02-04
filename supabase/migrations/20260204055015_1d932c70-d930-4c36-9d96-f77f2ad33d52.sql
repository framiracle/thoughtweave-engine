-- =====================================================
-- SECURITY FIX: Add user isolation and fix RLS policies
-- =====================================================

-- 1. Create rate_limits table for rate limiting edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    identifier TEXT NOT NULL,
    endpoint TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow system to insert rate limit records
CREATE POLICY "System can insert rate limits"
ON public.rate_limits FOR INSERT
WITH CHECK (true);

-- Allow system to read rate limits
CREATE POLICY "System can read rate limits"
ON public.rate_limits FOR SELECT
USING (true);

-- Add index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_timestamp 
ON public.rate_limits(identifier, timestamp);

-- Auto-cleanup old rate limit records (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE timestamp < now() - interval '24 hours';
END;
$$;

-- 2. Add user_id column to chat_sessions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_sessions' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.chat_sessions ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Add index for user_id on chat_sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON public.chat_sessions(user_id);

-- 3. Add user_id column to chat_messages if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'chat_messages' 
        AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.chat_messages ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Add index for user_id on chat_messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);

-- 4. Drop existing permissive policies on chat_sessions
DROP POLICY IF EXISTS "Anyone can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can insert chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Anyone can delete chat sessions" ON public.chat_sessions;

-- 5. Create new user-scoped policies for chat_sessions
CREATE POLICY "Users can view own sessions"
ON public.chat_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can insert own sessions"
ON public.chat_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
ON public.chat_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
ON public.chat_sessions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Drop existing permissive policies on chat_messages
DROP POLICY IF EXISTS "Anyone can view chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can insert chat messages" ON public.chat_messages;

-- 7. Create new user-scoped policies for chat_messages
CREATE POLICY "Users can view own messages"
ON public.chat_messages FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    OR has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
        SELECT 1 FROM public.chat_sessions cs 
        WHERE cs.id = chat_messages.session_id 
        AND cs.user_id = auth.uid()
    )
);

CREATE POLICY "Users can insert own messages"
ON public.chat_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow admins to manage all messages
CREATE POLICY "Admins can manage all messages"
ON public.chat_messages FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 8. Fix profiles table - restrict to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));