import { Sun, Moon, LogIn, LogOutIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import React from 'react';

export function UserMenuDropdown({
  isUserMenuOpen,
  theme,
  onToggleTheme
}: {
  isUserMenuOpen: boolean;
  theme: string;
  onToggleTheme: () => void;
}) {
  if (!isUserMenuOpen) return null;
  return (
    <div className="absolute bottom-full w-full border-b border-border">
      <button
        onClick={onToggleTheme}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-foreground bg-muted"
      >
        {theme === 'dark' ? (
          <>
            <Sun className="h-4 w-4 text-muted-foreground" />
            Toggle light mode
          </>
        ) : (
          <>
            <Moon className="h-4 w-4 text-muted-foreground" />
            Toggle dark mode
          </>
        )}
      </button>
      <button
        onClick={() => {
          redirect("/auth/login");
        }}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-foreground bg-muted hover:cursor-pointer">
        <LogIn className="h-4 w-4 text-muted-foreground" />
        Sign in to your account
      </button>
      <button
        onClick={() => {
          signOut();
        }}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-foreground bg-muted hover:cursor-pointer">
        <LogOutIcon className="h-4 w-4 text-muted-foreground" />
        Sign out
      </button>
    </div>
  );
}
