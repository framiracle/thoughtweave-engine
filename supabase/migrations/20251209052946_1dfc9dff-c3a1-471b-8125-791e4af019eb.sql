-- Create chat_sessions table for managing conversations
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL DEFAULT 'New Chat',
  emoji TEXT DEFAULT '✨',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add session_id to chat_messages if it doesn't exist
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE;

-- Enable RLS on chat_sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Policies for chat_sessions (admin-only system, allow all)
CREATE POLICY "Anyone can view chat sessions" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update chat sessions" ON public.chat_sessions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete chat sessions" ON public.chat_sessions FOR DELETE USING (true);

-- Create index for faster message lookups by session
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON public.chat_messages(session_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_chat_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating timestamp
DROP TRIGGER IF EXISTS update_chat_sessions_timestamp ON public.chat_sessions;
CREATE TRIGGER update_chat_sessions_timestamp
  BEFORE UPDATE ON public.chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_chat_session_timestamp();