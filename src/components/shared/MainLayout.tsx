"use client";

import GlassNavbar from "@/components/shared/GlassNavbar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  return (
    <div className="min-h-screen flex flex-col relative w-full overflow-x-hidden">
      <GlassNavbar />
      <main
        className={cn(
          "flex-1 w-full",
          isDashboard
            ? "pt-[73px]" // Offset for fixed GlassNavbar
            : "container mx-auto px-4 py-6 md:py-24 mb-20 md:mb-0 max-w-7xl",
          className
        )}
      >
        {children}
      </main>
    </div>
  );
}
