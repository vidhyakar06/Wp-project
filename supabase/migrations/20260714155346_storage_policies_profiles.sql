/*
# Storage policies for profile images

1. Security
- Allow authenticated users to upload/read/delete their own profile images in the 'profiles' bucket.
- Public read for profile images.
*/

DROP POLICY IF EXISTS "public_read_profiles_bucket" ON storage.objects;
CREATE POLICY "public_read_profiles_bucket" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'profiles');

DROP POLICY IF EXISTS "authed_upload_profiles_bucket" ON storage.objects;
CREATE POLICY "authed_upload_profiles_bucket" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profiles');

DROP POLICY IF EXISTS "authed_update_profiles_bucket" ON storage.objects;
CREATE POLICY "authed_update_profiles_bucket" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profiles') WITH CHECK (bucket_id = 'profiles');

DROP POLICY IF EXISTS "authed_delete_profiles_bucket" ON storage.objects;
CREATE POLICY "authed_delete_profiles_bucket" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profiles');
