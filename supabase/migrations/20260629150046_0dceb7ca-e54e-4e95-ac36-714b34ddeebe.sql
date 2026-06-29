
CREATE TABLE IF NOT EXISTS public.services_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.services_catalog TO anon, authenticated;
GRANT INSERT ON public.services_catalog TO authenticated;
GRANT ALL ON public.services_catalog TO service_role;

ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_catalog_public_read" ON public.services_catalog;
CREATE POLICY "services_catalog_public_read"
  ON public.services_catalog FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "services_catalog_admin_insert" ON public.services_catalog;
CREATE POLICY "services_catalog_admin_insert"
  ON public.services_catalog FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "services_catalog_admin_delete" ON public.services_catalog;
CREATE POLICY "services_catalog_admin_delete"
  ON public.services_catalog FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed with built-in defaults so the catalog is non-empty immediately.
INSERT INTO public.services_catalog (name) VALUES
  ('Antenatal Care'),
  ('Immunization'),
  ('Family Planning'),
  ('Child Welfare'),
  ('Malaria Treatment'),
  ('HIV Services'),
  ('Routine Consultation'),
  ('Nutrition Clinic'),
  ('HIV Counselling'),
  ('Tuberculosis Screening'),
  ('Antenatal Clinic'),
  ('Postnatal Care'),
  ('Growth Monitoring'),
  ('Health Education')
ON CONFLICT (name) DO NOTHING;
