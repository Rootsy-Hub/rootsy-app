-- Imágenes públicas de catálogo (artículos, recetas, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'rootsy_catalog_public',
  'rootsy_catalog_public',
  true,
  5242880,
  ARRAY['image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Catalog images public read" ON storage.objects;
CREATE POLICY "Catalog images public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rootsy_catalog_public');

DROP POLICY IF EXISTS "Pop members upload catalog images" ON storage.objects;
CREATE POLICY "Pop members upload catalog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rootsy_catalog_public'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
  AND public.user_has_pop_access(((storage.foldername(name))[1])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Pop members update catalog images" ON storage.objects;
CREATE POLICY "Pop members update catalog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'rootsy_catalog_public'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
  AND public.user_has_pop_access(((storage.foldername(name))[1])::uuid, auth.uid())
)
WITH CHECK (
  bucket_id = 'rootsy_catalog_public'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
  AND public.user_has_pop_access(((storage.foldername(name))[1])::uuid, auth.uid())
);

DROP POLICY IF EXISTS "Pop members delete catalog images" ON storage.objects;
CREATE POLICY "Pop members delete catalog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rootsy_catalog_public'
  AND (storage.foldername(name))[1] ~ '^[0-9a-f-]{36}$'
  AND public.user_has_pop_access(((storage.foldername(name))[1])::uuid, auth.uid())
);
