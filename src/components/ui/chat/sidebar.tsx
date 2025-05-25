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
  onCloseSidebar?: () => void;
}

export function Sidebar({
  isSidebarOpen,
  isMobileView,
  isUserMenuOpen,
  theme,
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
  onCloseSidebar,
}: SidebarProps) {
  // Handle session selection with title generation
  const handleSessionSelect = (sessionId: string, session: Session) => {
    onSelectSession(sessionId);
    if (onCloseSidebar) onCloseSidebar();

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
        <div className="flex-1 overflow-y-auto" onClick={() => {
          if (isMobileView && isSidebarOpen && onCloseSidebar) onCloseSidebar();
        }}>
          <SessionList sessions={sessions} currentSessionId={currentSessionId} handleSessionSelect={handleSessionSelect} />
        </div>
        <div className="mt-auto relative" ref={menuRef}>
          <UserMenuDropdown isUserMenuOpen={isUserMenuOpen} theme={theme} onToggleTheme={onToggleTheme} />
          <UserMenuButton onToggleUserMenu={onToggleUserMenu} isUserMenuOpen={isUserMenuOpen} avatar={avatar} username={username} />
        </div>
      </div>
    </aside>
  );
}
