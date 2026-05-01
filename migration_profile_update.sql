-- Add full_name and hide_email to curhatwall_profiles
ALTER TABLE public.curhatwall_profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS hide_email BOOLEAN DEFAULT false;
