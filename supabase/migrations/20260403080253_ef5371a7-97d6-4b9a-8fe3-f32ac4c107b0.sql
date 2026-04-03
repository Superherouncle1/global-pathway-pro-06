
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Add owner-only SELECT policy
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Admins can still view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a SECURITY DEFINER function that returns only safe community profile data
CREATE OR REPLACE FUNCTION public.get_community_profiles()
RETURNS TABLE (
  id uuid,
  name text,
  country text,
  field_of_study text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.name, p.country, p.field_of_study, p.avatar_url
  FROM public.profiles p
  WHERE p.banned_at IS NULL
  ORDER BY p.created_at DESC;
$$;

-- Create a function to get display info for a single profile (for chat)
CREATE OR REPLACE FUNCTION public.get_profile_display(_user_id uuid)
RETURNS TABLE (
  name text,
  avatar_url text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.name, p.avatar_url
  FROM public.profiles p
  WHERE p.id = _user_id;
$$;
