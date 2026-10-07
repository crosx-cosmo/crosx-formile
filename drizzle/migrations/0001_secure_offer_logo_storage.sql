CREATE POLICY "Users upload own offer logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'offer-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users manage own offer logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'offer-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'offer-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own offer logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'offer-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own offer logos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'offer-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Published offer logos are readable"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'offer-logos'
  AND EXISTS (
    SELECT 1
    FROM public.forms
    WHERE forms.status = 'published'
      AND forms.offer_logo_url = storage.objects.name
  )
);