
CREATE TABLE public.article_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.article_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.article_categories TO authenticated;
GRANT ALL ON public.article_categories TO service_role;

ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are publicly readable" ON public.article_categories
  FOR SELECT USING (true);
CREATE POLICY "Admins can insert categories" ON public.article_categories
  FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update categories" ON public.article_categories
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete categories" ON public.article_categories
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_article_categories_updated_at
  BEFORE UPDATE ON public.article_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed with existing distinct categories from articles, plus common defaults
INSERT INTO public.article_categories (name)
SELECT DISTINCT category FROM public.health_articles
WHERE category IS NOT NULL AND length(trim(category)) > 0
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.article_categories (name) VALUES
  ('Health Insurance'),
  ('Maternal and Child Health'),
  ('Malaria Prevention')
ON CONFLICT (name) DO NOTHING;
