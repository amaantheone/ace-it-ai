import { Message } from "@/hooks/useSessionStore";

// Define a Session type for strong typing
interface Session {
  id: string;
  topic?: string;
  [key: string]: unknown;
}

export const generateTitle = async (
  sessionId: string,
  message: string,
  sessions: Session[],
  setSessions: (sessions: Session[]) => void
) => {
  try {
    const response = await fetch("/api/session/title", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, message }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate title");
    }

    const { title } = await response.json();
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, topic: title } : s))
    );
  } catch (error) {
    console.error("Error generating title:", error);
  }
};

export const createNewSession = async ({
  sessions,
  setSessions,
  setCurrentSessionId,
}: {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (id: string) => void;
}) => {
  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    const newSession = await response.json();
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    return newSession.id;
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

export const handleNewChat = async ({
  sessions,
  setSessions,
  setCurrentSessionId,
  setMessages,
  isMobileView,
  setIsSidebarOpen,
}: {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (id: string) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  isMobileView: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}) => {
  try {
    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to create session");
    }

    const newSession = await response.json();
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
    setMessages(newSession.id, []);

    if (isMobileView) {
      setIsSidebarOpen(false);
    }
  } catch (error) {
    console.error("Error creating new chat:", error);
  }
};

export const getCurrentSessionMessages = (
  currentSessionId: string | null,
  messages: Record<string, Message[]>
) => {
  return currentSessionId ? messages[currentSessionId] || [] : [];
};
