-- Create memory_entries table for storing AI memory
CREATE TABLE IF NOT EXISTS public.memory_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  domain TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('short-term', 'long-term')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.memory_entries ENABLE ROW LEVEL SECURITY;

-- Public read access for memory entries
CREATE POLICY "Anyone can view memory entries"
  ON public.memory_entries
  FOR SELECT
  USING (true);

-- Public insert access for memory entries
CREATE POLICY "Anyone can insert memory entries"
  ON public.memory_entries
  FOR INSERT
  WITH CHECK (true);

-- Create chat_messages table for storing conversation history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  domains JSONB,
  calculations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read access for chat messages
CREATE POLICY "Anyone can view chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (true);

-- Public insert access for chat messages
CREATE POLICY "Anyone can insert chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_memory_entries_domain ON public.memory_entries(domain);
CREATE INDEX IF NOT EXISTS idx_memory_entries_timestamp ON public.memory_entries(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);