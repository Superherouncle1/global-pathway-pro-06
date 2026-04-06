
-- 1. Block authenticated users from INSERT/UPDATE/DELETE on user_credits
-- Add restrictive policies that deny all authenticated users
CREATE POLICY "Block direct credit inserts"
  ON public.user_credits
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Block direct credit updates"
  ON public.user_credits
  FOR UPDATE
  TO authenticated
  USING (false);

CREATE POLICY "Block direct credit deletes"
  ON public.user_credits
  FOR DELETE
  TO authenticated
  USING (false);
