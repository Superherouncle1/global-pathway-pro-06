
-- Tighten the insert policy to only allow authenticated users
DROP POLICY "Service can insert referral signups" ON public.referral_signups;
CREATE POLICY "Authenticated users can insert referral signups"
  ON public.referral_signups FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referred_user_id);
