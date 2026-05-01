"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { createClient } from "@/lib/supabaseClient";
import { Loader2 } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface DayData {
  name: string;
  posts: number;
  likes: number;
}

interface ChartsProps {
  userId: string;
}

export function Charts({ userId }: ChartsProps) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchChartData = useCallback(async () => {
    // Build 7-day bucket array
    const days: DayData[] = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return { name: format(d, "EEE"), posts: 0, likes: 0 };
    });

    const since = startOfDay(subDays(new Date(), 6)).toISOString();

    // Only MY posts in the last 7 days
    const { data: postRows } = await supabase
      .from("curhatwall_posts")
      .select("id, created_at")
      .eq("user_id", userId)
      .gte("created_at", since);

    postRows?.forEach((row) => {
      const dayName = format(new Date(row.created_at), "EEE");
      const bucket = days.find((d) => d.name === dayName);
      if (bucket) bucket.posts++;
    });

    // Likes received on MY posts
    const myPostIds = (postRows || []).map((r) => r.id);

    if (myPostIds.length > 0) {
      const { data: likeRows } = await supabase
        .from("curhatwall_likes")
        .select("created_at")
        .in("post_id", myPostIds)
        .gte("created_at", since);

      likeRows?.forEach((row) => {
        const dayName = format(new Date(row.created_at), "EEE");
        const bucket = days.find((d) => d.name === dayName);
        if (bucket) bucket.likes++;
      });
    }

    setData(days);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Real-time: refresh charts when user's own posts or their likes change
  useEffect(() => {
    const channel = supabase
      .channel(`charts-rt-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "curhatwall_posts",
        filter: `user_id=eq.${userId}`,
      }, () => fetchChartData())
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "curhatwall_likes",
      }, () => fetchChartData())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchChartData, userId]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center h-[380px]"
          >
            <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
          </div>
        ))}
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "rgba(24,24,27,0.9)",
    borderRadius: "8px",
    border: "none",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
    color: "#f4f4f5",
    fontSize: "12px",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* My Posts Activity */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">My Posts Activity</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">Posts you published</p>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
            Last 7 days · live
          </span>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorMyPosts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113,113,122,0.15)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="posts" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMyPosts)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Likes Received */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Likes Received</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">On your posts</p>
          </div>
          <span className="text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">
            Last 7 days · live
          </span>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113,113,122,0.15)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="likes"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={{ fill: "#f43f5e", strokeWidth: 2, r: 4, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
