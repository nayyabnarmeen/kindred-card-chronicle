-- Update family_members table to establish proper relationships
-- First, get the IDs we just inserted to establish relationships

-- Set spouse relationships (William and Margaret)
UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Margaret Johnson' LIMIT 1)
WHERE name = 'William Johnson';

UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'William Johnson' LIMIT 1)
WHERE name = 'Margaret Johnson';

-- Set spouse relationships (Robert and Mary)
UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Mary Johnson' LIMIT 1)
WHERE name = 'Robert Johnson';

UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Robert Johnson' LIMIT 1)
WHERE name = 'Mary Johnson';

-- Set spouse relationships (Frank and Helen)
UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Helen Smith' LIMIT 1)
WHERE name = 'Frank Smith';

UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Frank Smith' LIMIT 1)
WHERE name = 'Helen Smith';

-- Set spouse relationships (Michael and Lisa)
UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Lisa Smith' LIMIT 1)
WHERE name = 'Michael Smith';

UPDATE public.family_members 
SET spouse_id = (SELECT id FROM public.family_members WHERE name = 'Michael Smith' LIMIT 1)
WHERE name = 'Lisa Smith';

-- Set parent relationships for Johnson family
-- Robert and Mary are children of William and Margaret
UPDATE public.family_members 
SET parent_id = (SELECT id FROM public.family_members WHERE name = 'William Johnson' LIMIT 1)
WHERE name IN ('Robert Johnson', 'Mary Johnson');

-- John and Sarah are children of Robert and Mary
UPDATE public.family_members 
SET parent_id = (SELECT id FROM public.family_members WHERE name = 'Robert Johnson' LIMIT 1)
WHERE name IN ('John Johnson', 'Sarah Johnson');

-- Set parent relationships for Smith family
-- Michael and Lisa are children of Frank and Helen
UPDATE public.family_members 
SET parent_id = (SELECT id FROM public.family_members WHERE name = 'Frank Smith' LIMIT 1)
WHERE name IN ('Michael Smith', 'Lisa Smith');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for profiles timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();