'use client';

import { SidebarHeader } from '@/components/ui/flashcard/SidebarHeader';
import { SessionList } from '@/components/ui/flashcard/SessionList';
import { UserMenuDropdown } from '@/components/ui/flashcard/UserMenuDropdown';
import { UserMenuButton } from '@/components/ui/flashcard/UserMenuButton';

interface Session {
  id: string;
  topic: string | null;
  startedAt: Date;
}

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobileView: boolean;
  isUserMenuOpen: boolean;
  theme: string;
  isGuest?: boolean;
  selectedUser?: {
    avatar: string;
    name: string;
  };
  username: string;
  avatar: string | Blob | null | undefined;
  onNewChat: () => void;
  onToggleTheme: () => void;
  onToggleUserMenu: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  sessions: Session[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  generateTitle: (sessionId: string, message: string) => Promise<void>;
  onDeleteSession?: (sessionId: string) => Promise<void>;
  onCloseSidebar?: () => void;
}

export function Sidebar({
  isSidebarOpen,
  isMobileView,
  isUserMenuOpen,
  theme,
  isGuest = false,
  username,
  avatar,
  onNewChat,
  onToggleTheme,
  onToggleUserMenu,
  menuRef,
  sessions,
  currentSessionId,
  onSelectSession,
  generateTitle,
  onDeleteSession,
  onCloseSidebar,
}: SidebarProps) {
  // Handle session selection with title generation
  const handleSessionSelect = (sessionId: string, session: Session) => {
    onSelectSession(sessionId);
    
    // Only close sidebar on mobile view when a session is selected
    if (isMobileView && onCloseSidebar) {
      onCloseSidebar();
    }

    // If this session doesn't have a title and it's not already generating one
    if (!session.topic && sessionId === currentSessionId) {
      // Get the first message from the session to generate title
      generateTitle(sessionId, "Generate a title for this conversation");
    }
  };

  return (
    <aside 
      className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        transition-transform duration-300 ease-in-out
        fixed md:relative z-50 h-screen bg-muted border-r border-border flex flex-col
        w-[75vw] max-w-xs md:w-full
        ${isMobileView ? 'left-0 top-0' : ''}
      `}
      style={isMobileView ? { width: '75vw', maxWidth: 320, minWidth: 240 } : {}}
    >
      <div className="flex flex-col h-full">
        <SidebarHeader onNewChat={onNewChat} />
        <div className="flex-1 overflow-y-auto">
          {isGuest ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Sign in to view and manage your chats.
            </div>
          ) : (
            <SessionList
              sessions={sessions}
              currentSessionId={currentSessionId}
              handleSessionSelect={handleSessionSelect}
              onDeleteSession={onDeleteSession}
            />
          )}
        </div>
        <div className="mt-auto relative" ref={menuRef}>
          <UserMenuDropdown isUserMenuOpen={isUserMenuOpen} theme={theme} onToggleTheme={onToggleTheme} />
          <UserMenuButton onToggleUserMenu={onToggleUserMenu} isUserMenuOpen={isUserMenuOpen} avatar={avatar} username={username} />
        </div>
      </div>
    </aside>
  );
}
