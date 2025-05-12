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
} from "lucide-react";
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

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    <div className="flex h-screen w-screen bg-zinc-900 text-zinc-100">
      {/* Sidebar - Now with mobile overlay */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out fixed md:relative z-50 h-screen bg-zinc-800 border-r border-zinc-700 flex flex-col ${
          isMobileView ? 'w-[80vw]' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-zinc-700">
            <span className="font-semibold text-zinc-100">Chat History</span>
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
              <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-zinc-200">
                New chat
              </span>
            </Button>
          </div>
          <div className="p-4 text-sm text-zinc-400">
            Your conversations will appear here
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-screen bg-zinc-900 relative">
        {/* Chat Header */}
        <header className="h-12 border-b border-zinc-800 flex items-center px-4 gap-4 bg-zinc-800/50">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:opacity-80 transition-opacity"
          >
            <PanelLeft className="h-4 w-4" />
          </Button>
          <h1 className="font-semibold text-zinc-100">Ace It AI</h1>
        </header>

        {/* Messages Area - Adjusted padding for mobile */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {messages.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-center p-4 md:p-8">
              <div className="space-y-2">
                <h2 className="text-xl md:text-2xl font-semibold text-zinc-100">Hello there!</h2>
                <p className="text-zinc-400">How can I help you today?</p>
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
                          <AvatarFallback className="bg-zinc-700 text-zinc-100">
                            {message.role === "ai" ? "🤖" : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <ChatBubbleMessage 
                          isLoading={message.isLoading}
                          className={`${message.role === "ai" ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-blue-600 border-blue-500 text-zinc-100"} w-full md:w-auto`}
                        >
                          <div className="flex md:hidden items-center gap-2 mb-1 text-xs text-zinc-400">
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
                                        className="size-6 bg-zinc-900 border-zinc-700 hover:bg-zinc-100 transition-colors group"
                                        key={index}
                                        icon={<Icon className="size-3 text-zinc-100 group-hover:text-zinc-900 transition-colors" />}
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
        <div className="p-2 md:p-4 bg-zinc-900">
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
                className="min-h-[60px] md:min-h-[80px] resize-none rounded-lg bg-zinc-800 border-zinc-700 p-3 text-zinc-100 placeholder:text-zinc-400"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    type="button"
                    className="h-8 w-8 hover:opacity-80 transition-opacity text-zinc-200"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  type="submit"
                  disabled={!input || isLoading}
                  className="bg-blue-600 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:bg-zinc-700 px-4 h-8 text-zinc-100"
                >
                  Send message
                  <CornerDownLeft className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}