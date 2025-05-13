'use client';

import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import useChatStore from "@/hooks/useChatStore";
import { useSession, signIn } from "next-auth/react";
import { Sidebar } from "@/components/ui/chat/sidebar";
import { ChatHeader } from "@/components/ui/chat/chat-header";
import { ChatMessages } from "@/components/ui/chat/chat-messages";
import { ChatInputArea } from "@/components/ui/chat/chat-input-area";
import { Bot } from "lucide-react";

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



  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!input) return;

  const userMessage = input;

  // Add user message
  setMessages((messages) => [
    ...messages,
    {
      id: messages.length + 1,
      avatar: avatar || "",
      name: username,
      role: "user",
      message: userMessage,
    },
  ]);
  // Add AI message with loading state
  setMessages((messages) => [
    ...messages,
    {
      id: messages.length + 1,
      avatar: "",
      name: "AI Tutor",
      role: "ai",
      message: "",
      isLoading: true,
    },
  ]);

  setInput("");
  formRef.current?.reset();

  try {
    setisLoading(true);

    // Prepare messages for backend
    const formattedMessages = [
      ...messages.map((msg) => ({
        role: msg.role === "ai" ? "assistant" : "user",
        content: msg.message,
      })),
      { role: "user", content: userMessage }
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: formattedMessages }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No reader available');

    let accumulatedMessage = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      accumulatedMessage += chunk;

      setMessages((messages) => {
        const newMessages = [...messages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "ai") {
          lastMessage.message = accumulatedMessage;
          lastMessage.isLoading = false;
        }
        return newMessages;
      });
    }

  } catch (error) {
    console.error("Error:", error);
    setMessages((messages) => {
      const newMessages = [...messages];
      const lastMessage = newMessages[newMessages.length - 1];
      if (lastMessage.role === "ai") {
        lastMessage.message = "Sorry, there was an error. Please try again.";
        lastMessage.isLoading = false;
      }
      return newMessages;
    });
  } finally {
    setisLoading(false);
  }
};


  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    if (!hasInitialAIResponse) { 
      const initialConversation = [
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
      {/* Sidebar Container */}
      <div className={`${isSidebarOpen ? 'w-64 md:w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden`}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen}
          isMobileView={isMobileView}
          isUserMenuOpen={isUserMenuOpen}
          theme={theme}
          selectedUser={selectedUser}
          username={username}
          //@ts-ignore
          avatar={avatar}
          onNewChat={() => {
            setMessages(() => []);
            setHasInitialAIResponse(false);
            if (isMobileView) {
              setIsSidebarOpen(false);
            }
          }}
          onToggleTheme={() => {
            toggleTheme();
            document.documentElement.classList.toggle('dark');
          }}
          onToggleUserMenu={() => setIsUserMenuOpen(!isUserMenuOpen)}
          menuRef={menuRef}
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
            messages={messages}
            messagesContainerRef={messagesContainerRef}
          />
        </div>

        <ChatInputArea
          input={input}
          isLoading={isLoading}
          onSubmit={handleSendMessage}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
        />
      </div>
    </div>
  );
}