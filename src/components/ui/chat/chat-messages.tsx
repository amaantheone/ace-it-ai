'use client';

import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatMessageList } from "./chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction
} from "./chat-bubble";
import { RefreshCcw, CopyIcon } from "lucide-react";
import Markdown from 'markdown-to-jsx';
import { Message } from '@/app/data';
import useChatStore from '@/hooks/useChatStore';

interface ExtendedMessage extends Message {
  role?: string;
  isLoading?: boolean;
  className?: string;
}

interface ChatMessagesProps {
  messages: ExtendedMessage[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
}

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

export function ChatMessages({ messages, messagesContainerRef }: ChatMessagesProps) {
  const getMessageVariant = (role?: string) => role === "ai" ? "received" : "sent";

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center p-4 md:p-8">
        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">Hello there!</h2>
          <p className="text-muted-foreground">How can I help you today?</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 md:px-0">
      <ChatMessageList ref={messagesContainerRef}>
        <AnimatePresence>
          {messages.map((message, index) => {
            const variant = getMessageVariant(message.role);
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
                    <div className="prose dark:prose-invert max-w-none">
                      {message.role === "ai" ? (
                        <Markdown options={{
                          overrides: {
                            p: {
                              props: {
                                className: 'mb-2'
                              }
                            },
                            ul: {
                              props: {
                                className: 'list-disc pl-4 mb-2 space-y-1'
                              }
                            },
                            li: {
                              props: {
                                className: 'ml-2'
                              }
                            }
                          }
                        }}>
                          {message.message || ''}
                        </Markdown>
                      ) : (
                        message.message
                      )}
                    </div>
                    {message.role === "ai" && (
                      <div className="flex items-center mt-1.5 gap-1">
                        {!message.isLoading && (
                          <>
                            {ChatAiIcons.map((icon, index) => {
                              const Icon = icon.icon;
                              return (
                                <ChatBubbleAction
                                  key={index}
                                  variant="outline"
                                  className="size-6 bg-background border-border hover:bg-foreground transition-colors group cursor-pointer"
                                  icon={<Icon className="size-3 text-foreground group-hover:text-background transition-colors" />}
                                  onClick={() => {
                                    if (icon.label === "Save Note") {
                                      navigator.clipboard.writeText(message.message || "");
                                    } else if (icon.label === "Explain Again") {
                                      useChatStore.getState().regenerateResponse();
                                    }
                                  }}
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
  );
}
