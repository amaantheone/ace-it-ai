'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import useChatStore from "@/hooks/useChatStore";
import { AnimatePresence, motion } from "framer-motion";
import {
  CornerDownLeft,
  PanelLeft,
  Paperclip,
  Plus,
  CopyIcon,
  RefreshCcw,
  ChevronUp,
  Sun,
  Moon,
  LogIn,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useEffect, useRef, useState } from "react";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Save Note",
  },
  {
    icon: RefreshCcw,
    label: "Explain Again",
  }
];

export default function Page() {
  const messages = useChatStore((state) => state.chatBotMessages);
  const setMessages = useChatStore((state) => state.setchatBotMessages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const handleInputChange = useChatStore((state) => state.handleInputChange);
  const hasInitialAIResponse = useChatStore((state) => state.hasInitialAIResponse);
  const setHasInitialAIResponse = useChatStore((state) => state.setHasInitialAIResponse);
  const [isLoading, setisLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const [isMobileView, setIsMobileView] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const getMessageVariant = (role: string) =>
    role === "ai" ? "received" : "sent";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input) return;

    setMessages((messages) => [
      ...messages,
      {
        id: messages.length + 1,
        avatar: selectedUser.avatar,
        name: selectedUser.name,
        role: "user",
        message: input,
      },
    ]);

    setInput("");
    formRef.current?.reset();
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (!hasInitialAIResponse) {        const initialConversation = [
        {
          id: 1,
          avatar: "",
          name: "AI Tutor",
          role: "ai",
          message: "Hi! 👋 I'm your AI tutor. Ask me anything you'd like to learn about!",
          className: "text-zinc-100"
        }
      ];

      setisLoading(true);
      setMessages(() => initialConversation);
      setisLoading(false);
      setHasInitialAIResponse(true);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar - Now with mobile overlay */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out fixed md:relative z-50 h-screen bg-muted border-r border-border flex flex-col ${
          isMobileView ? 'w-[80vw]' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <span className="font-semibold text-foreground">Chat History</span>
            <Button
              variant="ghost"
              size="icon"
              className="hover:opacity-80 transition-opacity relative group"
              onClick={() => {
                setMessages(() => []);
                setHasInitialAIResponse(false);
                if (isMobileView) {
                  setIsSidebarOpen(false);
                }
              }}>
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
            {/* User Menu Dropdown - Positioned above the button */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full w-full border-b border-border">
                <button
                  onClick={() => {
                    toggleTheme();
                    // Force a re-render of the entire app to update theme
                    document.documentElement.classList.toggle('dark');
                  }}
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

            {/* User Menu Button - Fixed at bottom */}
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
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

      {/* Overlay for mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-background relative">
        {/* Chat Header */}
        <header className="h-12 border-b border-border flex items-center px-4 gap-4 bg-muted/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:opacity-80 transition-opacity"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-foreground">Ace It AI</h1>
        </header>

        {/* Messages Area - Adjusted padding for mobile */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center p-4 md:p-8">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-semibold text-foreground">Hello there!</h2>
                <p className="text-muted-foreground">How can I help you today?</p>
              </div>
            </div>
          )}
          <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
            <ChatMessageList ref={messagesContainerRef}>
              <AnimatePresence>
                {messages.map((message, index) => {
                  const variant = getMessageVariant(message.role!);
                  return (
                    <motion.div
                      key={index}
                      layout
                      initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                      transition={{
                        opacity: { duration: 0.1 },
                        layout: {
                          type: "spring",
                          bounce: 0.3,
                          duration: index * 0.05 + 0.2,
                        },
                      }}
                      style={{ originX: 0.5, originY: 0.5 }}
                      className="flex flex-col gap-2 p-2 md:p-4 w-full"
                    >
                      <ChatBubble variant={variant} className="max-w-full md:max-w-[85%]">
                        <Avatar className="hidden md:flex">
                          <AvatarImage
                            src={message.role === "ai" ? "" : message.avatar}
                            alt="Avatar"
                            className={message.role === "ai" ? "dark:invert" : ""}
                          />
                          <AvatarFallback className="bg-muted text-foreground">
                            {message.role === "ai" ? "🤖" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <ChatBubbleMessage 
                          isLoading={message.isLoading}
                          className={`${message.role === "ai" ? "bg-muted" : "bg-primary/10"} border border-border text-foreground w-full md:w-auto`}
                        >
                          <div className="flex md:hidden items-center gap-2 mb-1 text-xs text-muted-foreground">
                            {message.role === "ai" ? "AI Tutor" : "You"}
                          </div>
                          {message.message}
                          {message.role === "ai" && (
                            <div className="flex items-center mt-1.5 gap-1">
                              {!message.isLoading && (
                                <>
                                  {ChatAiIcons.map((icon, index) => {
                                    const Icon = icon.icon;
                                    return (
                                      <ChatBubbleAction
                                        variant="outline"
                                        className="size-6 bg-background border-border hover:bg-foreground transition-colors group"
                                        key={index}
                                        icon={<Icon className="size-3 text-foreground group-hover:text-background transition-colors" />}
                                        onClick={() =>
                                          console.log(
                                            "Action " +
                                              icon.label +
                                              " clicked for message " +
                                              index,
                                          )
                                        }
                                      />
                                    );
                                  })}
                                </>
                              )}
                            </div>
                          )}
                        </ChatBubbleMessage>
                      </ChatBubble>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </ChatMessageList>
          </div>
        </div>

        {/* Input Area - Adjusted padding for mobile */}
        <div className="p-2 md:p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            <form
              ref={formRef}
              onSubmit={handleSendMessage}
              className="relative flex flex-col gap-2"
            >
              <ChatInput
                ref={inputRef}
                onKeyDown={handleKeyDown}
                onChange={handleInputChange}
                placeholder="Ask anything..."
                className="min-h-[60px] md:min-h-[80px] resize-none rounded-lg bg-muted border-border p-3 text-foreground placeholder:text-muted-foreground"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    type="button"
                    className="h-8 w-8 hover:opacity-80 transition-opacity text-foreground"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!input || isLoading}
                  variant="default"
                  size="sm"
                  className="gap-2"
                >
                  Send message
                  <CornerDownLeft className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}