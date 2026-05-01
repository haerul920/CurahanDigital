"use client";

import { useClerk } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  ShieldAlert,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useClerk();
  const router = useRouter();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "posts", icon: MessageSquare, label: "Posts" },
    { id: "moderation", icon: ShieldAlert, label: "Moderation" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/dashboard/login");
  };

  return (
    <div
      className={cn(
        "relative h-full transition-all duration-300 ease-in-out border-r border-zinc-200 bg-white",
        isCollapsed ? "w-20" : "w-64"
      )}
    >

      {/* Content */}
      <div className="relative h-full flex flex-col z-10">
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <span className="text-zinc-900 text-xl font-bold tracking-tight">
                CurahanDigital
              </span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-zinc-100 text-zinc-900 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                  <Icon
                    className={cn(
                      "w-5 h-5 shrink-0",
                    isActive ? "text-zinc-900" : ""
                  )}
                />
                {!isCollapsed && (
                  <span
                    className={cn(
                      "transition-opacity",
                      isActive ? "font-medium" : ""
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-zinc-200 mb-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-zinc-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
