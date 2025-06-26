"use client";

import React from 'react';
import { 
  MessageCircle, 
  Lightbulb, 
  Brain, 
  CreditCard
} from 'lucide-react';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FeatureCard from '@/components/ui/FeatureCard';

function App() {
  const { data: session } = useSession();
  const router = useRouter();

  const features = [
    {
      icon: MessageCircle,
      title: "Start Learning",
      description: "Begin an interactive learning session",
      gradientFrom: "from-indigo-600",
      gradientTo: "to-blue-700",
      textColor: "text-indigo-100",
      className: "md:col-span-2 lg:col-span-1",
      isPrimary: true,
      position: "center",
      onClick: () => router.push('/chat')
    },
    {
      icon: Lightbulb,
      title: "Mind Map Generator",
      description: "Visualize concepts with AI-powered mind mapping",
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-600",
      textColor: "text-purple-100",
      className: "md:col-span-1 lg:col-span-1",
      isPrimary: false,
      position: "top-left",
      onClick: () => router.push('/mindmap')
    },
    {
      icon: Brain,
      title: "Quiz Generator",
      description: "Test your knowledge with intelligent quizzes",
      gradientFrom: "from-cyan-600",
      gradientTo: "to-blue-600",
      textColor: "text-cyan-100",
      className: "md:col-span-1 lg:col-span-1",
      isPrimary: false,
      position: "top-right",
      onClick: () => router.push('/quiz')
    },
    {
      icon: CreditCard,
      title: "Flash Card Generator",
      description: "Create and review personalized flashcards",
      gradientFrom: "from-orange-500",
      gradientTo: "to-red-600",
      textColor: "text-orange-100",
      className: "md:col-span-1 lg:col-span-1",
      isPrimary: false,
      position: "bottom",
      onClick: () => router.push('/flashcard')
    }
  ];

  // Organize features by position for the centered layout
  const centerFeature = features.find(f => f.position === "center");
  const topFeatures = features.filter(f => f.position?.startsWith("top"));
  const bottomFeatures = features.filter(f => f.position === "bottom");
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 font-inter">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative z-10 px-4 sm:px-6 py-12 sm:py-16 pt-24 sm:pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 leading-tight">
              {`Welcome, ${session?.user?.name?.split(' ')[0] || "Anon"}`}
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Ready to Ace your Exams? Get started by generating quizzes, flashcards, or mind maps!
            </p>
          </div>

          {/* Centered Layout */}
          <div className="max-w-4xl mx-auto">
            {/* Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {topFeatures.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradientFrom={feature.gradientFrom}
                  gradientTo={feature.gradientTo}
                  textColor={feature.textColor}
                  isPrimary={feature.isPrimary}
                  onClick={feature.onClick}
                />
              ))}
            </div>

            {/* Center Feature */}
            {centerFeature && (
              <div className="mb-6">
                <FeatureCard
                  key={centerFeature.title}
                  icon={centerFeature.icon}
                  title={centerFeature.title}
                  description={centerFeature.description}
                  gradientFrom={centerFeature.gradientFrom}
                  gradientTo={centerFeature.gradientTo}
                  textColor={centerFeature.textColor}
                  isPrimary={centerFeature.isPrimary}
                  onClick={centerFeature.onClick}
                />
              </div>
            )}

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {bottomFeatures.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  gradientFrom={feature.gradientFrom}
                  gradientTo={feature.gradientTo}
                  textColor={feature.textColor}
                  isPrimary={feature.isPrimary}
                  onClick={feature.onClick}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;