
-- Add new columns to phcs (preserve all existing data)
ALTER TABLE public.phcs
  ADD COLUMN IF NOT EXISTS monday_services    text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS tuesday_services   text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS wednesday_services text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS thursday_services  text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS friday_services    text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS saturday_services  text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS sunday_services    text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS opening_time       time,
  ADD COLUMN IF NOT EXISTS closing_time       time,
  ADD COLUMN IF NOT EXISTS google_maps_url    text,
  ADD COLUMN IF NOT EXISTS updated_at         timestamptz NOT NULL DEFAULT now();

-- Backfill opening_time / closing_time from legacy operating_hours.mon_fri ("HH:MM-HH:MM")
UPDATE public.phcs
SET
  opening_time = COALESCE(opening_time, NULLIF(split_part(operating_hours->>'mon_fri','-',1),'')::time),
  closing_time = COALESCE(closing_time, NULLIF(split_part(operating_hours->>'mon_fri','-',2),'')::time)
WHERE operating_hours ? 'mon_fri'
  AND (operating_hours->>'mon_fri') ~ '^\d{2}:\d{2}-\d{2}:\d{2}$';

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS phcs_set_updated_at ON public.phcs;
CREATE TRIGGER phcs_set_updated_at
  BEFORE UPDATE ON public.phcs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
