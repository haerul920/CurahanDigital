-- Migration to support Clerk User IDs (Text vs UUID)

-- 1. Drop foreign key constraints that rely on UUID types or auth.users
ALTER TABLE public.curhatwall_profiles DROP CONSTRAINT IF EXISTS curhatwall_profiles_id_fkey;
ALTER TABLE public.curhatwall_posts DROP CONSTRAINT IF EXISTS curhatwall_posts_user_id_fkey;
ALTER TABLE public.curhatwall_likes DROP CONSTRAINT IF EXISTS curhatwall_likes_user_id_fkey;
ALTER TABLE public.curhatwall_comments DROP CONSTRAINT IF EXISTS curhatwall_comments_user_id_fkey;

-- 2. Alter column types to TEXT to support Clerk IDs (e.g. user_2N...)
ALTER TABLE public.curhatwall_profiles ALTER COLUMN id TYPE text;
ALTER TABLE public.curhatwall_posts ALTER COLUMN user_id TYPE text;
ALTER TABLE public.curhatwall_likes ALTER COLUMN user_id TYPE text;
ALTER TABLE public.curhatwall_comments ALTER COLUMN user_id TYPE text;

-- 3. Re-add foreign key constraints between internal tables (optional but good for integrity)
-- Note: We CANNOT reference auth.users anymore because Clerk users aren't there.
ALTER TABLE public.curhatwall_posts 
  ADD CONSTRAINT curhatwall_posts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.curhatwall_profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.curhatwall_likes 
  ADD CONSTRAINT curhatwall_likes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.curhatwall_profiles(id) 
  ON DELETE CASCADE;

ALTER TABLE public.curhatwall_comments 
  ADD CONSTRAINT curhatwall_comments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.curhatwall_profiles(id) 
  ON DELETE CASCADE;

-- 4. Update RLS Policies
-- The standard `auth.uid()` from Supabase Auth won't work automatically unless we use Clerk keys.
-- For now, we might need to adjust policies to check a custom claim or just rely on backend logic if we aren't using Supabase Auth.
-- HOWEVER, simple solution for Client-side fetches:
-- We can't easily use `auth.uid()` if we aren't sending a Supabase Token.
-- IF we are just using server-side fetching (via `createServerClient`), we bypass RLS or use the service role.
-- But the app uses client-side fetches too.
-- Recommendation: For this implementation, we will assume we rely on Server Actions (which are secure) or we will address RLS part 2.
-- This migration script purely fixes the schema types.
