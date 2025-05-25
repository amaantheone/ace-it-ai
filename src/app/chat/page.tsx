'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useSessionStore, Message, Session } from "../../hooks/useSessionStore";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "../../components/ui/chat/sidebar";
import { ChatHeader } from "../../components/ui/chat/chat-header";
import { ChatInputArea } from "../../components/ui/chat/chat-input-area";
import { ChatMessages } from "../../components/ui/chat/chat-messages";
import { handleSendMessage as handleSendMessageUtil, handleKeyDown as handleKeyDownUtil } from "../../utils/chatFunctions/messageHandlers";
import { generateTitle as generateTitleUtil, handleNewChat as handleNewChatUtil, getCurrentSessionMessages as getCurrentSessionMessagesUtil } from "../../utils/chatFunctions/sessionHandlers";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";

export default function ChatPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

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

  const username = session?.user?.name || "Guest";
  const avatar = session?.user?.image;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
          setIsLoading(true);
          setMessages(newSession.id, []);
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
    await generateTitleUtil(sessionId, message, sessions as Session[], setSessions);
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
      sessions: sessions as Session[],
      formRef: formRef as React.RefObject<HTMLFormElement>,
      selectedFile,
      setSelectedFile,
    });
  };

  // Handler to send a suggestion as a user message
  const handleSuggestionClick = async (text: string) => {
    if (!currentSessionId) return;
    // Optimistically add the user message to the chat
    const userMessage: Message = {
      id: crypto.randomUUID(),
      avatar: avatar || '',
      name: username,
      role: 'user',
      message: text,
      className: ''
    };
    setMessages(currentSessionId, [
      ...(messages[currentSessionId] || []),
      userMessage
    ]);
    setInput('');
    setIsLoading(true);
    // Call the same logic as handleSendMessageUtil for AI response
    await handleSendMessageUtil({
      preventDefault: () => {},
      target: formRef.current as HTMLFormElement
    } as unknown as React.FormEvent<HTMLFormElement>, {
      input: text,
      currentSessionId,
      username,
      avatar,
      messages,
      setInput,
      setMessages,
      setSessions,
      sessions: sessions as Session[],
      formRef: formRef as React.RefObject<HTMLFormElement>
    });
    setIsLoading(false);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar for desktop (flex child) */}
      <div className="hidden md:block w-64 flex-shrink-0">
        <Sidebar 
          isSidebarOpen={true}
          isMobileView={false}
          isUserMenuOpen={isUserMenuOpen}
          theme={theme}
          selectedUser={undefined}
          username={username}
          avatar={avatar}
          onNewChat={handleNewChat}
          onToggleTheme={() => {
            toggleTheme();
          }}
          onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
          menuRef={menuRef}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          generateTitle={generateTitle}
          onCloseSidebar={() => {}}
        />
      </div>

      {/* Sidebar for mobile (fixed overlay) */}
      {isMobileView && isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />
          <div className="fixed left-0 top-0 h-full w-[75vw] z-50 bg-background shadow-lg transition-transform duration-300">
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
              }}
              onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
              menuRef={menuRef}
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={setCurrentSessionId}
              generateTitle={generateTitle}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-background relative">
        <ChatHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto flex flex-col relative">
          <ChatMessages
            messages={getCurrentSessionMessages()}
            messagesContainerRef={messagesContainerRef}
          />
        </div>
        {/* Suggestions Grid (only if user has sent 0 messages in this session) */}
        {getCurrentSessionMessages().filter(m => m.role === "user").length === 0 && (
          <div className="w-full flex justify-center mt-6 mb-4">
            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              <Card className="p-0 shadow-none border-none bg-transparent">
                <Button
                  variant="outline"
                  className="w-full h-24 px-0 py-0 rounded-xl flex flex-col items-start justify-center text-left group hover:cursor-pointer"
                  onClick={() => handleSuggestionClick('Explain the concept of photosynthesis')}
                >
                  <span className="font-semibold text-lg leading-tight pl-5 pt-4">Explain the concept</span>
                  <span className="text-muted-foreground text-sm font-normal pl-5 pb-4 pt-1 group-hover:text-foreground transition-colors">of photosynthesis</span>
                </Button>
              </Card>
              <Card className="p-0 shadow-none border-none bg-transparent">
                <Button
                  variant="outline"
                  className="w-full h-24 px-0 py-0 rounded-xl flex flex-col items-start justify-center text-left group hover:cursor-pointer"
                  onClick={() => handleSuggestionClick('What is the difference between mitosis and meiosis?')}
                >
                  <span className="font-semibold text-lg leading-tight pl-5 pt-4">What is the difference</span>
                  <span className="text-muted-foreground text-sm font-normal pl-5 pb-4 pt-1 group-hover:text-foreground transition-colors">between mitosis and meiosis?</span>
                </Button>
              </Card>
              <Card className="p-0 shadow-none border-none bg-transparent">
                <Button
                  variant="outline"
                  className="w-full h-24 px-0 py-0 rounded-xl flex flex-col items-start justify-center text-left group hover:cursor-pointer"
                  onClick={() => handleSuggestionClick('Help me write an essay about silicon valley')}
                >
                  <span className="font-semibold text-lg leading-tight pl-5 pt-4">Help me write an essay</span>
                  <span className="text-muted-foreground text-sm font-normal pl-5 pb-4 pt-1 group-hover:text-foreground transition-colors">about silicon valley</span>
                </Button>
              </Card>
              <Card className="p-0 shadow-none border-none bg-transparent">
                <Button
                  variant="outline"
                  className="w-full h-24 px-0 py-0 rounded-xl flex flex-col items-start justify-center text-left group hover:cursor-pointer"
                  onClick={() => handleSuggestionClick('What is the weather in San Francisco?')}
                >
                  <span className="font-semibold text-lg leading-tight pl-5 pt-4">What is the weather</span>
                  <span className="text-muted-foreground text-sm font-normal pl-5 pb-4 pt-1 group-hover:text-foreground transition-colors">in San Francisco?</span>
                </Button>
              </Card>
            </div>
          </div>
        )}
        <ChatInputArea
          input={input}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
          onRemoveFile={() => setSelectedFile(null)}
        />
      </div>
    </div>
  );
}