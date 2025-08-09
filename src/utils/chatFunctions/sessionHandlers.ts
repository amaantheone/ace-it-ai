import { Message, Session } from "@/hooks/useSessionStore";
import { GUEST_MESSAGES_KEY, GUEST_SESSIONS_KEY } from "./constants";

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
  isGuest,
  setShowChatLoginPopup,
  setLoginPopupVariant,
}: {
  sessions: Session[];
  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (id: string) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  isMobileView: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  isGuest: boolean;
  setShowChatLoginPopup: (open: boolean) => void;
  setLoginPopupVariant: (variant: "limit" | "newSession") => void;
}) => {
  // Guests are allowed only one session; prompt login instead of creating new sessions
  if (isGuest) {
    setLoginPopupVariant("newSession");
    setShowChatLoginPopup(true);
    if (isMobileView) setIsSidebarOpen(false);
    return;
  }
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

// Load initial sessions for guest or authenticated users
export const loadInitialSessions = async ({
  isGuest,
  loadGuestData,
  saveGuestData,
  currentSessionId,
  setSessions,
  setCurrentSessionId,
  setMessages,
  setIsLoading,
}: {
  isGuest: boolean;
  loadGuestData: (key: string) => unknown;
  saveGuestData: (key: string, value: unknown) => void;
  currentSessionId: string | null;
  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (id: string) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  setIsLoading: (val: boolean) => void;
}) => {
  if (isGuest) {
    const guestSessions =
      (loadGuestData(GUEST_SESSIONS_KEY) as Session[]) || [];
    setSessions(guestSessions);
    if (guestSessions.length === 0) {
      const newSession: Session = {
        id: crypto.randomUUID(),
        topic: "",
        startedAt: new Date(),
      };
      setSessions([newSession]);
      setCurrentSessionId(newSession.id);
      setMessages(newSession.id, []);
      saveGuestData(GUEST_SESSIONS_KEY, [newSession]);
      saveGuestData(GUEST_MESSAGES_KEY, { [newSession.id]: [] });
    } else if (!currentSessionId) {
      setCurrentSessionId(guestSessions[0].id);
    }
  } else {
    try {
      const response = await fetch("/api/session");
      if (!response.ok) throw new Error("Failed to load sessions");
      const data = await response.json();
      setSessions(data);
      if (data.length === 0) {
        const newSessionResponse = await fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (!newSessionResponse.ok) throw new Error("Failed to create session");
        const newSession = await newSessionResponse.json();
        setSessions([newSession]);
        setCurrentSessionId(newSession.id);
        setIsLoading(true);
        setMessages(newSession.id, []);
        setIsLoading(false);
      } else if (!currentSessionId) {
        setCurrentSessionId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  }
};

// Load messages when switching sessions
export const loadMessagesForSession = async ({
  currentSessionId,
  isGuest,
  loadGuestData,
  setMessages,
  setIsLoading,
}: {
  currentSessionId: string | null;
  isGuest: boolean;
  loadGuestData: (key: string) => unknown;
  setMessages: (sessionId: string, messages: Message[]) => void;
  setIsLoading: (val: boolean) => void;
}) => {
  if (!currentSessionId) return;
  setIsLoading(true);
  if (isGuest) {
    const guestMessages =
      (loadGuestData(GUEST_MESSAGES_KEY) as Record<string, Message[]>) || {};
    setMessages(currentSessionId, guestMessages[currentSessionId] || []);
    setIsLoading(false);
    return;
  }
  try {
    const response = await fetch(`/api/session/${currentSessionId}/messages`);
    if (!response.ok) throw new Error("Failed to load messages");
    const data = await response.json();
    setMessages(currentSessionId, data);
  } catch (error) {
    console.error("Error loading messages:", error);
  } finally {
    setIsLoading(false);
  }
};

// Persist guest state when sessions/messages change
export const persistGuestState = ({
  isGuest,
  sessions,
  messages,
  saveGuestData,
}: {
  isGuest: boolean;
  sessions: Session[];
  messages: Record<string, Message[]>;
  saveGuestData: (key: string, value: unknown) => void;
}) => {
  if (!isGuest) return;
  saveGuestData(GUEST_SESSIONS_KEY, sessions);
  saveGuestData(GUEST_MESSAGES_KEY, messages);
};
