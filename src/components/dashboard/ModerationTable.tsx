"use client";

import { Eye, Trash2, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: number;
  content: string;
  is_anonymous: boolean;
  created_at: string;
  status?: string;
}

interface ModerationTableProps {
  userId: string;
  initialPosts?: Post[];
}

export function ModerationTable({ userId, initialPosts = [] }: ModerationTableProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [viewPost, setViewPost] = useState<Post | null>(null);
  const supabase = createClient();
  const router = useRouter();

  // ── Fetch all posts ──────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    const { data } = await supabase
      .from("curhatwall_posts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setPosts(data as Post[]);
  }, [userId]);

  useEffect(() => {
    // Refresh whenever this component mounts or initialPosts changes
    if (initialPosts.length > 0) {
      setPosts(initialPosts);
    } else {
      fetchPosts();
    }
  }, [initialPosts]);

  // ── Real-time subscription ────────────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel(`moderation-posts-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "curhatwall_posts",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPosts((prev) => [payload.new as Post, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setPosts((prev) => prev.filter((p) => p.id !== (payload.old as Post).id));
          } else if (payload.eventType === "UPDATE") {
            setPosts((prev) =>
              prev.map((p) => (p.id === (payload.new as Post).id ? (payload.new as Post) : p))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // ── Delete handler ────────────────────────────────────────────────────────
  const handleDelete = async (postId: number) => {
    if (!confirm("Are you sure you want to delete this confession?")) return;

    setDeleting(postId);
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== postId));

    const { error } = await supabase
      .from("curhatwall_posts")
      .delete()
      .eq("id", postId);

    if (error) {
      alert("Failed to delete post. Refreshing...");
      fetchPosts(); // Revert on error
    }
    setDeleting(null);
    router.refresh();
  };

  return (
    <>
      <div className="rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        {/* Table Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              My Confessions
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {posts.length} post{posts.length !== 1 ? "s" : ""} · live
            </p>
          </div>
          <button
            onClick={fetchPosts}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">
                  Visibility
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-36">
                  Posted
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider w-24">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-900 dark:text-zinc-100 max-w-md line-clamp-2">
                      {post.content}
                    </p>
                    {post.is_anonymous && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 italic mt-0.5 block">
                        Anonymous
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.is_anonymous
                        ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    }`}>
                      {post.is_anonymous ? "Anonymous" : "Public"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400" title={new Date(post.created_at).toLocaleString()}>
                      {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewPost(post)}
                        className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                        title="View full content"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete post"
                        disabled={deleting === post.id}
                      >
                        {deleting === post.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-zinc-400 dark:text-zinc-600 text-sm"
                  >
                    You haven't posted anything yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── View Post Modal ─────────────────────────────────────────────── */}
      {viewPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setViewPost(null)}
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-zinc-200 dark:border-zinc-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                My Confession · {viewPost.is_anonymous ? "Anonymous" : "Public"}
              </span>
              <button
                onClick={() => setViewPost(null)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-zinc-900 dark:text-zinc-100 leading-relaxed whitespace-pre-wrap">
              {viewPost.content}
            </p>
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600">
              <span>{viewPost.is_anonymous ? "Anonymous" : "Public"}</span>
              <span>{new Date(viewPost.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
