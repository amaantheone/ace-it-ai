"use client";

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
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
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
  },
  {
    icon: Volume2,
    label: "Read Aloud",
  },
];

const topics = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Literature",
  "History",
];

export default function Page() {
  const messages = useChatStore((state) => state.chatBotMessages);
  const setMessages = useChatStore((state) => state.setchatBotMessages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const handleInputChange = useChatStore((state) => state.handleInputChange);
  const hasInitialAIResponse = useChatStore(
    (state) => state.hasInitialAIResponse,
  );
  const setHasInitialAIResponse = useChatStore(
    (state) => state.setHasInitialAIResponse,
  );
  const [isLoading, setisLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getMessageVariant = (role: string) =>
    role === "ai" ? "received" : "sent";
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

    if (!hasInitialAIResponse) {
      const initialConversation = [
        {
          id: 1,
          avatar: "",
          name: "AI Tutor",
          role: "ai",
          message: "Hi! 👋 I'm your AI tutor. You can select a specific topic to study, or just ask me anything you'd like to learn about.",
        },
        {
          id: 2,
          avatar: selectedUser.avatar,
          name: selectedUser.name,
          role: "user",
          message: "Can you help me understand what Newton's First Law means?",
        },
        {
          id: 3,
          avatar: "",
          name: "AI Tutor",
          role: "ai",
          message: "Of course! Newton's First Law, also known as the Law of Inertia, states that an object will remain at rest or in uniform motion unless acted upon by an external force. Let me break this down with a simple example:\n\nImagine you're riding a bike. When you stop pedaling:\n\n1. On a flat surface with no friction, you'd keep moving at the same speed (uniform motion)\n2. In reality, friction and air resistance (external forces) slow you down\n\nWould you like me to explain this further or give more examples?",
        }
      ];

      setisLoading(true);
      setMessages(() => initialConversation);
      setisLoading(false);
      setHasInitialAIResponse(true);
      
      // Auto-select Physics topic since the conversation is about Newton's Law
      setSelectedTopic("Physics");
    }
  }, []);

  return (
    <div className="flex h-screen sm:h-xl w-full sm:w-[900px] flex-col mx-auto my-auto">
      <div className="flex items-center justify-between p-4 border-b bg-muted/40">
        <div className="flex items-center gap-4">
          <select
            value={selectedTopic || ""}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2 text-sm focus:ring-1 focus:ring-ring"
          >
            <option value="">Select a Topic</option>
            {topics.map((topic) => (
              <option key={topic} value={topic}>
                {topic}
              </option>
            ))}
          </select>
          {selectedTopic && (
            <div className="text-sm text-muted-foreground">
              Studying: <span className="font-medium text-foreground">{selectedTopic}</span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setMessages(() => []);
            setSelectedTopic(null);
            setisLoading(true);
            setTimeout(() => {
              setMessages(() => [{
                id: 1,
                avatar: "",
                name: "AI Tutor",
                role: "ai",
                message: "Hi! 👋 I'm your AI tutor. You can select a specific topic to study, or just ask me anything you'd like to learn about.",
              }]);
              setisLoading(false);
            }, 2500);
          }}
        >
          Start New Session
        </Button>
      </div>
      <div className="flex-1 w-full overflow-y-auto bg-muted/40">
        <ChatMessageList ref={messagesContainerRef}>
          {/* Chat messages */}
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
                  className="flex flex-col gap-2 p-4"
                >
                  <ChatBubble key={index} variant={variant}>
                    <Avatar>
                      <AvatarImage
                        src={message.role === "ai" ? "" : message.avatar}
                        alt="Avatar"
                        className={message.role === "ai" ? "dark:invert" : ""}
                      />
                      <AvatarFallback>
                        {message.role === "ai" ? "🤖" : "GG"}
                      </AvatarFallback>
                    </Avatar>
                    <ChatBubbleMessage isLoading={message.isLoading}>
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
                                    className="size-6"
                                    key={index}
                                    icon={<Icon className="size-3" />}
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
      <div className="px-4 pb-4 bg-muted/40">
        <form
          ref={formRef}
          onSubmit={handleSendMessage}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            placeholder={selectedTopic 
              ? `Ask anything about ${selectedTopic}...` 
              : "Ask me anything you'd like to learn about..."}
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button 
              variant="ghost" 
              size="icon"
              title="Upload study material"
            >
              <Paperclip className="size-4" />
              <span className="sr-only">Upload study material</span>
            </Button>

            <Button 
              variant="ghost" 
              size="icon"
              title="Voice question"
            >
              <Mic className="size-4" />
              <span className="sr-only">Ask with voice</span>
            </Button>

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Ask Question
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}