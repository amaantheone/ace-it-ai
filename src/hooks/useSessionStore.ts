import { create } from "zustand";

export interface Message {
  id: string;
  message: string;
  role: "user" | "ai";
  avatar?: string;
  name?: string;
  isLoading?: boolean;
  className?: string;
}

export interface Session {
  id: string;
  topic: string | null;
  startedAt: Date;
}

interface SessionState {
  sessions: Session[];
  currentSessionId: string | null;
  messages: { [sessionId: string]: Message[] };
  input: string;
  isLoading: boolean;
}

interface SessionActions {
  setSessions: (sessions: Session[]) => void;
  setCurrentSessionId: (sessionId: string | null) => void;
  addMessage: (sessionId: string, message: Message) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  updateMessage: (
    sessionId: string,
    messageId: string,
    updates: Partial<Message>
  ) => void;
  setInput: (input: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: (sessionId: string) => void;
  regenerateResponse: () => Promise<void>;
}

export const useSessionStore = create<SessionState & SessionActions>(
  (set, get) => ({
    sessions: [],
    currentSessionId: null,
    messages: {},
    input: "",
    isLoading: false,

    setSessions: (sessions) => set({ sessions }),
    setCurrentSessionId: (sessionId) => set({ currentSessionId: sessionId }),

    addMessage: (sessionId, message) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: [...(state.messages[sessionId] || []), message],
        },
      })),

    setMessages: (sessionId, messages) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: messages,
        },
      })),

    updateMessage: (sessionId, messageId, updates) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: (state.messages[sessionId] || []).map((msg) =>
            msg.id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      })),

    setInput: (input) => set({ input }),
    setIsLoading: (isLoading) => set({ isLoading }),
    clearMessages: (sessionId) =>
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: [],
        },
      })),

    regenerateResponse: async () => {
      const state = get();
      const { currentSessionId } = state;
      if (!currentSessionId) return;

      const messages = state.messages[currentSessionId] || [];
      // Find the last user message
      const lastUserIndex = [...messages]
        .reverse()
        .findIndex((m) => m.role === "user");
      if (lastUserIndex === -1) return;
      const userMsgIdx = messages.length - 1 - lastUserIndex;
      const lastUserMessage = messages[userMsgIdx];
      if (!lastUserMessage?.message) return;

      // Remove all AI messages after the last user message
      const newMessages = messages.slice(0, userMsgIdx + 1);

      // Add new loading message
      const loadingMessage: Message = {
        id: crypto.randomUUID(),
        role: "ai",
        message: "",
        isLoading: true,
      };

      set((state) => ({
        messages: {
          ...state.messages,
          [currentSessionId]: [...newMessages, loadingMessage],
        },
      }));

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: currentSessionId,
            message: lastUserMessage.message,
          }),
        });

        if (!response.ok) throw new Error("Failed to regenerate response");

        const data = await response.json();

        // Replace the loading message with the actual response
        set((state) => ({
          messages: {
            ...state.messages,
            [currentSessionId]: (state.messages[currentSessionId] || []).map(
              (msg) =>
                msg.id === loadingMessage.id
                  ? {
                      ...msg,
                      message: data.message,
                      isLoading: false,
                      name: "AI Tutor",
                    }
                  : msg
            ),
          },
        }));
      } catch (error) {
        console.error("Error regenerating response:", error);
        // Remove the loading message on error
        set((state) => ({
          messages: {
            ...state.messages,
            [currentSessionId]: (state.messages[currentSessionId] || []).filter(
              (msg) => msg.id !== loadingMessage.id
            ),
          },
        }));
      }
    },
  })
);
