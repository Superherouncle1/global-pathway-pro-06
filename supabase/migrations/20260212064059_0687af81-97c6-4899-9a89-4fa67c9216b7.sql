
-- Upgrade the current admin to super_admin
UPDATE public.user_roles 
SET role = 'super_admin' 
WHERE user_id = '186a0194-9eb9-4fca-a7a1-6ee179b076e0' AND role = 'admin';

-- Create a function to check if a user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  )
$$;

-- Update has_role so super_admin passes admin checks too
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND (role = _role OR (role = 'super_admin' AND _role = 'admin'))
  )
$$;

-- Protect profiles: admins can't update super_admin profiles
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update non-super profiles"
ON public.profiles
FOR UPDATE
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  AND (
    is_super_admin(auth.uid())
    OR NOT is_super_admin(id)
  )
);

-- Protect user_roles: admins can't modify super_admin roles
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can manage non-super roles"
ON public.user_roles
FOR ALL
USING (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  AND (
    is_super_admin(auth.uid())
    OR NOT is_super_admin(user_id)
  )
)
WITH CHECK (
  (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'))
  AND (
    is_super_admin(auth.uid())
    OR (NOT is_super_admin(user_id) AND role != 'super_admin')
  )
);

-- Create activity log table
CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  details text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view activity log"
ON public.admin_activity_log
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can insert activity log"
ON public.admin_activity_log
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));
