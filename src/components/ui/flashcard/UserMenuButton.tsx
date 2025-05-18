import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronUp } from "lucide-react";
import React from 'react';

export function UserMenuButton({
  onToggleUserMenu,
  isUserMenuOpen,
  avatar,
  username
}: {
  onToggleUserMenu: () => void;
  isUserMenuOpen: boolean;
  avatar: string | Blob | null | undefined;
  username: string;
}) {
  return (
    <button
      onClick={onToggleUserMenu}
      className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-t border-border bg-muted"
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
      <div className="flex-1 text-left">
        <div className="text-sm text-foreground font-medium">{username}</div>
      </div>
      <ChevronUp 
        className={`h-4 w-4 text-muted-foreground transition-transform ${
          isUserMenuOpen ? 'rotate-180' : ''
        }`} 
      />
    </button>
  );
}
