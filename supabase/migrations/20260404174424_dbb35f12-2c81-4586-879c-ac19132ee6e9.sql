
-- Pathway Tracker Items
CREATE TABLE public.pathway_tracker_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pathway_tracker_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tracker items"
  ON public.pathway_tracker_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tracker items"
  ON public.pathway_tracker_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tracker items"
  ON public.pathway_tracker_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tracker items"
  ON public.pathway_tracker_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_pathway_tracker_items_updated_at
  BEFORE UPDATE ON public.pathway_tracker_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Saved Bookmarks
CREATE TABLE public.saved_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_type TEXT NOT NULL,
  reference_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks"
  ON public.saved_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks"
  ON public.saved_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks"
  ON public.saved_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_pathway_tracker_user ON public.pathway_tracker_items(user_id);
CREATE INDEX idx_saved_bookmarks_user ON public.saved_bookmarks(user_id);
CREATE INDEX idx_saved_bookmarks_ref ON public.saved_bookmarks(user_id, item_type, reference_id);
