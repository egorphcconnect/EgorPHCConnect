
-- PHCs
CREATE TABLE public.phcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  ward TEXT NOT NULL,
  services TEXT[] NOT NULL DEFAULT '{}',
  operating_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  contact_phone TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  images TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.phcs TO anon, authenticated;
GRANT ALL ON public.phcs TO service_role;
ALTER TABLE public.phcs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "PHCs are publicly readable" ON public.phcs FOR SELECT USING (true);

-- Health articles
CREATE TABLE public.health_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.health_articles TO anon, authenticated;
GRANT ALL ON public.health_articles TO service_role;
ALTER TABLE public.health_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published articles are publicly readable"
  ON public.health_articles FOR SELECT USING (published = true);

-- Feedback (write-only from public; read via admin server)
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phc_id UUID NOT NULL REFERENCES public.phcs(id) ON DELETE CASCADE,
  service_used TEXT,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  staff_professionalism SMALLINT CHECK (staff_professionalism BETWEEN 1 AND 5),
  waiting_time SMALLINT CHECK (waiting_time BETWEEN 1 AND 5),
  cleanliness SMALLINT CHECK (cleanliness BETWEEN 1 AND 5),
  comments TEXT,
  anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.feedback TO anon, authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT WITH CHECK (true);

CREATE INDEX idx_feedback_phc ON public.feedback(phc_id);
CREATE INDEX idx_phcs_ward ON public.phcs(ward);
