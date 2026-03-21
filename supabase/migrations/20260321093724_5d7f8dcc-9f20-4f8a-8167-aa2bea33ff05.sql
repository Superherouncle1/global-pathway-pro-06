
-- Table to store each user's unique referral code
CREATE TABLE public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.referral_codes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Table to track which referred users signed up
CREATE TABLE public.referral_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referral signups"
  ON public.referral_signups FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Service can insert referral signups"
  ON public.referral_signups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all referral signups"
  ON public.referral_signups FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Function to reward 20 credits when a referrer hits 5 signups
CREATE OR REPLACE FUNCTION public.check_referral_reward()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  signup_count integer;
BEGIN
  SELECT count(*) INTO signup_count
  FROM public.referral_signups
  WHERE referrer_id = NEW.referrer_id;

  -- Reward at exactly 5, 10, 15, etc. (every 5 referrals)
  IF signup_count % 5 = 0 THEN
    UPDATE public.user_credits
    SET credits = credits + 20, updated_at = now()
    WHERE user_id = NEW.referrer_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_referral_signup_reward
  AFTER INSERT ON public.referral_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.check_referral_reward();
