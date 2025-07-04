import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Quiz Generator - Ace It AI",
  description: "Generate intelligent quizzes with AI on Ace It AI. Test your knowledge with adaptive questions that help you learn better and track your progress.",
  keywords: "AI quiz generator, intelligent quizzes, adaptive testing, Ace It AI, study quizzes, AI-powered assessment",
  openGraph: {
    title: "AI Quiz Generator - Ace It AI",
    description: "Generate intelligent quizzes with AI. Test your knowledge with adaptive questions.",
    url: "https://ace-it-ai-wine.vercel.app/quiz",
  },
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
