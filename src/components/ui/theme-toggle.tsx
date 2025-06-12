'use client';

import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export function ThemeToggle({ 
  className = "", 
  variant = "ghost", 
  size = "icon",
  showLabel = false 
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  
  const handleToggle = () => {
    // Apply the animation effect
    toggleTheme();
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={`${className} ${showLabel ? "" : "rounded-full"}`}
      aria-label={`Toggle ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <>
          <Sun className={`h-5 w-5 ${showLabel ? "mr-2" : ""}`} />
          {showLabel && "Light mode"}
        </>
      ) : (
        <>
          <Moon className={`h-5 w-5 ${showLabel ? "mr-2" : ""}`} />
          {showLabel && "Dark mode"}
        </>
      )}
    </Button>
  );
}
