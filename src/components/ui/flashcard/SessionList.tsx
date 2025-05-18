import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import React from 'react';

interface Session {
  id: string;
  topic: string | null;
  startedAt: Date;
}

export function SessionList({
  sessions,
  currentSessionId,
  handleSessionSelect
}: {
  sessions: Session[];
  currentSessionId: string | null;
  handleSessionSelect: (sessionId: string, session: Session) => void;
}) {
  if (sessions.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Your conversations will appear here
      </div>
    );
  }
  return (
    <div className="py-2 space-y-1">
      {sessions.map((session) => (
        <Button
          key={session.id}
          variant="ghost"
          onClick={() => handleSessionSelect(session.id, session)}
          className={cn(
            "w-full px-4 py-2 h-auto text-sm justify-start font-normal relative group",
            "hover:opacity-80 transition-opacity",
            session.id === currentSessionId && "bg-white/5 font-medium"
          )}
        >
          <span className="truncate flex-1 text-left">
            {session.topic || (session.id === currentSessionId ? (
              <span className="text-muted-foreground italic">Generating title...</span>
            ) : "New Chat")}
          </span>
          {!session.topic && session.id === currentSessionId && (
            <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-muted-foreground/50 animate-spin ml-2" />
          )}
          {!session.topic && session.id !== currentSessionId && (
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground/80">
              Start new conversation
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
