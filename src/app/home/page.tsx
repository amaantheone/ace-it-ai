"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { StartLearningIcon, MindMapIcon, QuizIcon, FlashCardIcon } from '@/components/Icons';
import { useUser } from '@/contexts/UserContext';
import { usePrefetchAnalytics } from '@/hooks/usePrefetchAnalytics';

function App() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  
  // Prefetch analytics data in the background
  usePrefetchAnalytics();

  // Get first name from user
  const getDisplayName = () => {
    if (isLoading) return "...";
    return user?.name?.split(' ')[0] || "Anon";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ 
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Ace It AI",
            "description": "AI-powered learning platform for generating quizzes, flashcards, and mind maps",
            "url": "https://ace-it-ai-wine.vercel.app",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      
      <Header />
      
      <div className="pt-24 p-8 flex items-center justify-center min-h-screen">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-light text-slate-800 dark:text-slate-100 mb-6 tracking-tight">
              Welcome, {getDisplayName()}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-lg font-light">
              AI-powered tools to accelerate your learning journey
            </p>
          </div>

          {/* Start Learning - Primary Focus */}
          <div className="mb-12">
            <div 
              className="group bg-slate-800 dark:bg-slate-700 text-slate-50 dark:text-slate-100 rounded-lg p-12 cursor-pointer transform transition-all duration-300 hover:bg-opacity-90 border border-slate-800 dark:border-slate-600 hover:shadow-xl shadow-slate-800/10 dark:shadow-slate-900/30"
              onClick={() => router.push('/chat')}
            >
              <div className="flex items-center justify-center gap-6 mb-6">
                <StartLearningIcon />
                <div>
                  <h2 className="text-3xl font-light mb-2 text-slate-50 dark:text-slate-100">Start Learning</h2>
                  <p className="text-slate-50/80 dark:text-slate-100/80 text-lg font-light">
                    Begin an interactive learning session
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Tools */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Mind Map Generator */}
            <div 
              className="group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 cursor-pointer transform transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500 hover:shadow-lg hover:bg-white dark:hover:bg-slate-750 rounded-lg"
              onClick={() => router.push('/mindmap')}
            >
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-8 h-8 flex items-center justify-center text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                  <MindMapIcon />
                </div>
                <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3">Mind Map Generator</h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Visualize concepts with AI-powered mind mapping
                </p>
              </div>
            </div>

            {/* Quiz Generator */}
            <div 
              className="group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 cursor-pointer transform transition-all duration-300 hover:border-green-400 dark:hover:border-green-500 hover:shadow-lg hover:bg-white dark:hover:bg-slate-750 rounded-lg"
              onClick={() => router.push('/quiz')}
            >
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-8 h-8 flex items-center justify-center text-green-500 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-200">
                  <QuizIcon />
                </div>
                <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3">Quiz Generator</h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Test your knowledge with intelligent quizzes
                </p>
              </div>
            </div>

            {/* Flash Card Generator */}
            <div 
              className="group bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-8 cursor-pointer transform transition-all duration-300 hover:border-orange-400 dark:hover:border-orange-500 hover:shadow-lg hover:bg-white dark:hover:bg-slate-750 rounded-lg"
              onClick={() => router.push('/flashcard')}
            >
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 w-8 h-8 flex items-center justify-center text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                  <FlashCardIcon />
                </div>
                <h3 className="text-xl font-light text-slate-800 dark:text-slate-200 mb-3">Flash Card Generator</h3>
                <p className="text-slate-600 dark:text-slate-400 font-light text-sm leading-relaxed">
                  Create and review personalized flashcards
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-16">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-light">
              Choose your preferred learning method and let AI guide your progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;