import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Ace It AI - AI-Powered Study Dashboard",
  description: "Welcome to Ace It AI! Access your personalized learning dashboard with AI quiz generator, flashcard maker, mind map creator, and interactive chat assistant.",
  keywords: "Ace It AI dashboard, AI study tools, personalized learning, quiz generator, flashcard maker, mind maps, AI chat",
  openGraph: {
    title: "Ace It AI - AI-Powered Study Dashboard",
    description: "Welcome to Ace It AI! Access your personalized learning dashboard with AI-powered study tools.",
    url: "https://ace-it-ai-wine.vercel.app/home",
  },
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
