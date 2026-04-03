
-- Remove the UPDATE policy that lets authenticated users modify their own credits
DROP POLICY IF EXISTS "Service role can update credits" ON public.user_credits;

-- Remove the INSERT policy that lets authenticated users insert arbitrary credit values
DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
