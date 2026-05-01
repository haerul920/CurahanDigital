"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
// import { QueryData } from '@supabase/supabase-js'; // Not importing to avoid type complexity for now, casting manually

async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}

export async function getPosts() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("curhatwall_posts")
    .select(
      `
      *,
      curhatwall_profiles (
        username,
        avatar_seed
      ),
      curhatwall_likes (count),
      curhatwall_comments (count)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }

  // Transform data for frontend
  return data.map((post: any) => {
    const profile = Array.isArray(post.curhatwall_profiles)
      ? post.curhatwall_profiles[0]
      : post.curhatwall_profiles;
    const likesCount = post.curhatwall_likes?.[0]?.count || 0;
    const commentsCount = post.curhatwall_comments?.[0]?.count || 0;

    return {
      id: post.id,
      content: post.content,
      is_anonymous: post.is_anonymous,
      created_at: post.created_at,
      username: post.is_anonymous
        ? "Anonymous"
        : profile?.username || "Unknown",
      avatar_seed: post.is_anonymous ? null : profile?.avatar_seed,
      likes: likesCount,
      comments: commentsCount,
    };
  });
}
