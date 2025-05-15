'use client';

import { Plus, Sun, Moon, LogIn, LogOut, LogOutIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";

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
}

export function Sidebar({
  isSidebarOpen,
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
  generateTitle
}: SidebarProps) {
  
  // Handle session selection with title generation
  const handleSessionSelect = (sessionId: string, session: Session) => {
    onSelectSession(sessionId);
    
    // If this session doesn't have a title and it's not already generating one
    if (!session.topic && sessionId === currentSessionId) {
      // Get the first message from the session to generate title
      generateTitle(sessionId, "Generate a title for this conversation");
    }
  };

  return (
    <aside 
      className={`${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } transition-transform duration-300 ease-in-out fixed md:relative z-50 h-screen bg-muted border-r border-border flex flex-col w-full`}
    >
      <div className="flex flex-col h-full">
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

        {/* Session List */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              Your conversations will appear here
            </div>
          ) : (
            <div className="py-2 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSessionSelect(session.id, session)}
                  className={cn(
                    "w-full px-4 py-2 text-sm text-left transition-colors hover:bg-muted/50 flex items-center justify-between group",
                    session.id === currentSessionId && "bg-muted"
                  )}
                >
                  <span className="truncate flex-1">
                    {session.topic || (session.id === currentSessionId ? (
                      <span className="text-muted-foreground italic">Generating title...</span>
                    ) : "New Chat")}
                  </span>
                  {session.id === currentSessionId && !session.topic && (
                    <span className="w-3 h-3 rounded-full border-2 border-t-transparent border-muted-foreground/50 animate-spin ml-2" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="mt-auto relative" ref={menuRef}>
          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
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
          )}

          {/* User Menu Button */}
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
        </div>
      </div>
    </aside>
  );
}
