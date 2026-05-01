"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export function ProfileDropdown() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const supabase = createClient();
  const [avatarSeed, setAvatarSeed] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await supabase
          .from("curhatwall_profiles")
          .select("avatar_seed")
          .eq("id", user.id)
          .single();
        if (data) {
          setAvatarSeed(data.avatar_seed);
        }
      }
    };

    if (isLoaded && user) {
      fetchProfile();
    }

    const handleProfileUpdate = () => fetchProfile();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, [isLoaded, user, supabase]);

  if (!isLoaded || !user) {
    return null; // Or a loading skeleton
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 outline-none focus:ring-2 focus:ring-zinc-200 rounded-full transition-all">
          <Avatar className="w-9 h-9 border border-zinc-200">
            <AvatarImage 
              src={avatarSeed ? `https://api.dicebear.com/9.x/notionists/svg?seed=${avatarSeed}` : user.imageUrl} 
              alt={user.fullName || "User"} 
            />
            <AvatarFallback className="bg-zinc-100 text-zinc-900">
              {user.firstName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white border border-zinc-200 shadow-lg rounded-xl">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-zinc-900">
              {user.fullName || user.username || "User"}
            </p>
            <p className="text-xs leading-none text-zinc-500">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-100" />
        
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-zinc-50 focus:text-zinc-900">
          <Link href="/dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-zinc-100" />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
