DROP POLICY IF EXISTS "Anyone can submit feedback" ON public.feedback;
CREATE POLICY "Anyone can submit feedback"
ON public.feedback
FOR INSERT
TO public
WITH CHECK (
  rating BETWEEN 1 AND 5
  AND (cleanliness IS NULL OR cleanliness BETWEEN 1 AND 5)
  AND (waiting_time IS NULL OR waiting_time BETWEEN 1 AND 5)
  AND (staff_professionalism IS NULL OR staff_professionalism BETWEEN 1 AND 5)
  AND char_length(coalesce(comments, '')) <= 2000
  AND char_length(coalesce(service_used, '')) <= 200
  AND phc_id IS NOT NULL
);