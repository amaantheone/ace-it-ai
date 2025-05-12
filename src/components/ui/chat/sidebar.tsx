'use client';

import { Plus, Sun, Moon, LogIn } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";

interface SidebarProps {
  isSidebarOpen: boolean;
  isMobileView: boolean;
  isUserMenuOpen: boolean;
  theme: string;
  selectedUser: {
    avatar: string;
    name: string;
  };
  onNewChat: () => void;
  onToggleTheme: () => void;
  onToggleUserMenu: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
}

export function Sidebar({
  isSidebarOpen,
  isMobileView,
  isUserMenuOpen,
  theme,
  selectedUser,
  onNewChat,
  onToggleTheme,
  onToggleUserMenu,
  menuRef
}: SidebarProps) {
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
        <div className="p-4 text-sm text-muted-foreground">
          Your conversations will appear here
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
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors text-sm text-foreground opacity-50 bg-muted"
                disabled
              >
                <LogIn className="h-4 w-4 text-muted-foreground" />
                Sign in to your account
              </button>
            </div>
          )}

          {/* User Menu Button */}
          <button
            onClick={onToggleUserMenu}
            className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors border-t border-border bg-muted"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={selectedUser.avatar} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="text-sm text-foreground font-medium">{selectedUser.name}</div>
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
