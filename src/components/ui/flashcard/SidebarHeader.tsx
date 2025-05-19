import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import React from 'react';

export function SidebarHeader({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <span className="font-semibold text-foreground">Chat History</span>
      <Button
        variant="ghost"
        size="icon"
        className="hover:opacity-80 transition-opacity relative group"
        onClick={onNewChat}
      >
        <Plus className="h-4 w-4" />
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground/80">
          New chat
        </span>
      </Button>
    </div>
  );
}
