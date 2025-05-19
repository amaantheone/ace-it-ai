import { Message } from "@/hooks/useSessionStore";

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
  }: {
    input: string;
    currentSessionId: string;
    username: string;
    avatar: string | null | undefined;
    messages: Record<string, Message[]>;
    setInput: (input: string) => void;
    setMessages: (sessionId: string, messages: Message[]) => void;
    setSessions: (sessions: { id: string; topic?: string }[]) => void;
    sessions: { id: string; topic?: string }[];
    formRef: React.RefObject<HTMLFormElement>;
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

    // Single API call to /api/chat for both saving and AI response
    const aiResponse = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: currentInput,
        sessionId: currentSessionId,
      }),
    });
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
