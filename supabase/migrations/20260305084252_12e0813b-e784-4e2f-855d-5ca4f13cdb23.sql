CREATE TABLE public.pathway_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  future_goal TEXT NOT NULL,
  pathway_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.pathway_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pathway" ON public.pathway_maps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pathway" ON public.pathway_maps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pathway" ON public.pathway_maps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pathway" ON public.pathway_maps FOR DELETE USING (auth.uid() = user_id);