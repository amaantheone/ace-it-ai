'use client';

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useGuest } from "@/contexts/GuestContext";
import { useSessionStore, Session, Message } from "@/hooks/useSessionStore";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/ui/chat/sidebar";
import { ChatHeader } from "@/components/ui/chat/chat-header";
import { ChatInputArea } from "@/components/ui/chat/chat-input-area";
import { ChatMessages } from "@/components/ui/chat/chat-messages";
import { LoginPopup } from "@/components/ui/login-popup";
import { handleSendMessage as handleSendMessageUtil, handleKeyDown as handleKeyDownUtil, sendSuggestionMessage } from "@/utils/chatFunctions/messageHandlers";
import { generateTitle as generateTitleUtil, handleNewChat as handleNewChatUtil, getCurrentSessionMessages as getCurrentSessionMessagesUtil, loadInitialSessions, loadMessagesForSession, persistGuestState, deleteSession } from "@/utils/chatFunctions/sessionHandlers";
import { exportChatAsPDF } from "@/utils/chatPdfExport";
import SuggestionsGrid from "@/components/ui/chat/suggestions-grid";
import { useScrollToBottom } from "@/components/ui/chat/hooks/useScrollToBottom";

export default function ChatPage() {
  const { data: session } = useSession();
  const { 
    isGuest, 
    guestMessageCount,
    incrementGuestMessageCount, 
    showChatLoginPopup,
    setShowChatLoginPopup,
    saveGuestData,
    loadGuestData 
  } = useGuest();

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
  const [loginPopupVariant, setLoginPopupVariant] = useState<"limit" | "newSession">("limit");
  const { theme, toggleTheme } = useTheme();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const username = session?.user?.name || "Guest";
  const avatar = session?.user?.image;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { bottomRef, showScrollToBottom, handleScroll, scrollToBottom } = useScrollToBottom({ threshold: 100, behavior: 'smooth' });

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

  // Scroll handlers now provided by useScrollToBottom hook

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
    loadInitialSessions({
      isGuest,
      loadGuestData,
      saveGuestData,
      currentSessionId,
      setSessions,
      setCurrentSessionId,
      setMessages,
      setIsLoading,
    });
  }, [setSessions, setCurrentSessionId, setMessages, setIsLoading, currentSessionId, isGuest, loadGuestData, saveGuestData]);

  // Load messages when switching sessions
  useEffect(() => {
    loadMessagesForSession({
      currentSessionId,
      isGuest,
      loadGuestData,
      setMessages,
      setIsLoading,
    });
  }, [currentSessionId, setMessages, isGuest, loadGuestData, setIsLoading]);

  // Save sessions/messages to localStorage on change (guest only)
  useEffect(() => {
    persistGuestState({
      isGuest,
      sessions: sessions as Session[],
      messages,
      saveGuestData,
    });
  }, [sessions, messages, isGuest, saveGuestData]);

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
      setIsSidebarOpen,
      isGuest,
    setShowChatLoginPopup,
    setLoginPopupVariant,
    });
  }, [sessions, setSessions, setCurrentSessionId, setMessages, isMobileView, isGuest, setShowChatLoginPopup]);

  const handleDeleteSession = useCallback(async (sessionId: string) => {
    await deleteSession({
      sessionId,
      sessions,
      setSessions,
      currentSessionId,
      setCurrentSessionId,
      setMessages,
      isGuest,
      loadGuestData,
      saveGuestData,
    });
  }, [sessions, setSessions, currentSessionId, setCurrentSessionId, setMessages, isGuest, loadGuestData, saveGuestData]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    handleKeyDownUtil(e, handleSendMessage, isLoading);
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentSessionId || isLoading) return; // Prevent submission if already loading

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
      isGuestMode: isGuest,
      guestMessageCount,
      incrementGuestMessageCount,
      setShowChatLoginPopup,
      guestMessageLimit: 4,
      setLoginPopupVariant,
      isLoading,
      setIsLoading,
    });
  };

  const handleGuestMessageEdit = useCallback(async (messageIndex: number, newContent: string) => {
    if (!currentSessionId) return;

    try {
      // Get current session messages
      const currentMessages = getCurrentSessionMessages();
      
      // Get the message ID from the index
      const messageToEdit = currentMessages[messageIndex];
      if (!messageToEdit) return;
      
      // Remove any AI response that follows the edited message (for regeneration)
      let messagesToKeep = currentMessages.slice(0, messageIndex + 1);
      
      // Update the specific message content
      messagesToKeep = messagesToKeep.map((msg: Message, index: number) => 
        index === messageIndex ? { ...msg, message: newContent } : msg
      );
      
      // Update local state with messages up to the edited one
      setMessages(currentSessionId, messagesToKeep);

      // Save to guest storage
      const allMessages = { ...messages, [currentSessionId]: messagesToKeep };
      saveGuestData('messages', allMessages);

      // Trigger regeneration by sending to the API
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: newContent,
          username,
          avatar,
          isGuestMode: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate response');
      }

      const data = await response.json();
      
      // Add the new AI response to the messages
      const newAiMessage: Message = {
        id: crypto.randomUUID(),
        message: data.message,
        role: "ai",
        name: "AI Tutor",
      };
      
      const finalMessages = [...messagesToKeep, newAiMessage];
      setMessages(currentSessionId, finalMessages);
      
      // Update guest storage with final messages
      const finalAllMessages = { ...messages, [currentSessionId]: finalMessages };
      saveGuestData('messages', finalAllMessages);
    } catch (error) {
      console.error('Failed to edit guest message:', error);
      // Revert the message change on error
      if (currentSessionId) {
        const currentMessages = getCurrentSessionMessages();
        setMessages(currentSessionId, currentMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, messages, setMessages, saveGuestData, username, avatar, setIsLoading, getCurrentSessionMessages]);

  const handleGuestRegenerate = useCallback(async () => {
    if (!currentSessionId) return;

    try {
      // Get current session messages
      const currentMessages = getCurrentSessionMessages();
      
      // Find the last user message
      const lastUserIndex = [...currentMessages]
        .map((m, i) => ({ ...m, i }))
        .reverse()
        .find((m) => m.role === "user");
      
      if (!lastUserIndex?.message) return;
      
      const userIdx = lastUserIndex.i;
      
      // Find the last AI message after the last user message
      const aiIdx = currentMessages
        .slice(userIdx + 1)
        .findIndex((m) => m.role === "ai");
      const aiMessageIdx = aiIdx !== -1 ? userIdx + 1 + aiIdx : -1;

      // Remove the last AI message if it exists
      let newMessages = currentMessages.slice(
        0,
        aiMessageIdx !== -1 ? aiMessageIdx : currentMessages.length
      );

      // Add loading message
      const loadingMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        message: "",
        isLoading: true,
      };
      newMessages = [...newMessages, loadingMessage];
      
      // Update local state with loading message
      setMessages(currentSessionId, newMessages);
      
      // Save to guest storage
      const allMessages = { ...messages, [currentSessionId]: newMessages };
      saveGuestData('messages', allMessages);

      // Call API for regeneration
      setIsLoading(true);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-regenerate': 'true',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          message: lastUserIndex.message,
          isGuestMode: true,
          guestMessages: newMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            content: msg.message || '',
            id: msg.id,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate response');
      }

      const data = await response.json();
      
      // Replace the loading message with the actual response
      const finalMessages = newMessages.map((msg) =>
        msg.id === loadingMessage.id
          ? {
              ...msg,
              message: data.message,
              isLoading: false,
              name: "AI Tutor",
            }
          : msg
      );
      
      setMessages(currentSessionId, finalMessages);
      
      // Update guest storage with final messages
      const finalAllMessages = { ...messages, [currentSessionId]: finalMessages };
      saveGuestData('messages', finalAllMessages);
    } catch (error) {
      console.error('Failed to regenerate guest response:', error);
      
      // Remove loading message on error and revert to original state
      if (currentSessionId) {
        const currentMessages = getCurrentSessionMessages();
        const messagesWithoutLoading = currentMessages.filter(msg => !msg.isLoading);
        setMessages(currentSessionId, messagesWithoutLoading);
        
        const allMessages = { ...messages, [currentSessionId]: messagesWithoutLoading };
        saveGuestData('messages', allMessages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentSessionId, messages, setMessages, saveGuestData, setIsLoading, getCurrentSessionMessages]);

  // Handler to send a suggestion as a user message
  const handleSuggestionClick = async (text: string) => {
    await sendSuggestionMessage(text, {
      currentSessionId,
      isGuestMode: isGuest,
      guestMessageCount,
      incrementGuestMessageCount,
      setShowChatLoginPopup,
      avatar,
      username,
      messages,
      setMessages,
      setInput,
      setIsLoading,
      formRef: formRef as React.RefObject<HTMLFormElement>,
      sessions: sessions as Session[],
      setSessions,
      setLoginPopupVariant,
    });
  };

  // Handler to export chat as PDF
  const handleExportPDF = () => {
    const currentMessages = getCurrentSessionMessages();
    const currentSession = sessions.find(session => session.id === currentSessionId);
    const sessionTitle = currentSession?.topic || 'Chat Conversation';
    
    exportChatAsPDF(currentMessages, sessionTitle);
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex h-screen w-screen min-h-0 bg-background text-foreground">
      {/* Login Popup for guests after 3 messages */}
      <LoginPopup 
        isOpen={showChatLoginPopup}
        title="Continue with an Account"
        description={loginPopupVariant === "newSession" 
          ? "Guests can have only one chat. Sign in to create and manage multiple conversations."
          : "You've sent 3 messages as a guest. Please sign in to continue chatting and save your conversations."}
        closable={true}
        onClose={() => setShowChatLoginPopup(false)}
      />

      {/* Sidebar for desktop (flex child) */}
      <div className={`hidden md:block w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? '' : 'md:-ml-64'}`}> 
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          isMobileView={false}
          isUserMenuOpen={isUserMenuOpen}
          isGuest={isGuest}
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
          onDeleteSession={handleDeleteSession}
          onCloseSidebar={() => setIsSidebarOpen(false)}
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
              isGuest={isGuest}
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
              onDeleteSession={handleDeleteSession}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}

  {/* Main Chat Area */}
  <div className="flex-1 min-h-0 flex flex-col bg-background relative">
        <ChatHeader 
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
          onExportPDF={handleExportPDF}
          hasMessages={getCurrentSessionMessages().length > 0}
        />
  {/* Messages Area */}
  <div className="flex-1 min-h-0 overflow-y-auto flex flex-col relative" onScroll={handleScroll}>
          <ChatMessages
            messages={getCurrentSessionMessages()}
            messagesContainerRef={messagesContainerRef}
            bottomRef={bottomRef}
            isLoading={isLoading}
            isGuestMode={isGuest}
            onGuestMessageEdit={handleGuestMessageEdit}
            onGuestRegenerate={handleGuestRegenerate}
          />
        </div>
        {/* Suggestions Grid (only if messages aren't loading AND user has sent 0 messages in this session) */}
        <SuggestionsGrid
          onSuggestionClick={handleSuggestionClick}
          isLoading={isLoading}
          userMessageCount={getCurrentSessionMessages().filter(m => m.role === "user").length}
        />
        <ChatInputArea
          input={input}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          onKeyDown={handleKeyDown}
          onChange={(e) => setInput(e.target.value)}
          selectedFile={selectedFile}
          onFileChange={setSelectedFile}
          onRemoveFile={() => setSelectedFile(null)}
          showScrollToBottom={showScrollToBottom}
          onScrollToBottom={scrollToBottom}
        />
      </div>
    </div>
  );
}