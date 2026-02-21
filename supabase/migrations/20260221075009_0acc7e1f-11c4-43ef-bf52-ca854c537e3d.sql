
-- Table for institution opportunity listings
CREATE TABLE public.opportunity_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  posted_by UUID NOT NULL,
  institution_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('admission', 'recruitment', 'scholarship', 'program')),
  country TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  application_link TEXT,
  contact_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.opportunity_listings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view active listings
CREATE POLICY "Authenticated users can view active listings"
  ON public.opportunity_listings FOR SELECT
  USING (is_authenticated() AND is_active = true);

-- Admins can view all listings including inactive
CREATE POLICY "Admins can view all listings"
  ON public.opportunity_listings FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can post listings
CREATE POLICY "Authenticated users can post listings"
  ON public.opportunity_listings FOR INSERT
  WITH CHECK (auth.uid() = posted_by);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON public.opportunity_listings FOR UPDATE
  USING (auth.uid() = posted_by);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON public.opportunity_listings FOR DELETE
  USING (auth.uid() = posted_by);

-- Admins can delete any listing
CREATE POLICY "Admins can delete any listing"
  ON public.opportunity_listings FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_opportunity_listings_updated_at
  BEFORE UPDATE ON public.opportunity_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
