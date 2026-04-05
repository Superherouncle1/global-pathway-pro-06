DROP POLICY IF EXISTS "Admins can manage non-super roles" ON public.user_roles;

CREATE POLICY "Admins can manage non-super roles" ON public.user_roles
FOR ALL
TO public
USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  AND (is_super_admin(auth.uid()) OR (NOT is_super_admin(user_id)))
)
WITH CHECK (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role))
  AND (is_super_admin(auth.uid()) OR (
    (NOT is_super_admin(user_id))
    AND role <> 'super_admin'::app_role
    AND role <> 'admin'::app_role
  ))
);