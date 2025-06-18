"use client"

import React from 'react';
import { 
  BookOpen, 
  Brain, 
  CreditCard, 
  FileQuestion, 
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Play
} from 'lucide-react';
import AppBar from '@/components/AppBar';

function App() {
  const features = [
    {
      icon: BookOpen,
      title: "Flashcards",
      description: "Create and organize flashcards with custom tags, folders, and translations for effective studying",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Mind Maps",
      description: "Visualize relationships between concepts with interactive mind maps that enhance understanding",
      gradient: "from-teal-500 to-emerald-500",
    },
    {
      icon: FileQuestion,
      title: "Adaptive Quizzes",
      description: "Test your knowledge with quizzes that track your progress and identify areas for improvement",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: CreditCard,
      title: "AI Chat Assistant",
      description: "Get help with your studies through our intelligent chat system that answers your questions",
      gradient: "from-cyan-500 to-teal-500",
    }
  ];

  const benefits = [
    "Smart Flashcards with tags for easy organization and retrieval",
    "Interactive Mind Maps for visualizing complex concepts and relationships",
    "Adaptive Quizzes that test your knowledge and track your progress",
    "AI-powered Chat assistant to help with your learning questions",
    "User Authentication for personalized learning experience",
    "Drag and drop interface for intuitive organization of study materials"
  ];

  return (
    <div className="min-h-screen transition-colors duration-500 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10"></div>
        <div className="absolute top-0 left-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <AppBar currentPage="home" />

        {/* Hero Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight">
                Learn Smarter with
                <br />
                AI-Powered Education
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed font-light text-slate-300 px-4">
                Transform your learning experience with personalized AI tutoring, interactive mind maps, 
                smart flashcards, and adaptive quizzes - all in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
                <a href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl">
                  <Zap size={18} className="sm:w-5 sm:h-5" />
                  Start Learning Free
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </a>
                <a 
                  href="https://x.com/amaanth3one/status/1925263189765497181" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl"
                >
                  <Play size={18} className="sm:w-5 sm:h-5" />
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                How It Works
              </h2>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto font-light text-slate-300 px-4">
                Get started with Ace It AI in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
              <div className="p-6 sm:p-8 lg:p-10 rounded-2xl transition-all duration-500 hover:scale-105 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Sign Up For Free
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-center font-light text-slate-300">
                  Create your free account in seconds with just an email. No credit card required, all features are available immediately.
                </p>
              </div>
              
              <div className="p-6 sm:p-8 lg:p-10 rounded-2xl transition-all duration-500 hover:scale-105 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Choose Your Learning Tools
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-center font-light text-slate-300">
                  Access our suite of AI-powered learning tools: Create flashcards with custom tags and folders, build interactive mind maps, generate adaptive quizzes, or ask questions via AI chat.
                </p>
              </div>
              
              <div className="p-6 sm:p-8 lg:p-10 rounded-2xl transition-all duration-500 hover:scale-105 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl">
                <div className="flex justify-center mb-6 sm:mb-8">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  Learn and Track Progress
                </h3>
                <p className="text-base sm:text-lg leading-relaxed text-center font-light text-slate-300">
                  Study effectively with personalized AI feedback, review your quiz attempts, organize flashcards by folders and tags, and visualize concepts through interactive mind maps to strengthen retention.
                </p>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                The Ace It AI Advantage
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg font-light text-slate-300">
                    AI analyzes your performance to provide personalized learning recommendations and adapt to your needs
                  </p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg font-light text-slate-300">
                    Multiple learning formats engage different parts of your brain for better comprehension and retention
                  </p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg font-light text-slate-300">
                    Seamless organization with folders, tags, and search makes finding and reviewing materials effortless
                  </p>
                </div>
                <div className="flex items-start gap-3 sm:gap-4">
                  <CheckCircle size={20} className="sm:w-6 sm:h-6 text-teal-500 flex-shrink-0 mt-1" />
                  <p className="text-base sm:text-lg font-light text-slate-300">
                    Complete access to all features for free, with no hidden costs, subscriptions, or trial periods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 tracking-tight text-white">
                Everything You Need to Excel
              </h2>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto font-light text-slate-300 px-4">
                Our comprehensive AI-powered learning platform provides all the tools you need to master any subject
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 sm:p-8 lg:p-10 rounded-2xl transition-all duration-500 hover:scale-105 bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl animate-fade-in-up"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon size={24} className="sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
                      {feature.title}
                    </h3>
                    <p className="text-base sm:text-lg leading-relaxed font-light text-slate-300">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Benefits */}
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl">
              <h3 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-10 text-center text-white">
                Why Choose Ace It AI?
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4">
                    <CheckCircle size={20} className="sm:w-6 sm:h-6 text-teal-500 flex-shrink-0 mt-1" />
                    <p className="text-base sm:text-lg font-light text-slate-300">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* About Ace It AI Section */}
            <div className="p-6 sm:p-8 lg:p-10 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center text-white">
                About Ace It AI
              </h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 font-light leading-relaxed text-slate-300">
                Ace It AI is your personal AI-powered learning companion. Our platform combines cutting-edge artificial intelligence with proven learning methodologies to create a personalized and engaging educational experience. Whether you&apos;re studying for exams, learning new concepts, or expanding your knowledge, Ace It AI provides the tools you need to succeed.
              </p>
              <p className="text-base sm:text-lg font-light leading-relaxed text-slate-300">
                With features like interactive chat sessions, visual mind maps, customizable flashcards, and adaptive quizzes, we offer a comprehensive suite of learning tools designed to enhance understanding and retention. Our AI adapts to your learning style and pace, ensuring an optimized educational journey tailored specifically to you.
              </p>
            </div>
            
            <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-gradient-to-r from-slate-800/70 to-slate-700/70 border border-slate-600/50 backdrop-blur-md shadow-xl mb-16 sm:mb-20 lg:mb-24">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 tracking-tight text-white">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-lg sm:text-xl mb-8 sm:mb-10 font-light text-slate-300 px-4">
                Be among the first to experience this revolutionary approach to learning with Ace It AI
              </p>
              <div className="flex justify-center">
                <a href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl">
                  <Sparkles size={18} className="sm:w-5 sm:h-5" />
                  Get Started Free
                  <ArrowRight size={18} className="sm:w-5 sm:h-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 py-8 sm:py-12 border-t border-slate-700/50">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="/Ace It AI.png" 
                  alt="Ace It AI Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Ace It AI
              </span>
            </div>
            <p className="text-slate-400 mb-6 sm:mb-8 font-light text-sm sm:text-base">
              Empowering learners worldwide with AI-driven education technology
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 text-sm">
              <a 
                href="https://www.termsfeed.com/live/a5fe202d-3d6d-430d-a64a-5c7dd09ca1c2" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="transition-colors hover:text-blue-500 font-medium text-slate-400"
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                className="transition-colors hover:text-blue-500 font-medium text-slate-400"
              >
                Terms of Service
              </a>
              <a 
                href="/docs" 
                className="transition-colors hover:text-blue-500 font-medium text-slate-400"
              >
                Documentation
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;