"use client";

import { useEffect, useState } from "react";
import ConfessionCard from "@/components/shared/ConfessionCard";
import { createClient } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

interface Post {
  id: number;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  username: string;
  avatar_seed?: string | null;
  likes: number;
  comments: number;
}

interface FeedGridProps {
  posts: Post[];
}

export default function FeedGrid({ posts: initialPosts }: FeedGridProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel("homepage-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "curhatwall_posts" },
        async (payload) => {
          const newRow = payload.new as any;
          const { data: profile } = await supabase
            .from("curhatwall_profiles")
            .select("username, avatar_seed")
            .eq("id", newRow.user_id)
            .single();

          setPosts((prev) => [
            {
              id: newRow.id,
              content: newRow.content,
              is_anonymous: newRow.is_anonymous,
              created_at: newRow.created_at,
              username: newRow.is_anonymous ? "Anonymous" : profile?.username || "Unknown",
              avatar_seed: newRow.is_anonymous ? null : profile?.avatar_seed,
              likes: 0,
              comments: 0,
            },
            ...prev,
          ]);
        }
      )
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "curhatwall_posts" }, (payload) => {
        setPosts((prev) => prev.filter((p) => p.id !== (payload.old as any).id));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "curhatwall_posts" }, (payload) => {
        const updated = payload.new as any;
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, content: updated.content } : p)));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-full max-w-sm bg-white dark:bg-zinc-900 p-8 rounded-2xl text-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🌿</span>
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Di sini sunyi...</h3>
          <p className="text-zinc-500 dark:text-zinc-400">Belum ada yang menulis. Jadi, jadilah yang pertama.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.93 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ConfessionCard
              content={post.content}
              timestamp={new Date(post.created_at).toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
              likes={post.likes}
              comments={post.comments}
              isAnonymous={post.is_anonymous}
              username={post.username}
              avatarSeed={post.avatar_seed || undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
