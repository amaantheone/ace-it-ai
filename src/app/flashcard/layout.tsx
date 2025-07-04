import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Flashcard Generator - Ace It AI",
  description: "Create personalized flashcards with AI on Ace It AI. Organize with custom tags and folders for effective studying and improved retention.",
  keywords: "AI flashcard generator, smart flashcards, digital flashcards, Ace It AI, study cards, AI-powered learning",
  openGraph: {
    title: "AI Flashcard Generator - Ace It AI",
    description: "Create personalized flashcards with AI. Organize with custom tags and folders for effective studying.",
    url: "https://ace-it-ai-wine.vercel.app/flashcard",
  },
};

export default function FlashcardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
