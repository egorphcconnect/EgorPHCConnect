DO $$ BEGIN
  CREATE POLICY "Public read phc-images" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'phc-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins upload phc-images" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'phc-images' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins update phc-images" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'phc-images' AND public.has_role(auth.uid(), 'admin')) WITH CHECK (bucket_id = 'phc-images' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Admins delete phc-images" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'phc-images' AND public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;