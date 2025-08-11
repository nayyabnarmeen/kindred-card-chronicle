-- Add marriage_date and picture columns to family_members table
ALTER TABLE public.family_members 
ADD COLUMN marriage_date date,
ADD COLUMN picture_url text;