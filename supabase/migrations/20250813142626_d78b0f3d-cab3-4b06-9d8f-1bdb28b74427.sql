-- Add new fields to family_members table
ALTER TABLE public.family_members 
ADD COLUMN profession TEXT,
ADD COLUMN residence TEXT,
ADD COLUMN hometown TEXT,
ADD COLUMN ethnic TEXT,
ADD COLUMN nationality TEXT,
ADD COLUMN note TEXT;

-- Create storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('family-photos', 'family-photos', true);

-- Storage policies for family photos
CREATE POLICY "Users can view family photos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'family-photos');

CREATE POLICY "Users can upload their own family photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own family photos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own family photos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'family-photos' AND auth.uid()::text = (storage.foldername(name))[1]);