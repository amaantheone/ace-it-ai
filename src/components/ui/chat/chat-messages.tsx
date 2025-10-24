'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessageList } from "./chat-message-list";
import {
  ChatBubble,
  ChatBubbleMessage,
  ChatBubbleAction
} from "./chat-bubble";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RefreshCcw, CopyIcon, Edit2 } from "lucide-react";
import { MarkdownWithMath } from "../markdown-with-math";
import { useSessionStore } from '@/hooks/useSessionStore';
import { useTheme } from "@/contexts/ThemeContext";

interface Message {
  id: string | number;
  avatar?: string;
  name?: string;
  role: 'user' | 'ai';
  message?: string;
  isLoading?: boolean;
  className?: string;
}

interface ChatMessagesProps {
  messages: Message[];
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  bottomRef?: React.RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  isGuestMode?: boolean;
  onGuestMessageEdit?: (messageIndex: number, newContent: string) => void;
  onGuestRegenerate?: () => void;
}

export function ChatMessages({ messages, messagesContainerRef, bottomRef, isLoading = false, isGuestMode = false, onGuestMessageEdit, onGuestRegenerate }: ChatMessagesProps) {
  const getMessageVariant = (role?: string) => role === "ai" ? "received" : "sent";
  const [editingMessageIndex, setEditingMessageIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [messageDimensions, setMessageDimensions] = useState<{width: number, height: number} | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Find the index of the last AI message
  const lastAiIndex = [...messages].reverse().findIndex(m => m.role === "ai");
  const lastAiMessageIndex = lastAiIndex === -1 ? -1 : messages.length - 1 - lastAiIndex;

  // Find the index of the last user message
  const lastUserIndex = [...messages].reverse().findIndex(m => m.role === "user");
  const lastUserMessageIndex = lastUserIndex === -1 ? -1 : messages.length - 1 - lastUserIndex;

  // Auto-resize textarea and focus when editing starts
  useEffect(() => {
    if (editingMessageIndex !== null && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.focus();
      
      // Position cursor at the end of the text
      const textLength = textarea.value.length;
      textarea.setSelectionRange(textLength, textLength);
      
      // Auto-resize function
      const autoResize = () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      };
      
      autoResize();
      textarea.addEventListener('input', autoResize);
      
      return () => {
        textarea.removeEventListener('input', autoResize);
      };
    }
  }, [editingMessageIndex]);

  const handleEditStart = (index: number, currentMessage: string) => {
    // Step 1: Get the width and height of the message in view mode
    if (messageRef.current) {
      const rect = messageRef.current.getBoundingClientRect();
      
      // Check if the message is too small (1-2 words)
      const wordCount = currentMessage.trim().split(/\s+/).length;
      const isSmallMessage = wordCount <= 2 || rect.width < 120; // Less than 120px width or 2 words
      
      setMessageDimensions({
        width: isSmallMessage ? Math.max(rect.width * 2.5, 250) : rect.width, // 2.5x wider or minimum 250px
        height: rect.height
      });
    }
    
    setEditingMessageIndex(index);
    setEditingText(currentMessage);
  };

  const handleEditCancel = () => {
    setEditingMessageIndex(null);
    setEditingText("");
  };

  const handleEditSave = async () => {
    if (editingMessageIndex === null) return;
    
    const messageToEdit = messages[editingMessageIndex];
    if (!messageToEdit || !messageToEdit.id) return;

    try {
      // Get session data from useSessionStore
      const sessionStore = useSessionStore.getState();
      const currentSessionId = sessionStore.currentSessionId;
      
      if (!currentSessionId && !isGuestMode) {
        console.error('No current session ID');
        return;
      }

      // For guest users, handle edit locally without API call
      if (isGuestMode) {
        // For guest mode, call the callback to handle the edit in the parent component
        if (onGuestMessageEdit) {
          onGuestMessageEdit(editingMessageIndex, editingText);
        }
        
        // Exit edit mode
        setEditingMessageIndex(null);
        setEditingText("");
        return;
      }

      // For authenticated users, make API call
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: editingText,
          sessionId: currentSessionId,
          isEdit: true,
          editMessageId: messageToEdit.id,
          isGuestMode: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.edited && data.messages) {
          // This was an edit + regenerate, replace all session messages with the updated ones
          sessionStore.setMessages(currentSessionId!, data.messages);
        } else if (data.edited && data.message) {
          // This was an edit + regenerate (fallback if messages array not provided)
          // Update the user message content
          sessionStore.updateMessage(currentSessionId!, String(messageToEdit.id), {
            message: editingText
          });
          
          // Add the new AI response
          const newAiMessage = {
            id: crypto.randomUUID(),
            role: "ai" as const,
            message: data.message,
            isLoading: false,
          };
          sessionStore.addMessage(currentSessionId!, newAiMessage);
        } else {
          // Just an edit, update the user message
          sessionStore.updateMessage(currentSessionId!, String(messageToEdit.id), {
            message: editingText
          });
        }
      }

      // Exit edit mode
      setEditingMessageIndex(null);
      setEditingText("");
    } catch (error) {
      console.error('Error saving edited message:', error);
      // Still exit edit mode on error
      setEditingMessageIndex(null);
      setEditingText("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleEditSave();
    }
    if (e.key === 'Escape') {
      handleEditCancel();
    }
  };

  // When loading, always show skeleton regardless of message count
  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto px-2 md:px-4 overflow-hidden">
        <SkeletonTheme 
          baseColor={isDarkMode ? '#202020' : '#ebebeb'} 
          highlightColor={isDarkMode ? '#444' : '#f5f5f5'}
        >
          <div className="py-4 space-y-6">
            {Array(3).fill(0).map((_, index) => (
              <div key={index} className={`${index % 2 === 0 ? 'ml-auto w-4/5 max-w-sm' : 'mr-auto w-4/5 max-w-full'} min-w-0`}>
                <div className="mb-1">
                  <Skeleton width={80} height={16} />
                </div>
                {index % 2 === 0 ? (
                  // User-like message skeleton
                  <Skeleton height={40} />
                ) : (
                  // AI-like message skeleton (multiple lines)
                  <div className="space-y-2">
                    <Skeleton height={20} width="100%" />
                    <Skeleton height={20} width="100%" />
                    <Skeleton height={20} width="85%" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </SkeletonTheme>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-2 md:px-4">
      <ChatMessageList ref={messagesContainerRef}>
      <style jsx>{`
        .chat-streaming-content .inline-markdown p,
        .chat-streaming-content .inline-markdown h1,
        .chat-streaming-content .inline-markdown h2,
        .chat-streaming-content .inline-markdown h3,
        .chat-streaming-content .inline-markdown h4,
        .chat-streaming-content .inline-markdown h5,
        .chat-streaming-content .inline-markdown h6,
        .chat-streaming-content .inline-markdown ul,
        .chat-streaming-content .inline-markdown ol,
        .chat-streaming-content .inline-markdown li,
        .chat-streaming-content .inline-markdown blockquote {
          display: inline;
          margin: 0;
          padding: 0;
        }
        .chat-streaming-content .inline-markdown pre,
        .chat-streaming-content .inline-markdown code {
          display: inline;
          margin: 0;
          white-space: pre-wrap;
        }
        .chat-streaming-content .inline-markdown br {
          display: inline;
        }
      `}</style>
        <AnimatePresence>
          {messages.map((message, index) => {
            const variant = getMessageVariant(message.role);
            return (
              <motion.div
                key={String(message.id ?? index)}
                data-message-id={message.id}
                initial={{ opacity: 0, scale: 1, y: 12, x: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 1, y: 0, x: 0 }}
                transition={{
                  opacity: { duration: 0.08 },
                  y: { type: "spring", bounce: 0.15, duration: 0.35 },
                }}
                style={{ originX: 0.5, originY: 0.5 }}
                className="flex flex-col gap-2 p-2 md:p-4 w-full min-w-0"
              >
                {message.role === "ai" ? (
                  // AI Response without bubble
                  <div className="w-full min-w-0 overflow-hidden">
                    <div className="space-y-2">
                      <div className="flex md:hidden items-center gap-2 mb-1 text-xs text-muted-foreground">
                        Ace
                      </div>
                      {message.isLoading ? (
                        <SkeletonTheme 
                          baseColor={isDarkMode ? '#202020' : '#ebebeb'} 
                          highlightColor={isDarkMode ? '#444' : '#f5f5f5'}
                        >
                          <div className="w-full space-y-2">
                            <Skeleton height={20} width="100%" />
                            <Skeleton height={20} width="100%" />
                            <Skeleton height={20} width="85%" />
                          </div>
                        </SkeletonTheme>
                      ) : (
                        <div className="prose dark:prose-invert max-w-none text-foreground break-words overflow-wrap-anywhere min-h-[1.5rem]">
                          <span className="chat-streaming-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', display: 'inline-block', width: '100%' }}>
                            <span style={{ display: 'inline' }}>
                              <MarkdownWithMath className="inline-markdown">
                                {message.message || ''}
                              </MarkdownWithMath>
                            </span>
                          </span>
                        </div>
                      )}
                      <div className="flex items-center mt-1.5 gap-1">
                        {!message.isLoading && (
                          <>
                            <ChatBubbleAction
                              key="save-note"
                              variant="outline"
                              className="size-6 bg-background border-border hover:bg-foreground transition-colors group cursor-pointer"
                              icon={<CopyIcon className="size-3 text-foreground group-hover:text-background transition-colors" />}
                              onClick={() => {
                                navigator.clipboard.writeText(message.message || "");
                              }}
                            />
                            {index === lastAiMessageIndex && (
                              <ChatBubbleAction
                                key="explain-again"
                                variant="outline"
                                className="size-6 bg-background border-border hover:bg-foreground transition-colors group cursor-pointer"
                                icon={<RefreshCcw className="size-3 text-foreground group-hover:text-background transition-colors" />}
                                onClick={() => {
                                  if (isGuestMode && onGuestRegenerate) {
                                    onGuestRegenerate();
                                  } else {
                                    useSessionStore.getState().regenerateResponse();
                                  }
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  // User message with bubble  
                  <div className="relative group w-full flex justify-end min-w-0">
                    <ChatBubble variant={variant} className={editingMessageIndex === index ? "max-w-full md:max-w-[95%] min-w-0" : "max-w-full md:max-w-[85%] min-w-0"}>
                      <Avatar className="hidden md:flex">
                        <AvatarImage
                          src={message.avatar}
                          alt="Avatar"
                        />
                        <AvatarFallback className="bg-muted text-foreground">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <ChatBubbleMessage 
                        isLoading={message.isLoading}
                        className={`bg-primary/10 border border-border text-foreground break-words overflow-wrap-anywhere ${editingMessageIndex === index ? "w-full min-w-0" : "w-full md:w-auto min-w-0"}`}
                      >
                        <div className="flex md:hidden items-center gap-2 mb-1 text-xs text-muted-foreground">
                          You
                        </div>
                        {editingMessageIndex === index ? (
                          // Edit mode - show textarea with same dimensions as view mode
                          <Textarea
                            ref={textareaRef}
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleEditCancel}
                            className="resize-none bg-transparent border-none text-foreground focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
                            style={{
                              width: messageDimensions?.width ? `${messageDimensions.width}px` : 'auto',
                              height: messageDimensions?.height ? `${messageDimensions.height}px` : 'auto',
                              minHeight: messageDimensions?.height ? `${messageDimensions.height}px` : '90px',
                              minWidth: '200px' // Ensure minimum width for comfortable editing
                            }}
                            placeholder="Edit your message..."
                          />
                        ) : (
                          // View mode - show message
                          <div ref={messageRef} className="prose dark:prose-invert max-w-none break-words overflow-wrap-anywhere">
                            {message.message}
                          </div>
                        )}
                      </ChatBubbleMessage>
                    </ChatBubble>
                    {/* Hover icons for user messages */}
                    <div className="absolute top-full mt-1 right-2 md:right-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 flex gap-1 z-10">
                      {index === lastUserMessageIndex && (
                        <ChatBubbleAction
                          variant="outline"
                          className="size-6 bg-background border-border hover:bg-foreground transition-colors shadow-sm group/btn"
                          icon={<Edit2 className="size-3 text-foreground group-hover/btn:text-background transition-colors" />}
                          onClick={() => {
                            handleEditStart(index, message.message || "");
                          }}
                        />
                      )}
                      <ChatBubbleAction
                        variant="outline"
                        className="size-6 bg-background border-border hover:bg-foreground transition-colors shadow-sm group/btn"
                        icon={<CopyIcon className="size-3 text-foreground group-hover/btn:text-background transition-colors" />}
                        onClick={() => {
                          navigator.clipboard.writeText(message.message || "");
                        }}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {/* Invisible element to mark the bottom for scroll-to-bottom functionality */}
        <div ref={bottomRef} />
      </ChatMessageList>
    </div>
  );
}
