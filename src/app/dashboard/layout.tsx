import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We can double check auth here or rely on middleware.
  // Middleware handles the redirects generally, but checking here handles
  // edge cases where middleware might be bypassed or configured loosely.
  // However, for pure layout structure (like adding toaster for admin), this is the place.
  // Since Sidebar is part of the Dashboard page (per user request structure or my plan),
  // I will leave this as a wrapper.

  // Note: The prompt "Route: Create a layout at src/app/admin/layout.tsx and the dashboard at src/app/admin/page.tsx."
  // It implies the layout might also hold the Sidebar?
  // "Sidebar... functionalities exactly as they are".
  // The functionality in "CurhatWall Back-end/Sidebar.tsx" accepts activePage.
  // If I put Sidebar in Layout, it persists.
  // But the existing Admin Dashboard seems to be a Single Page Application (SPA) style where Sidebar controls state.
  // The Prompt says "Migrate existing UI... Route... dashboard at src/app/admin/page.tsx".
  // So I will put the Sidebar inside `page.tsx` to maintain the "Dashboard" feel of the original logic,
  // OR I can use Next.js layouts.
  // Given "Sidebar, MetricsCards, ModerationTable" are components, it's safer to keep the Dashboard orchestration in `page.tsx` for now
  // to avoid complex state sharing between Layout and Page for "activePage" if I'm not using routes for each tab.
  // The original component code `Sidebar({ activePage, onNavigate })` suggests client-state tab switching.
  // I will respect that design.

  return (
    <div className="bg-zinc-50 font-sans text-zinc-900 h-full">
      {children}
    </div>
  );
}
