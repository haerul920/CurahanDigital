"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MetricsCards } from "@/components/dashboard/MetricsCards";
import { Charts } from "@/components/dashboard/Charts";
import { ModerationTable } from "@/components/dashboard/ModerationTable";
import { DashboardSettings } from "@/components/dashboard/DashboardSettings";
import { createClient } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const [activePage, setActivePage] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    myPosts: 0,
    myLikesReceived: 0,
    myCommentsReceived: 0,
  });
  const [posts, setPosts] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, isLoaded } = useUser();
  const supabase = createClient();

  // ── Fetch ONLY this user's stats ─────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      // 1. My posts
      const { count: postsCount } = await supabase
        .from("curhatwall_posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // 2. Likes received on MY posts (join via post_id → posts.user_id)
      const { data: myPostIds } = await supabase
        .from("curhatwall_posts")
        .select("id")
        .eq("user_id", user.id);

      const ids = (myPostIds || []).map((p: any) => p.id);

      let likesCount = 0;
      let commentsCount = 0;

      if (ids.length > 0) {
        const { count: lc } = await supabase
          .from("curhatwall_likes")
          .select("*", { count: "exact", head: true })
          .in("post_id", ids);

        const { count: cc } = await supabase
          .from("curhatwall_comments")
          .select("*", { count: "exact", head: true })
          .in("post_id", ids);

        likesCount = lc || 0;
        commentsCount = cc || 0;
      }

      // 3. My recent posts (for the Posts tab)
      const { data: recentPosts } = await supabase
        .from("curhatwall_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setStats({
        myPosts: postsCount || 0,
        myLikesReceived: likesCount,
        myCommentsReceived: commentsCount,
      });

      if (recentPosts) setPosts(recentPosts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && user) fetchStats();
  }, [isLoaded, user, fetchStats]);

  // ── Real-time: only listen to events involving this user ───────────────────
  useEffect(() => {
    if (!user) return;

    const postsChannel = supabase
      .channel("rt-my-posts")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "curhatwall_posts",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchStats()
      )
      .subscribe();

    const likesChannel = supabase
      .channel("rt-my-likes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curhatwall_likes" },
        () => fetchStats() // re-count; we'll filter by post_id inside fetchStats
      )
      .subscribe();

    const commentsChannel = supabase
      .channel("rt-my-comments")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "curhatwall_comments" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(likesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [user, fetchStats]);

  if (!isLoaded) return null;

  return (
    <div className="flex bg-zinc-50 dark:bg-zinc-950 h-[calc(100vh-73px)] overflow-hidden">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
              <p className="text-sm text-zinc-400">Loading your data…</p>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {activePage === "dashboard" && (
                <>
                  <MetricsCards
                    myPosts={stats.myPosts}
                    myLikesReceived={stats.myLikesReceived}
                    myCommentsReceived={stats.myCommentsReceived}
                  />
                  <Charts userId={user!.id} />
                </>
              )}
              {activePage === "posts" && (
                <ModerationTable userId={user!.id} initialPosts={posts} />
              )}
              {activePage === "moderation" && (
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-12 text-center text-zinc-500 shadow-sm">
                  Advanced Moderation Queue — coming soon
                </div>
              )}
              {activePage === "settings" && <DashboardSettings />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
