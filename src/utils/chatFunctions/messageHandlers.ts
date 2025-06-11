import { Message, Session } from "@/hooks/useSessionStore";

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
  }
) => {
  e.preventDefault();
  if (!input || !currentSessionId) return;

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
      formData.append("pdf", selectedFile);

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
  }
};

export const handleKeyDown = (
  e: React.KeyboardEvent<HTMLTextAreaElement>,
  handleSendMessage: (e: React.FormEvent<HTMLFormElement>) => void
) => {
  if (e.key === "Enter" && !e.shiftKey) {
    handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
  }
};
