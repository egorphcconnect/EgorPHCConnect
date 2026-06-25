-- Add missing columns to phcs
ALTER TABLE public.phcs
  ADD COLUMN IF NOT EXISTS facility_type text,
  ADD COLUMN IF NOT EXISTS image_url text;

-- App role enum + user_roles table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

DO $$ BEGIN
  CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin write policies on phcs
GRANT INSERT, UPDATE, DELETE ON public.phcs TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Admins can insert phcs" ON public.phcs
    FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can update phcs" ON public.phcs
    FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins can delete phcs" ON public.phcs
    FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Admin write policies on health_articles
GRANT INSERT, UPDATE, DELETE ON public.health_articles TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Admins manage articles" ON public.health_articles
    FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
