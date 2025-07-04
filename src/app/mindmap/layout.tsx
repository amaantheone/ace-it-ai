import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "AI Mind Map Generator - Ace It AI",
  description: "Visualize concepts with AI-powered mind maps on Ace It AI. Create interactive diagrams that enhance understanding and memory retention.",
  keywords: "AI mind map generator, concept mapping, visual learning, Ace It AI, interactive diagrams, AI-powered visualization",
  openGraph: {
    title: "AI Mind Map Generator - Ace It AI",
    description: "Visualize concepts with AI-powered mind maps. Create interactive diagrams that enhance understanding.",
    url: "https://ace-it-ai-wine.vercel.app/mindmap",
  },
};

export default function MindmapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
