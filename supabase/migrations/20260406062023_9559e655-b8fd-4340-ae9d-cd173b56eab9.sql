-- Add FK constraint so referrer_id must match a real referral_codes.user_id
ALTER TABLE public.referral_signups
  ADD CONSTRAINT fk_referrer_valid_code
  FOREIGN KEY (referrer_id) REFERENCES public.referral_codes(user_id);