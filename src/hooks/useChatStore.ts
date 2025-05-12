import {
  ChatBotMessages,
  Message,
  UserData,
  userData,
  Users,
} from "@/app/data";
import { create } from "zustand";

export interface Example {
  name: string;
  url: string;
}

interface State {
  selectedExample: Example;
  examples: Example[];
  input: string;
  chatBotMessages: Message[];
  messages: Message[];
  hasInitialAIResponse: boolean;
  hasInitialResponse: boolean;
}

interface Actions {
  selectedUser: UserData;
  setSelectedExample: (example: Example) => void;
  setExamples: (examples: Example[]) => void;
  setInput: (input: string) => void;
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void;
  setchatBotMessages: (fn: (chatBotMessages: Message[]) => Message[]) => void;
  setMessages: (fn: (messages: Message[]) => Message[]) => void;
  setHasInitialAIResponse: (hasInitialAIResponse: boolean) => void;
  setHasInitialResponse: (hasInitialResponse: boolean) => void;
  regenerateResponse: () => void;
  copyMessageToClipboard: (message: string) => void;
}

const useChatStore = create<State & Actions>()((set, get) => ({
  selectedUser: Users[4],

  selectedExample: { name: "Messenger example", url: "/" },

  examples: [
    { name: "Messenger example", url: "/" },
    { name: "Chatbot example", url: "/chatbot" },
    { name: "Chatbot2 example", url: "/chatbot2" },
  ],

  input: "",

  setSelectedExample: (selectedExample) => set({ selectedExample }),

  setExamples: (examples) => set({ examples }),

  setInput: (input) => set({ input }),
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => set({ input: e.target.value }),

  chatBotMessages: ChatBotMessages,
  setchatBotMessages: (fn) =>
    set(({ chatBotMessages }) => ({ chatBotMessages: fn(chatBotMessages) })),

  messages: userData[0].messages,
  setMessages: (fn) => set(({ messages }) => ({ messages: fn(messages) })),

  hasInitialAIResponse: false,
  setHasInitialAIResponse: (hasInitialAIResponse) =>
    set({ hasInitialAIResponse }),

  hasInitialResponse: false,
  setHasInitialResponse: (hasInitialResponse) => set({ hasInitialResponse }),

  copyMessageToClipboard: (message: string) => {
    navigator.clipboard.writeText(message);
  },

  regenerateResponse: async () => {
    const state = get();
    const messages = state.chatBotMessages;

    // Find the last user message
    let lastUserMessage = "";
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        lastUserMessage = messages[i].message || "";
        break;
      }
    }

    if (!lastUserMessage) return;

    // Remove the last AI response
    const newMessages = [...messages];
    if (newMessages[newMessages.length - 1].role === "ai") {
      newMessages.pop();
    }

    // Add new AI message with loading state
    set((state) => ({
      ...state,
      chatBotMessages: [
        ...newMessages,
        {
          id: newMessages.length + 1,
          avatar: "",
          name: "AI Tutor",
          role: "ai",
          message: "",
          isLoading: true,
        },
      ],
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: lastUserMessage }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      let accumulatedMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        try {
          const data = JSON.parse(chunk);
          const messageChunk = data.message || "";
          accumulatedMessage += messageChunk;

          set((state) => {
            const newMessages = [...state.chatBotMessages];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage.role === "ai") {
              lastMessage.message = accumulatedMessage;
              lastMessage.isLoading = false;
            }
            return { ...state, chatBotMessages: newMessages };
          });
        } catch (e) {
          console.warn("Error parsing chunk:", e);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      set((state) => {
        const newMessages = [...state.chatBotMessages];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "ai") {
          lastMessage.message = "Sorry, there was an error. Please try again.";
          lastMessage.isLoading = false;
        }
        return { ...state, chatBotMessages: newMessages };
      });
    }
  },
}));

export default useChatStore;
