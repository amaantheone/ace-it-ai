import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Chat Assistant - Ace It AI",
  description: "Get help with your studies through Ace It AI's intelligent chat assistant. Ask questions and receive personalized learning guidance powered by AI.",
  keywords: "AI chat assistant, study help, AI tutor, Ace It AI, learning assistant, AI-powered support",
  openGraph: {
    title: "AI Chat Assistant - Ace It AI",
    description: "Get help with your studies through AI-powered chat assistant. Ask questions and receive personalized guidance.",
    url: "https://ace-it-ai-wine.vercel.app/chat",
  },
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
