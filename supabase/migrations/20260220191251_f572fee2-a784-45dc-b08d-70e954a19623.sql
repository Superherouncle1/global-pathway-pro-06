
-- Create ai_profiles table to store Personal AI Genius training data
CREATE TABLE public.ai_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Education journey
  education_level TEXT,
  current_institution TEXT,
  field_of_study TEXT,
  graduation_year TEXT,
  -- Opportunities sought
  opportunity_types TEXT[], -- e.g. ['scholarships', 'masters', 'phd', 'exchange']
  -- Study abroad targets
  target_countries TEXT[],
  preferred_study_duration TEXT, -- e.g. 'short-term', '1 year', 'full degree'
  -- Goals and motivations
  career_goals TEXT,
  study_abroad_goals TEXT,
  -- Help needed
  help_areas TEXT[], -- e.g. ['visa', 'scholarships', 'SOP writing', 'interviews']
  biggest_challenges TEXT,
  -- Tools and context
  tools_used TEXT,
  additional_context TEXT,
  -- AI conversation history stored as JSONB
  conversation_history JSONB DEFAULT '[]'::jsonb,
  -- Metadata
  trained_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own AI profile
CREATE POLICY "Users can view own ai_profile"
  ON public.ai_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own AI profile
CREATE POLICY "Users can insert own ai_profile"
  ON public.ai_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own AI profile
CREATE POLICY "Users can update own ai_profile"
  ON public.ai_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own AI profile
CREATE POLICY "Users can delete own ai_profile"
  ON public.ai_profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER update_ai_profiles_updated_at
  BEFORE UPDATE ON public.ai_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
