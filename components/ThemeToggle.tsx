"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // Prevents hydration error

  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="flex flex-col items-center gap-1 hover:scale-110 transition-transform group"
    >
      {currentTheme === "dark" ? (
        <>
          <Sun className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
          <span className="text-xs text-white font-medium">Light</span>
        </>
      ) : (
        <>
          <Moon className="h-6 w-6 text-white group-hover:text-yellow-300 transition-colors" />
          <span className="text-xs text-white font-medium">Dark</span>
        </>
      )}
    </button>
  );
}