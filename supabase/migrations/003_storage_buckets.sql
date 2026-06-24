-- Create pitch-decks bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'pitch-decks',
  'pitch-decks',
  false,
  52428800, -- 50MB
  ARRAY['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- Users can upload and access their own files in the pitch-decks bucket.
-- Path structure expected: pitch-decks/<uid>/<filename>

CREATE POLICY "Users can upload their own pitch decks" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own pitch decks" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own pitch decks" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'pitch-decks' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
