-- ============================================================
-- STEP 1: CLEANUP SCRIPT — Run this FIRST in Supabase SQL Editor
-- This removes old/wrong columns and stale policies
-- ============================================================

-- 1. Drop old unused columns from curhatwall_posts
ALTER TABLE public.curhatwall_posts
  DROP COLUMN IF EXISTS category,
  DROP COLUMN IF EXISTS background_color;

-- 2. Drop any old policies that may exist on posts/likes/comments
DROP POLICY IF EXISTS "Anyone can view posts."           ON public.curhatwall_posts;
DROP POLICY IF EXISTS "Users can insert own posts."      ON public.curhatwall_posts;
DROP POLICY IF EXISTS "Users can delete own posts."      ON public.curhatwall_posts;
DROP POLICY IF EXISTS "Anyone can view likes."           ON public.curhatwall_likes;
DROP POLICY IF EXISTS "Users can insert own likes."      ON public.curhatwall_likes;
DROP POLICY IF EXISTS "Users can delete own likes."      ON public.curhatwall_likes;
DROP POLICY IF EXISTS "Anyone can view comments."        ON public.curhatwall_comments;
DROP POLICY IF EXISTS "Users can insert own comments."   ON public.curhatwall_comments;
DROP POLICY IF EXISTS "Users can delete own comments."   ON public.curhatwall_comments;

-- 3. Drop old profile policies (will be recreated cleanly in setup_v2)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.curhatwall_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile."       ON public.curhatwall_profiles;
DROP POLICY IF EXISTS "Users can update own profile."             ON public.curhatwall_profiles;

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
