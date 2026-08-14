-- ============ NEWS CATEGORIES ============
CREATE TABLE public.news_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.news_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_categories TO authenticated;
GRANT ALL ON public.news_categories TO service_role;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "News categories are publicly readable" ON public.news_categories FOR SELECT USING (true);
CREATE POLICY "Admins can insert news categories" ON public.news_categories FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update news categories" ON public.news_categories FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete news categories" ON public.news_categories FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER news_categories_set_updated_at BEFORE UPDATE ON public.news_categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NEWS POSTS ============
CREATE TABLE public.news_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES public.news_categories(id) ON DELETE SET NULL,
  featured_image text,
  featured_image_alt text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','unpublished')),
  featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  event_date date,
  event_time text,
  location text,
  contact_information text,
  call_to_action_text text,
  call_to_action_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX news_posts_status_published_at_idx ON public.news_posts (status, published_at DESC);
CREATE INDEX news_posts_category_idx ON public.news_posts (category_id);
CREATE INDEX news_posts_event_date_idx ON public.news_posts (event_date);
GRANT SELECT ON public.news_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_posts TO authenticated;
GRANT ALL ON public.news_posts TO service_role;
ALTER TABLE public.news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news is publicly readable" ON public.news_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Admins can read all news" ON public.news_posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert news" ON public.news_posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update news" ON public.news_posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete news" ON public.news_posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER news_posts_set_updated_at BEFORE UPDATE ON public.news_posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ NEWS SUPPORTING IMAGES ============
CREATE TABLE public.news_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.news_posts(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  image_alt text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX news_images_post_idx ON public.news_images (post_id, display_order);
GRANT SELECT ON public.news_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.news_images TO authenticated;
GRANT ALL ON public.news_images TO service_role;
ALTER TABLE public.news_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Images of published news are publicly readable" ON public.news_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.news_posts p WHERE p.id = post_id AND p.status = 'published')
);
CREATE POLICY "Admins can read all news images" ON public.news_images FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert news images" ON public.news_images FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update news images" ON public.news_images FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete news images" ON public.news_images FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ SEED CATEGORIES ============
INSERT INTO public.news_categories (name, slug, display_order) VALUES
  ('Outreach','outreach',1),
  ('Immunization','immunization',2),
  ('Health Campaign','health-campaign',3),
  ('Community Event','community-event',4),
  ('PHC Update','phc-update',5),
  ('Public Health Notice','public-health-notice',6),
  ('EgorPHCConnect Update','egorphcconnect-update',7),
  ('Other','other',8)
ON CONFLICT (name) DO NOTHING;