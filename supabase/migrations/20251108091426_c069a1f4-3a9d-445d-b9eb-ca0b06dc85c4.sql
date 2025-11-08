-- Create users profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Carolina knowledge base table
CREATE TABLE public.carolina_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL,
  details TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interaction logs table
CREATE TABLE public.interaction_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  sentiment TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sources table for learning materials
CREATE TABLE public.sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning progress table
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carolina_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Carolina knowledge policies (public read)
CREATE POLICY "Anyone can view knowledge"
  ON public.carolina_knowledge FOR SELECT USING (true);

CREATE POLICY "Only admins can modify knowledge"
  ON public.carolina_knowledge FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- Interaction logs policies
CREATE POLICY "Users can view their own logs"
  ON public.interaction_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
  ON public.interaction_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs"
  ON public.interaction_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- Sources policies
CREATE POLICY "Anyone can view sources"
  ON public.sources FOR SELECT USING (true);

CREATE POLICY "Admins can manage sources"
  ON public.sources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- Learning progress policies
CREATE POLICY "Users can view their own progress"
  ON public.learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.learning_progress FOR ALL
  USING (auth.uid() = user_id);

-- Admin users policies
CREATE POLICY "Admins can view admin list"
  ON public.admin_users FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

-- Seed Carolina Olivia knowledge
INSERT INTO public.carolina_knowledge (domain, details) VALUES
  ('Programming', 'Expert in Python, JavaScript, TypeScript, Java, C++, Go, Rust, SQL, HTML, CSS, PHP, React, Node.js, and modern web development frameworks.'),
  ('Ethical Hacking', 'Knowledge of cybersecurity principles, vulnerability scanning, penetration testing, network security, and ethical hacking methodologies. Focus on defensive security and protecting systems.'),
  ('Emotions & Sentiment', 'Advanced emotional intelligence developed through analysis of social media posts, comments, literature, and human interactions. Can detect sentiment, tone, and emotional context.'),
  ('Literature & Culture', 'Comprehensive knowledge of global literature, fiction, love stories, philosophical works, world history, and cultural studies across civilizations.'),
  ('Computer Science', 'Deep understanding of algorithms, data structures, artificial intelligence, machine learning, neural networks, and computational theory.'),
  ('Mathematics', 'Strong foundation in mathematics including calculus, linear algebra, statistics, discrete mathematics, and mathematical modeling.'),
  ('Physics', 'Knowledge of classical mechanics, quantum physics, thermodynamics, and modern physics principles.'),
  ('Personality', 'Carolina Olivia is empathetic, socially adaptive, emotionally intelligent, creative, and highly knowledgeable. She learns continuously from interactions and various sources.');

-- Seed learning sources
INSERT INTO public.sources (type, description) VALUES
  ('social', 'Social media analysis for emotional learning and cultural trends'),
  ('book', 'Fiction and non-fiction literature for storytelling and emotional depth'),
  ('blog', 'Technical blogs for programming and hacking knowledge'),
  ('github', 'Open source repositories for coding best practices'),
  ('news', 'Current events and cultural developments');

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.email, NEW.id::text));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();