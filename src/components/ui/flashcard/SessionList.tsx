import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { cn } from '@/lib/utils';
import React, { useState, useCallback } from 'react';

interface Session {
  id: string;
  topic: string | null;
  startedAt: Date;
}

export function SessionList({
  sessions,
  currentSessionId,
  handleSessionSelect,
  onDeleteSession
}: {
  sessions: Session[];
  currentSessionId: string | null;
  handleSessionSelect: (sessionId: string, session: Session) => void;
  onDeleteSession?: (sessionId: string) => Promise<void>;
}) {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    sessionId: string;
  } | null>(null);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState<string | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, sessionId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      sessionId,
    });
  }, []);

  const handleDeleteClick = useCallback((sessionId: string) => {
    setContextMenu(null);
    setDeleteConfirmSession(sessionId);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirmSession && onDeleteSession) {
      try {
        await onDeleteSession(deleteConfirmSession);
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
    }
    setDeleteConfirmSession(null);
  }, [deleteConfirmSession, onDeleteSession]);

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  if (sessions.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Your conversations will appear here
      </div>
    );
  }

  return (
    <>
      <div className="py-2 space-y-1">
        {sessions.map((session) => (
          <Button
            key={session.id}
            variant="ghost"
            onClick={() => handleSessionSelect(session.id, session)}
            onContextMenu={(e) => handleContextMenu(e, session.id)}
            className={cn(
              "w-full px-4 py-2 h-auto text-sm justify-start font-normal relative group",
              "hover:opacity-80 transition-opacity",
              session.id === currentSessionId && "bg-white/5 font-medium"
            )}
          >
            <span className="truncate flex-1 text-left">
              {session.topic || (session.id === currentSessionId ? (
                <span className="text-muted-foreground italic">New Chat</span>
              ) : "New Chat")}
            </span>
            {!session.topic && session.id !== currentSessionId && (
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-foreground/80">
                Start new conversation
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[120px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
        >
          <button
            onClick={() => handleDeleteClick(contextMenu.sessionId)}
            className="w-full px-3 py-2 text-sm text-left hover:bg-muted text-destructive hover:text-destructive"
          >
            Delete
          </button>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteConfirmSession !== null}
        onCancel={() => setDeleteConfirmSession(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
