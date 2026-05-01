"use client";

import { MessageSquare, Heart, MessageCircle } from "lucide-react";

interface MetricsProps {
  myPosts: number;
  myLikesReceived: number;
  myCommentsReceived: number;
}

export function MetricsCards({ myPosts, myLikesReceived, myCommentsReceived }: MetricsProps) {
  const metrics = [
    {
      label: "My Posts",
      value: myPosts.toLocaleString(),
      sub: "confessions you've shared",
      icon: MessageSquare,
      color: "bg-blue-500",
      ring: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      label: "Likes Received",
      value: myLikesReceived.toLocaleString(),
      sub: "on all your posts",
      icon: Heart,
      color: "bg-rose-500",
      ring: "bg-rose-50 dark:bg-rose-950/40",
    },
    {
      label: "Comments Received",
      value: myCommentsReceived.toLocaleString(),
      sub: "on all your posts",
      icon: MessageCircle,
      color: "bg-violet-500",
      ring: "bg-violet-50 dark:bg-violet-950/40",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <div
            key={index}
            className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {metric.label}
                </p>
                <h3 className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {metric.value}
                </h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{metric.sub}</p>
              </div>
              <div className={`p-3 rounded-xl ${metric.ring}`}>
                <div className={`p-2 rounded-lg ${metric.color} text-white`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
