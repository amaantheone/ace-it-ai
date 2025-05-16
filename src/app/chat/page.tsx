'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useSessionStore, Message } from "@/hooks/useSessionStore";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/ui/chat/sidebar";
import { ChatHeader } from "@/components/ui/chat/chat-header";
import { ChatInputArea } from "@/components/ui/chat/chat-input-area";
import { ChatMessages } from "@/components/ui/chat/chat-messages";
import { handleSendMessage as handleSendMessageUtil, handleKeyDown as handleKeyDownUtil } from "@/utils/chatFunctions/messageHandlers";
import { generateTitle as generateTitleUtil, createNewSession as createNewSessionUtil, handleNewChat as handleNewChatUtil, getCurrentSessionMessages as getCurrentSessionMessagesUtil } from "@/utils/chatFunctions/sessionHandlers";

export default function ChatPage() {
  const {
    sessions,
    currentSessionId,
    messages,
    input,
    isLoading,
    setSessions,
    setCurrentSessionId,
    setMessages,
    setInput,
    setIsLoading,
  } = useSessionStore();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const username = session?.user?.name || "Guest";
  const avatar = session?.user?.image;

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Click outside handler for user menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Load initial sessions
  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch('/api/session');
        if (!response.ok) {
          throw new Error('Failed to load sessions');
        }
        const data = await response.json();
        setSessions(data);
        
        // If there are no sessions, create one
        if (data.length === 0) {
          const newSessionResponse = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          if (!newSessionResponse.ok) {
            throw new Error('Failed to create session');
          }

          const newSession = await newSessionResponse.json();
          setSessions([newSession]);
          setCurrentSessionId(newSession.id);

          const initialConversation: Message[] = [
            {
              id: crypto.randomUUID(),
              avatar: "",
              name: "AI Tutor",
              role: "ai" as const,
              message: "Hi! 👋 I'm your AI tutor. Ask me anything you'd like to learn about!",
              className: "text-zinc-100"
            }
          ];

          setIsLoading(true);
          setMessages(newSession.id, initialConversation);
          setIsLoading(false);
        } else {
          // Set the most recent session as current if none is selected
          if (!currentSessionId) {
            setCurrentSessionId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      }
    }
    loadSessions();
  }, [setSessions, setCurrentSessionId, setMessages, setIsLoading, currentSessionId]);

  // Load messages when switching sessions
  useEffect(() => {
    async function loadMessages() {
      if (!currentSessionId) return;
      try {
        const response = await fetch(`/api/session/${currentSessionId}/messages`);
        if (!response.ok) {
          throw new Error('Failed to load messages');
        }
        const data = await response.json();
        setMessages(currentSessionId, data);
      } catch (error) {
        console.error('Error loading messages:', error);
      }
    }
    loadMessages();
  }, [currentSessionId, setMessages]);

  const generateTitle = useCallback(async (sessionId: string, message: string) => {
    await generateTitleUtil(sessionId, message, sessions, setSessions);
  }, [sessions, setSessions]);

  const getCurrentSessionMessages = useCallback(() => {
    return getCurrentSessionMessagesUtil(currentSessionId, messages);
  }, [currentSessionId, messages]);

  const handleNewChat = useCallback(() => {
    handleNewChatUtil({
      sessions,
      setSessions,
      setCurrentSessionId,
      setMessages,
      isMobileView,
      setIsSidebarOpen
    });
  }, [sessions, setSessions, setCurrentSessionId, setMessages, isMobileView]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDownUtil(e, handleSendMessage);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    if (!currentSessionId) return;
    handleSendMessageUtil(e, {
      input,
      currentSessionId,
      username,
      avatar,
      messages,
      setInput,
      setMessages,
      setSessions,
      sessions,
      formRef: formRef as React.RefObject<HTMLFormElement>
    });
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar Container */}
      <div className={`${isSidebarOpen ? 'w-64 md:w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          isMobileView={isMobileView}
          isUserMenuOpen={isUserMenuOpen}
          theme={theme}
          selectedUser={undefined}
          username={username}
          avatar={avatar}
          onNewChat={handleNewChat}
          onToggleTheme={() => {
            toggleTheme();
            document.documentElement.classList.toggle('dark');
          }}
          onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
          menuRef={menuRef}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          generateTitle={generateTitle}
        />
      </div>

      {/* Overlay for mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-background relative">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <ChatMessages
            messages={getCurrentSessionMessages()}
            messagesContainerRef={messagesContainerRef}
          />
        </div>

        <ChatInputArea
          input={input}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </div>
  );
}