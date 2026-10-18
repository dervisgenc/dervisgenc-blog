"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { buttonClasses } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const next = resolvedTheme === "dark" ? "light" : "dark";

  // Both icons are rendered and swapped with CSS so the server markup matches
  // before the theme is known on the client.
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={buttonClasses("ghost", "icon")}
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
    >
      <Sun className="size-4 dark:hidden" aria-hidden />
      <Moon className="hidden size-4 dark:block" aria-hidden />
    </button>
  );
}
