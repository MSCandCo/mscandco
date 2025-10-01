-- RLS policies for profile-pictures storage bucket
-- Run these after creating the profile-pictures bucket in Supabase Storage

-- Public read access to profile pictures
CREATE POLICY "Public profile picture access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-pictures');

-- Authenticated users can upload profile pictures
CREATE POLICY "Authenticated profile picture uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own profile pictures
CREATE POLICY "Users update own profile pictures" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own profile pictures
CREATE POLICY "Users delete own profile pictures" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
