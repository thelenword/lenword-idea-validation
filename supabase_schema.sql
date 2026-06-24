-- Create validation_reports table
CREATE TABLE IF NOT EXISTS public.validation_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  startup_name TEXT NOT NULL,
  report_data JSONB NOT NULL,
  score NUMERIC,
  status TEXT DEFAULT 'pending',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.validation_reports ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can insert their own reports" 
  ON public.validation_reports 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" 
  ON public.validation_reports 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" 
  ON public.validation_reports 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" 
  ON public.validation_reports 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Storage configuration for PDFs
-- Create the 'pdfs' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('pdfs', 'pdfs', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Anyone can view pdfs" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'pdfs');

CREATE POLICY "Authenticated users can upload pdfs" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'pdfs' AND auth.role() = 'authenticated');
