'use client';

import { PanelLeft, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";

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
      <Link href="/home">
        <Button variant="ghost" size="icon" className="hover:cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </Link>
      <h1 className="font-semibold text-foreground">Ace</h1>
      <div className="ml-auto">
        <ThemeToggle size="sm" />
      </div>
    </header>
  );
}
