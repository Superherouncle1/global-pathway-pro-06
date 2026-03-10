
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_credits (user_id, credits)
  VALUES (NEW.id, 30)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;
