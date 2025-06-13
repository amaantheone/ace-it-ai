"use client"

import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  CreditCard, 
  FileQuestion, 
  Sun, 
  Moon, 
  LogIn,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Zap,
  Play
} from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const features = [
    {
      icon: BookOpen,
      title: "Flashcards",
      description: "Create and organize flashcards with custom tags, folders, and translations for effective studying",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Brain,
      title: "Mind Maps",
      description: "Visualize relationships between concepts with interactive mind maps that enhance understanding",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FileQuestion,
      title: "Adaptive Quizzes",
      description: "Test your knowledge with quizzes that track your progress and identify areas for improvement",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: CreditCard,
      title: "AI Chat Assistant",
      description: "Get help with your studies through our intelligent chat system that answers your questions",
      gradient: "from-emerald-500 to-teal-500",
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50'
    }`}>
      {/* Animated background pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-bounce-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-bounce-slow animation-delay-1000"></div>
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="px-6 py-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <Brain size={24} className="text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Ace It AI
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className={`font-medium transition-colors hover:text-purple-400 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Features
              </a>
              <a href="#how-it-works" className={`font-medium transition-colors hover:text-purple-400 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                How It Works
              </a>
              <a href="/pricing" className={`font-medium transition-colors hover:text-purple-400 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Pricing
              </a>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 hover:cursor-pointer ${
                  isDark 
                    ? 'bg-slate-800/50 text-yellow-400 hover:bg-slate-700/50' 
                    : 'bg-white/50 text-slate-600 hover:bg-white/70'
                } backdrop-blur-sm border border-white/10`}
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <a href="/auth/login" className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:cursor-pointer ${
                isDark 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
              } shadow-lg hover:shadow-xl`}>
                <LogIn size={16} />
                Get Started
              </a>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="px-6 py-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className={`text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent leading-tight`}>
                Learn Smarter with
                <br />
                AI-Powered Education
              </h1>
              <p className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Transform your learning experience with personalized AI tutoring, interactive mind maps, 
                smart flashcards, and adaptive quizzes - all in one powerful platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
                <a href="/dashboard" className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:cursor-pointer ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                } shadow-lg hover:shadow-xl`}>
                  <Zap size={20} />
                  Start Learning Free
                  <ArrowRight size={20} />
                </a>
                <a 
                  href="https://x.com/amaanth3one/status/1925263189765497181" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800/50 text-white hover:bg-slate-700/50 border border-slate-600' 
                      : 'bg-white/50 text-slate-800 hover:bg-white/70 border border-slate-300'
                  } backdrop-blur-sm`}
                >
                  <Play size={20} />
                  Watch Demo
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
                How It Works
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Get started with Ace It AI in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className={`p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${
                isDark 
                  ? 'bg-slate-800/30 hover:bg-slate-800/50' 
                  : 'bg-white/30 hover:bg-white/50'
                } backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl`}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                  Sign Up For Free
                </h3>
                <p className={`text-lg leading-relaxed text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Create your free account in seconds with just an email. No credit card required, all features are available immediately.
                </p>
              </div>
              
              <div className={`p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${
                isDark 
                  ? 'bg-slate-800/30 hover:bg-slate-800/50' 
                  : 'bg-white/30 hover:bg-white/50'
                } backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl`}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                  Choose Your Learning Tools
                </h3>
                <p className={`text-lg leading-relaxed text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Access our suite of AI-powered learning tools: Create flashcards with custom tags and folders, build interactive mind maps, generate adaptive quizzes, or ask questions via AI chat.
                </p>
              </div>
              
              <div className={`p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${
                isDark 
                  ? 'bg-slate-800/30 hover:bg-slate-800/50' 
                  : 'bg-white/30 hover:bg-white/50'
                } backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl`}>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <h3 className={`text-2xl font-bold mb-4 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                  Learn and Track Progress
                </h3>
                <p className={`text-lg leading-relaxed text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Study effectively with personalized AI feedback, review your quiz attempts, organize flashcards by folders and tags, and visualize concepts through interactive mind maps to strengthen retention.
                </p>
              </div>
            </div>

            <div className={`p-8 rounded-2xl ${
              isDark 
                ? 'bg-slate-800/30' 
                : 'bg-white/30'
              } backdrop-blur-md border border-white/10`}>
              <h3 className={`text-2xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
                The Ace It AI Advantage
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                  <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    AI analyzes your performance to provide personalized learning recommendations and adapt to your needs
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                  <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Multiple learning formats engage different parts of your brain for better comprehension and retention
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                  <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Seamless organization with folders, tags, and search makes finding and reviewing materials effortless
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                  <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Complete access to all features for free, with no hidden costs, subscriptions, or trial periods
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Everything You Need to Excel
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Our comprehensive AI-powered learning platform provides all the tools you need to master any subject
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className={`group p-8 rounded-2xl transition-all duration-500 hover:scale-105 ${
                      isDark 
                        ? 'bg-slate-800/30 hover:bg-slate-800/50' 
                        : 'bg-white/30 hover:bg-white/50'
                    } backdrop-blur-md border border-white/10 hover:border-white/20 shadow-lg hover:shadow-2xl animate-fade-in-up`}
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon size={32} className="text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {feature.title}
                    </h3>
                    <p className={`text-lg leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Benefits */}
            <div className={`p-8 rounded-2xl ${
              isDark 
                ? 'bg-slate-800/30' 
                : 'bg-white/30'
            } backdrop-blur-md border border-white/10`}>
              <h3 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Why Choose Ace It AI?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <CheckCircle size={24} className="text-emerald-400 flex-shrink-0 mt-1" />
                    <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* About Ace It AI Section */}
            <div className={`p-8 rounded-2xl ${
              isDark 
                ? 'bg-slate-800/30' 
                : 'bg-white/30'
            } backdrop-blur-md border border-white/10 mb-8`}>
              <h3 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-800'}`}>
                About Ace It AI
              </h3>
              <p className={`text-lg mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Ace It AI is your personal AI-powered learning companion. Our platform combines cutting-edge artificial intelligence with proven learning methodologies to create a personalized and engaging educational experience. Whether you&apos;re studying for exams, learning new concepts, or expanding your knowledge, Ace It AI provides the tools you need to succeed.
              </p>
              <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                With features like interactive chat sessions, visual mind maps, customizable flashcards, and adaptive quizzes, we offer a comprehensive suite of learning tools designed to enhance understanding and retention. Our AI adapts to your learning style and pace, ensuring an optimized educational journey tailored specifically to you.
              </p>
            </div>
            
            <div className={`p-12 rounded-3xl ${
              isDark 
                ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' 
                : 'bg-gradient-to-r from-purple-100/50 to-pink-100/50'
            } backdrop-blur-md border border-white/10 mb-20`}>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Ready to Transform Your Learning?
              </h2>
              <p className={`text-xl mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Be among the first to experience this revolutionary approach to learning with Ace It AI
              </p>
              <div className="flex justify-center">
                <a href="/dashboard" className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:cursor-pointer ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                } shadow-lg hover:shadow-xl`}>
                  <Sparkles size={20} />
                  Get Started Free
                  <ArrowRight size={20} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
                <Brain size={24} className="text-white" />
              </div>
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                Ace It AI
              </span>
            </div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} mb-6`}>
              Empowering learners worldwide with AI-driven education technology
            </p>
            <div className="flex justify-center gap-8 text-sm">
              <a 
                href="https://www.termsfeed.com/live/a5fe202d-3d6d-430d-a64a-5c7dd09ca1c2" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors hover:text-purple-400 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Privacy Policy
              </a>
              <a 
                href="/terms" 
                target="_blank" 
                rel="noopener noreferrer" 
                className={`transition-colors hover:text-purple-400 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;