'use client';

import { PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatHeaderProps {
  onToggleSidebar: () => void;
}

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="h-12 border-b border-border flex items-center px-4 gap-4 bg-muted/50">
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSidebar}
        className="hover:opacity-80 transition-opacity"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      <h1 className="font-semibold text-foreground">Ace It AI</h1>
    </header>
  );
}
