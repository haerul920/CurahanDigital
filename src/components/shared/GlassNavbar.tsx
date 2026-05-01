"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreatePostModal } from "@/components/shared/CreatePostModal";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { AuthSync } from "./AuthSync";
import { ProfileDropdown } from "./ProfileDropdown";
import { ThemeToggle } from "./ThemeToggle";

export default function GlassNavbar() {
  const pathname = usePathname();

  // Navigation links removed as requested.

  return (
    <>
      <AuthSync />
      {/* Desktop Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-8 py-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            CurahanDigital
          </Link>
        </div>

        <div className="flex items-center gap-8">
          {/* Navigation links removed from desktop view */}
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <SignedIn>
            <CreatePostModal />
            <ProfileDropdown />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-4 py-2">
                Login
              </button>
            </SignInButton>
            <Link href="/sign-up" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-md px-4 py-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium">
              Sign Up
            </Link>
          </SignedOut>
        </div>
      </nav>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-center justify-around px-4 py-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 pb-4">
        <ThemeToggle />
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex flex-col items-center justify-center space-y-1 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              <User className="w-5 h-5" />
              <span className="text-[10px] font-medium">Login</span>
            </button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 drop-shadow-md">
            <CreatePostModal />
          </div>
          <div className="flex flex-col items-center justify-center space-y-1">
            <ProfileDropdown />
          </div>
        </SignedIn>
      </nav>
    </>
  );
}
