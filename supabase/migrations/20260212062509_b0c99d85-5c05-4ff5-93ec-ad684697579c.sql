
-- Add banned_at to profiles for user banning
ALTER TABLE public.profiles ADD COLUMN banned_at timestamp with time zone DEFAULT NULL;

-- Allow admins to update any profile (for banning)
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view all chat messages (already viewable by authenticated, but explicit)
-- Allow admins to delete chat messages for moderation
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to view user roles
-- (already exists from previous migration)

-- Allow admins to insert roles (for promoting users)
-- The existing "Admins can manage roles" ALL policy covers this
