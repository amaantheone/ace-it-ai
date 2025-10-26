import { Message, Session } from "@/hooks/useSessionStore";
import {
  createStreamingChatRequest,
  handleStreamingResponse,
  generateMessageId,
} from "./streamingUtils";

// Helper function to generate a simple title for guest sessions
const generateGuestSessionTitle = (message: string): string => {
  // Clean the message and take first few words
  const cleanMessage = message.trim().replace(/[^\w\s]/g, "");
  const words = cleanMessage.split(/\s+/).slice(0, 4); // Take first 4 words

  if (words.length === 0) {
    return "New Chat";
  }

  // Capitalize first letter of each word and join
  const title = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  // Limit length and add ellipsis if needed
  return title.length > 30 ? title.substring(0, 27) + "..." : title;
};

export const handleSendMessage = async (
  e: React.FormEvent<HTMLFormElement>,
  {
    input,
    currentSessionId,
    username,
    avatar,
    messages,
    setInput,
    setMessages,
    setSessions,
    sessions,
    formRef,
    selectedFile,
    setSelectedFile,
    isGuestMode,
    guestMessageCount,
    incrementGuestMessageCount,
    setShowChatLoginPopup,
    guestMessageLimit,
    setLoginPopupVariant,
    isLoading,
    setIsLoading,
  }: {
    input: string;
    currentSessionId: string;
    username: string;
    avatar: string | null | undefined;
    messages: Record<string, Message[]>;
    setInput: (input: string) => void;
    setMessages: (sessionId: string, messages: Message[]) => void;
    setSessions: (sessions: Session[]) => void;
    sessions: Session[];
    formRef: React.RefObject<HTMLFormElement>;
    selectedFile?: File | null;
    setSelectedFile?: (file: File | null) => void;
    isGuestMode?: boolean;
    guestMessageCount?: number;
    incrementGuestMessageCount?: () => number;
    setShowChatLoginPopup?: (open: boolean) => void;
    guestMessageLimit?: number;
    setLoginPopupVariant?: (variant: "limit" | "newSession") => void;
    isLoading?: boolean;
    setIsLoading?: (loading: boolean) => void;
  }
) => {
  e.preventDefault();

  // Prevent multiple simultaneous requests
  if (isLoading) {
    console.log("Request already in progress, ignoring duplicate");
    return;
  }

  if (!input.trim() || !currentSessionId) return;

  // Set loading state immediately to prevent duplicate requests
  if (setIsLoading) setIsLoading(true);

  // Guest gating
  if (isGuestMode && setShowChatLoginPopup && guestMessageCount !== undefined) {
    const allowed = enforceGuestMessageLimit({
      guestMessageCount,
      setShowChatLoginPopup,
      limit: guestMessageLimit,
      setLoginPopupVariant,
    });
    if (!allowed) {
      if (setIsLoading) setIsLoading(false);
      return;
    }

    // Only increment the count after we know the message will be sent
    if (incrementGuestMessageCount) {
      incrementGuestMessageCount();
    }
  }

  const messageId = crypto.randomUUID();
  const userMessage: Message = {
    id: messageId,
    message: input,
    role: "user",
    avatar: avatar || "",
    name: username,
  };

  const currentInput = input;
  setInput("");
  formRef.current?.reset();
  if (setSelectedFile) setSelectedFile(null);

  try {
    const currentMessages = messages[currentSessionId] || [];
    setMessages(currentSessionId, [...currentMessages, userMessage]);

    // Add loading state for AI response
    const aiMessageId = crypto.randomUUID();
    const aiLoadingMessage: Message = {
      id: aiMessageId,
      message: "",
      role: "ai",
      name: "AI Tutor",
      isLoading: true,
    };
    setMessages(currentSessionId, [
      ...currentMessages,
      userMessage,
      aiLoadingMessage,
    ]);

    let aiResponse;
    if (selectedFile) {
      // Send as multipart/form-data
      const formData = new FormData();
      formData.append("message", currentInput);
      formData.append("sessionId", currentSessionId);
      formData.append("file", selectedFile);

      // Add guest mode data if applicable
      if (isGuestMode) {
        formData.append("isGuestMode", "true");
        // Convert messages to format expected by API (only role and content)
        const guestMessages = currentMessages.map((msg) => ({
          role: msg.role,
          content: msg.message,
        }));
        formData.append("guestMessages", JSON.stringify(guestMessages));
      }

      aiResponse = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });
    } else {
      // Send as JSON
      const requestBody: {
        message: string;
        sessionId: string;
        isGuestMode?: boolean;
        guestMessages?: { role: string; content: string }[];
      } = {
        message: currentInput,
        sessionId: currentSessionId,
      };

      // Add guest mode data if applicable
      if (isGuestMode) {
        requestBody.isGuestMode = true;
        // Convert messages to format expected by API (only role and content)
        requestBody.guestMessages = currentMessages.map((msg) => ({
          role: msg.role,
          content: msg.message,
        }));
      }

      aiResponse = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
    }
    const data = await aiResponse.json();
    if (!aiResponse.ok) {
      throw new Error(data.error || "Failed to get AI response");
    }

    const aiMessage: Message = {
      id: aiMessageId,
      message: data.message,
      role: "ai",
      name: "AI Tutor",
      isLoading: false,
    };
    setMessages(currentSessionId, [...currentMessages, userMessage, aiMessage]);

    // Generate title for new sessions without a topic
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    if (currentSession && !currentSession.topic) {
      if (isGuestMode) {
        // For guest mode: generate a simple title based on the first message
        try {
          const title = generateGuestSessionTitle(currentInput);
          setSessions(
            sessions.map((s) =>
              s.id === currentSessionId ? { ...s, topic: title } : s
            )
          );
        } catch (titleError) {
          console.error("Failed to generate guest title:", titleError);
        }
      } else {
        // For authenticated users: use the API
        try {
          const response = await fetch("/api/session/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSessionId,
              message: currentInput,
            }),
          });
          if (response.ok) {
            const { title } = await response.json();
            setSessions(
              sessions.map((s) =>
                s.id === currentSessionId ? { ...s, topic: title } : s
              )
            );
          }
        } catch (titleError) {
          console.error("Failed to generate title:", titleError);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage: Message = {
      id: crypto.randomUUID(),
      message: "Sorry, there was an error. Please try again.",
      role: "ai",
      name: "AI Tutor",
    };
    const currentMessages = messages[currentSessionId] || [];
    setMessages(currentSessionId, [
      ...currentMessages.filter((msg) => !msg.isLoading),
      errorMessage,
    ]);
  } finally {
    // Always reset loading state
    if (setIsLoading) setIsLoading(false);
  }
};

export const handleSendMessageWithStreaming = async (
  e: React.FormEvent<HTMLFormElement>,
  {
    input,
    currentSessionId,
    username,
    avatar,
    messages,
    setInput,
    setMessages,
    setSessions,
    sessions,
    formRef,
    selectedFile,
    setSelectedFile,
    isGuestMode,
    guestMessageCount,
    incrementGuestMessageCount,
    setShowChatLoginPopup,
    guestMessageLimit,
    setLoginPopupVariant,
    isLoading,
    setIsLoading,
    // Additional props for streaming
    appendToStreamingMessage,
    startStreamingMessage,
    completeStreamingMessage,
    scrollToBottom,
    isAutoScrollEnabled,
  }: {
    input: string;
    currentSessionId: string;
    username: string;
    avatar: string | null | undefined;
    messages: Record<string, Message[]>;
    setInput: (input: string) => void;
    setMessages: (sessionId: string, messages: Message[]) => void;
    setSessions: (sessions: Session[]) => void;
    sessions: Session[];
    formRef: React.RefObject<HTMLFormElement>;
    selectedFile?: File | null;
    setSelectedFile?: (file: File | null) => void;
    isGuestMode?: boolean;
    guestMessageCount?: number;
    incrementGuestMessageCount?: () => number;
    setShowChatLoginPopup?: (open: boolean) => void;
    guestMessageLimit?: number;
    setLoginPopupVariant?: (variant: "limit" | "newSession") => void;
    isLoading?: boolean;
    setIsLoading?: (loading: boolean) => void;
    // Streaming methods
    appendToStreamingMessage?: (
      sessionId: string,
      messageId: string,
      content: string
    ) => void;
    startStreamingMessage?: (sessionId: string, messageId: string) => void;
    completeStreamingMessage?: (sessionId: string, messageId: string) => void;
    scrollToBottom?: (options?: { force?: boolean }) => void;
    isAutoScrollEnabled?: () => boolean;
  }
) => {
  e.preventDefault();

  // Prevent multiple simultaneous requests
  if (isLoading) {
    console.log("Request already in progress, ignoring duplicate");
    return;
  }

  if (!input.trim() || !currentSessionId) return;

  // Set loading state immediately to prevent duplicate requests
  if (setIsLoading) setIsLoading(true);

  // Guest gating
  if (isGuestMode && setShowChatLoginPopup && guestMessageCount !== undefined) {
    const allowed = enforceGuestMessageLimit({
      guestMessageCount,
      setShowChatLoginPopup,
      limit: guestMessageLimit,
      setLoginPopupVariant,
    });
    if (!allowed) {
      if (setIsLoading) setIsLoading(false);
      return;
    }

    // Only increment the count after we know the message will be sent
    if (incrementGuestMessageCount) {
      incrementGuestMessageCount();
    }
  }

  const userMessageId = generateMessageId();
  const userMessage: Message = {
    id: userMessageId,
    message: input,
    role: "user",
    avatar: avatar || "",
    name: username,
  };

  const currentInput = input;
  setInput("");
  formRef.current?.reset();
  if (setSelectedFile) setSelectedFile(null);

  try {
    const currentMessages = messages[currentSessionId] || [];
    setMessages(currentSessionId, [...currentMessages, userMessage]);
    if (scrollToBottom) {
      requestAnimationFrame(() => {
        scrollToBottom({ force: true });
      });
    }

    // Add streaming AI message
    const aiMessageId = generateMessageId();
    const aiStreamingMessage: Message = {
      id: aiMessageId,
      message: "",
      role: "ai",
      name: "AI Tutor",
      isLoading: true,
    };

    const messagesWithAI = [
      ...currentMessages,
      userMessage,
      aiStreamingMessage,
    ];
    setMessages(currentSessionId, messagesWithAI);

    if (scrollToBottom) {
      requestAnimationFrame(() => {
        scrollToBottom({ force: true });
      });
    }

    // Prepare streaming request payload
    const payload = {
      message: currentInput,
      sessionId: currentSessionId,
      userMessageId,
      isGuestMode: isGuestMode || false,
      guestMessages: isGuestMode
        ? currentMessages.map((msg) => ({
            role: msg.role,
            content: msg.message,
            id: msg.id,
          }))
        : undefined,
    };

    // Start streaming request
    const streamingResponse = await createStreamingChatRequest(
      "/api/chat/stream",
      payload,
      selectedFile
    );

    // Start streaming and update UI
    if (startStreamingMessage) {
      startStreamingMessage(currentSessionId, aiMessageId);
    }

    // Handle streaming response with respectful auto-scroll behavior
    let streamedContent = "";
    let hasScrolledToShowResponse = false;

    try {
      await handleStreamingResponse(streamingResponse, {
        onChunk: (content: string) => {
          streamedContent += content;

          if (appendToStreamingMessage) {
            appendToStreamingMessage(currentSessionId, aiMessageId, content);
          }

          if (!hasScrolledToShowResponse && (isAutoScrollEnabled?.() ?? true)) {
            if (streamedContent.includes("\n") || streamedContent.length > 40) {
              setTimeout(() => {
                scrollToBottom?.();
                hasScrolledToShowResponse = true;
              }, 100);
            }
          }
        },
        onComplete: () => {
          // Just mark streaming as complete, don't override the incrementally built content
          if (completeStreamingMessage) {
            completeStreamingMessage(currentSessionId, aiMessageId);
          }
          // Final scroll to bottom
          if (scrollToBottom) {
            setTimeout(() => scrollToBottom(), 100);
          }
        },
        onError: (error: string) => {
          console.error("Streaming error:", error);
          // Replace with error message
          const errorMessage: Message = {
            id: aiMessageId,
            message: "Sorry, there was an error. Please try again.",
            role: "ai",
            name: "AI Tutor",
            isLoading: false,
          };
          setMessages(currentSessionId, [
            ...currentMessages,
            userMessage,
            errorMessage,
          ]);
        },
      });
    } catch (error) {
      throw error;
    }

    // Generate title for new sessions without a topic
    const currentSession = sessions.find((s) => s.id === currentSessionId);
    if (currentSession && !currentSession.topic) {
      if (isGuestMode) {
        // For guest mode: generate a simple title based on the first message
        try {
          const title = generateGuestSessionTitle(currentInput);
          setSessions(
            sessions.map((s) =>
              s.id === currentSessionId ? { ...s, topic: title } : s
            )
          );
        } catch (titleError) {
          console.error("Failed to generate guest title:", titleError);
        }
      } else {
        // For authenticated users: use the API
        try {
          const response = await fetch("/api/session/title", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: currentSessionId,
              message: currentInput,
            }),
          });
          if (response.ok) {
            const { title } = await response.json();
            setSessions(
              sessions.map((s) =>
                s.id === currentSessionId ? { ...s, topic: title } : s
              )
            );
          }
        } catch (titleError) {
          console.error("Failed to generate title:", titleError);
        }
      }
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage: Message = {
      id: generateMessageId(),
      message: "Sorry, there was an error. Please try again.",
      role: "ai",
      name: "AI Tutor",
      isLoading: false,
    };
    const currentMessages = messages[currentSessionId] || [];
    setMessages(currentSessionId, [
      ...currentMessages.filter((msg) => !msg.isLoading),
      errorMessage,
    ]);
  } finally {
    // Always reset loading state
    if (setIsLoading) setIsLoading(false);
  }
};

export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void,
  isLoading?: boolean
) => {
  if (e.key === "Enter" && !e.shiftKey && !isLoading) {
    e.preventDefault(); // Prevent default to avoid multiple submissions
    handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
  }
};

export const enforceGuestMessageLimit = ({
  incrementGuestMessageCount,
  guestMessageCount,
  setShowChatLoginPopup,
  limit = 4,
  setLoginPopupVariant,
}: {
  incrementGuestMessageCount?: () => number;
  guestMessageCount?: number;
  setShowChatLoginPopup: (open: boolean) => void;
  limit?: number;
  setLoginPopupVariant?: (variant: "limit" | "newSession") => void;
}) => {
  // Use current count if provided, otherwise get it from the increment function
  const currentCount =
    guestMessageCount ??
    (incrementGuestMessageCount ? incrementGuestMessageCount() - 1 : 0);

  // Check if the user has already reached the limit
  if (currentCount >= limit) {
    if (setLoginPopupVariant) setLoginPopupVariant("limit");
    setShowChatLoginPopup(true);
    return false;
  }
  return true;
};

export const sendSuggestionMessage = async (
  text: string,
  {
    currentSessionId,
    isGuestMode,
    guestMessageCount,
    incrementGuestMessageCount,
    setShowChatLoginPopup,
    avatar,
    username,
    messages,
    setMessages,
    setInput,
    setIsLoading,
    formRef,
    sessions,
    setSessions,
    setLoginPopupVariant,
    // Add streaming props
    appendToStreamingMessage,
    startStreamingMessage,
    completeStreamingMessage,
    scrollToBottom,
    isAutoScrollEnabled,
  }: {
    currentSessionId: string | null;
    isGuestMode: boolean;
    guestMessageCount?: number;
    incrementGuestMessageCount: () => number;
    setShowChatLoginPopup: (open: boolean) => void;
    avatar: string | null | undefined;
    username: string;
    messages: Record<string, Message[]>;
    setMessages: (sessionId: string, messages: Message[]) => void;
    setInput: (val: string) => void;
    setIsLoading: (val: boolean) => void;
    formRef: React.RefObject<HTMLFormElement> | null;
    sessions: Session[];
    setSessions: (sessions: Session[]) => void;
    setLoginPopupVariant?: (variant: "limit" | "newSession") => void;
    // Streaming methods
    appendToStreamingMessage?: (
      sessionId: string,
      messageId: string,
      content: string
    ) => void;
    startStreamingMessage?: (sessionId: string, messageId: string) => void;
    completeStreamingMessage?: (sessionId: string, messageId: string) => void;
    scrollToBottom?: (options?: { force?: boolean }) => void;
    isAutoScrollEnabled?: () => boolean;
  }
) => {
  if (!currentSessionId) return;

  // Guest gate
  if (isGuestMode && guestMessageCount !== undefined) {
    const allowed = enforceGuestMessageLimit({
      guestMessageCount,
      setShowChatLoginPopup,
      setLoginPopupVariant,
    });
    if (!allowed) return;
  }

  // Optimistic user message
  const userMessage: Message = {
    id: crypto.randomUUID(),
    avatar: avatar || "",
    name: username,
    role: "user",
    message: text,
    className: "",
  };
  setMessages(currentSessionId, [
    ...(messages[currentSessionId] || []),
    userMessage,
  ]);
  setInput("");
  setIsLoading(true);

  // Use streaming send handler instead of regular one
  await handleSendMessageWithStreaming(
    {
      preventDefault: () => {},
      target: formRef?.current as HTMLFormElement,
    } as unknown as React.FormEvent<HTMLFormElement>,
    {
      input: text,
      currentSessionId,
      username,
      avatar,
      messages,
      setInput,
      setMessages,
      setSessions,
      sessions,
      formRef: (formRef || {
        current: null,
      }) as React.RefObject<HTMLFormElement>,
      isGuestMode,
      guestMessageCount,
      incrementGuestMessageCount,
      setIsLoading,
      setShowChatLoginPopup,
      guestMessageLimit: 4,
      setLoginPopupVariant,
      isLoading: false,
      // Add streaming props
      appendToStreamingMessage,
      startStreamingMessage,
      completeStreamingMessage,
      scrollToBottom,
      isAutoScrollEnabled,
    }
  );
  setIsLoading(false);
};
