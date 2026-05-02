"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
} | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = localStorage.getItem("mimo-theme") as Theme;
    
    if (initialColorValue && initialColorValue !== theme) {
      setTimeout(() => setTheme(initialColorValue), 0);
      root.classList.toggle("dark", initialColorValue === "dark");
    } else if (!initialColorValue) {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      if (mql.matches && theme !== "dark") {
        setTimeout(() => setTheme("dark"), 0);
        root.classList.add("dark");
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("mimo-theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
