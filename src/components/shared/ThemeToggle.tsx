"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

    // Use View Transitions API for a smooth circular wipe if supported
    if (
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      buttonRef.current
    ) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Max radius to cover the full viewport
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );

      const transition = document.startViewTransition(() => {
        setTheme(nextTheme);
      });

      transition.ready.then(() => {
        const isDark = nextTheme === "dark";
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: isDark ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 500,
            easing: "ease-in-out",
            pseudoElement: isDark
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          },
        );
      });
    } else {
      // Fallback: just set the theme (CSS transition handles it)
      setTheme(nextTheme);
    }
  };

  // Render a same-size placeholder until mounted (avoids hydration mismatch)
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="rounded-full w-9 h-9 border border-zinc-200 dark:border-zinc-800"
        aria-label="Toggle theme"
      >
        <span className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      ref={buttonRef}
      variant="outline"
      size="icon"
      className="rounded-full w-9 h-9 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span
        className="transition-transform duration-300"
        style={{ transform: isDark ? "rotate(0deg)" : "rotate(-30deg)" }}
      >
        {isDark ? (
          <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-400" />
        ) : (
          <Moon className="h-[1.2rem] w-[1.2rem] text-slate-600" />
        )}
      </span>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
