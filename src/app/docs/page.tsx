"use client"

import React, { useState } from 'react';

import { 
  BookOpen, 
  ChevronRight,
  Zap,
  Users,
  Settings,
  HelpCircle,
} from 'lucide-react';
import AppBar from '@/components/AppBar';

const Documentation = () => {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeSubsection, setActiveSubsection] = useState('introduction');
  const [, setIsMobileMenuOpen] = useState(false);

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Zap,
      subsections: [
        { 
          id: 'introduction', 
          title: 'Introduction',
          content: `
            <h3 class="text-2xl font-semibold mb-4 text-teal-400">Welcome to Ace It AI!</h3>
            <p class="mb-4">Ace It AI is your personalized AI-powered learning companion, designed to help you master any subject with ease. Whether you're preparing for exams, learning a new skill, or just exploring new topics, Ace It AI provides a suite of tools to make your study sessions more effective and engaging.</p>
            <p class="mb-4">With features like AI-driven flashcards, interactive mind maps, adaptive quizzes, and an intelligent chat assistant, you can tailor your learning experience to your unique needs and learning style.</p>
            <p>This documentation will guide you through all the features and functionalities of Ace It AI, helping you make the most out of your learning journey. Let's get started!</p>
          `
        },
        { 
          id: 'quick-start', 
          title: 'Quick Start Guide',
          content: `
            <p class="text-lg mb-6">Get up and running with Ace It AI in just a few minutes. Follow these simple steps to start your learning journey.</p>
            
            <div class="space-y-6">
              <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <h3 class="text-xl font-semibold text-white">Create Your Account</h3>
                </div>
                <p class="mb-4">Sign up with your email address or Google account. All features are available immediately after login.</p>
                <Link href="/auth/login" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                  Sign Up / Login
                </Link>
              </div>
              
              <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <h3 class="text-xl font-semibold text-white">Explore the Dashboard</h3>
                </div>
                <p class="mb-4">Familiarize yourself with the main dashboard where you can access all learning tools and view your progress. The dashboard provides quick links to:</p>
                <ul class="space-y-2 text-slate-300 list-disc pl-5">
                  <li><strong>AI Chat Assistant:</strong> Engage in conversations with an AI tutor.</li>
                  <li><strong>Interactive Mindmaps:</strong> Generate visual mindmaps of any topic.</li>
                  <li><strong>Flashcard System:</strong> Create and study flashcards.</li>
                  <li><strong>Adaptive Quizzes:</strong> Test your knowledge with AI-generated quizzes.</li>
                </ul>
              </div>
              
              <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <h3 class="text-xl font-semibold text-white">Start Learning</h3>
                </div>
                <p class="mb-4">Begin with your preferred learning method. Try uploading a PDF to the AI Chat to get contextual answers, or generate flashcards from a topic you're studying.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div class="bg-slate-700/30 rounded-lg p-4">
                    <h4 class="font-semibold text-blue-400 mb-2">Visual Learners</h4>
                    <p class="text-sm text-slate-300">Start with mind maps and flashcards. Visualize connections and memorize key facts.</p>
                  </div>
                  <div class="bg-slate-700/30 rounded-lg p-4">
                    <h4 class="font-semibold text-teal-400 mb-2">Interactive Learners</h4>
                    <p class="text-sm text-slate-300">Begin with AI chat and quizzes. Engage directly with the material and test your understanding.</p>
                  </div>
                </div>
              </div>
            </div>
          `
        },
        { 
          id: 'account-setup', 
          title: 'Account Setup & Navigation',
          content: `
            <p class="text-lg mb-6">Setting up your Ace It AI account is straightforward, and navigating the platform is designed to be intuitive.</p>
            <h3 class="text-xl font-semibold mb-4 text-white">Creating Your Account</h3>
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
              <p class="mb-4">To get started with Ace It AI:</p>
              <ol class="list-decimal ml-6 space-y-2 text-slate-300">
                <li>Visit the <a href="/" class="text-blue-400 hover:underline">homepage</a>.</li>
                <li>Click on the "Get Started" or "Login" button, typically found in the top navigation bar.</li>
                <li>You can sign up or log in using your Google account for a quick and secure process. Alternatively, you can register with an email and password.</li>
                <li>Once logged in, you'll be directed to your main dashboard.</li>
              </ol>
            </div>
            
            <h3 class="text-xl font-semibold mb-4 text-white">Navigating the Platform</h3>
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
              <p class="mb-4">Ace It AI's interface is designed for ease of use:</p>
              <ul class="space-y-3 text-slate-300 list-disc pl-5">
                <li><strong>Dashboard:</strong> Your central hub. Access all main features (Chat, Mindmaps, Flashcards, Quizzes, Documentation) from here.</li>
                <li><strong>Top Navigation Bar:</strong> (On the landing page) Provides links to Features, How It Works, Documentation, and Pricing. The "Get Started" button takes you to the login/dashboard.</li>
                <li><strong>Feature Pages:</strong> Each core feature (Chat, Mindmaps, etc.) has its own dedicated page with a consistent layout. You'll typically find options to create new items, manage existing ones, and interact with the AI.</li>
                <li><strong>User Account Menu:</strong> Usually accessible via an icon in the top-right corner after logging in. This is where you can sign out.</li>
              </ul>
            </div>
            
            <div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6">
              <h4 class="text-lg font-semibold mb-3 text-amber-400">🔒 Account Security</h4>
              <p class="text-slate-300">If you sign up with Google, your account security is primarily managed by Google. Ensure your Google account itself is secure with a strong password and two-factor authentication if possible.</p>
            </div>
          `
        }
      ]
    },
    {
      id: 'features',
      title: 'Features',
      icon: BookOpen,
      subsections: [
        { id: 'flashcards', title: 'Flashcards' },
        { id: 'mind-maps', title: 'Mind Maps' },
        { id: 'quizzes', title: 'Adaptive Quizzes' },
        { id: 'ai-chat', title: 'AI Chat Assistant' }
      ]
    },
    {
      id: 'user-guide',
      title: 'User Guide',
      icon: Users,
      subsections: [
        { id: 'dashboard', title: 'Dashboard Overview' },
        { id: 'organizing-content', title: 'Organizing Content' },
        { id: 'study-sessions', title: 'Study Sessions' },
        { id: 'progress-tracking', title: 'Progress Tracking' }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Settings,
      subsections: [
        { id: 'ai-personalization', title: 'AI Personalization' },
        { id: 'custom-tags', title: 'Custom Tags & Folders' },
        { id: 'export-import', title: 'Export & Import' },
      ]
    },
    {
      id: 'support',
      title: 'Support',
      icon: HelpCircle,
      subsections: [
        { id: 'faq', title: 'FAQ' },
        { id: 'troubleshooting', title: 'Troubleshooting' }
      ]
    }
  ];

  const content = {
    'getting-started': {
      introduction: {
        title: 'Welcome to Ace It AI',
        content: `
          <p class="text-lg mb-6">Ace It AI is your comprehensive AI-powered learning platform designed to revolutionize how you study and retain information. Our platform combines cutting-edge artificial intelligence with proven learning methodologies to create a personalized educational experience.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">What Makes Ace It AI Special?</h3>
          <ul class="space-y-3 mb-6">
            <li class="flex items-start gap-3">
              <div class="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>AI-powered personalization that adapts to your learning style</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Multiple learning formats: flashcards, mind maps, quizzes, and chat</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Intelligent organization with tags, folders, and search</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
              <span>Progress tracking and performance analytics</span>
            </li>
          </ul>
          
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <h4 class="text-lg font-semibold mb-3 text-blue-400">💡 Pro Tip</h4>
            <p>Start with creating a few flashcards on a topic you're familiar with to get comfortable with the interface, then explore the AI chat feature to ask questions about your study material.</p>
          </div>
        `
      },
      'quick-start': {
        title: 'Quick Start Guide',
        content: `
          <p class="text-lg mb-6">Get up and running with Ace It AI in just a few minutes. Follow these simple steps to start your learning journey.</p>
          
          <div class="space-y-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                <h3 class="text-xl font-semibold text-white">Create Your Account</h3>
              </div>
              <p class="mb-4">Sign up with your email address - no credit card required. All features are available immediately.</p>
              <a href="/auth/signup" class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
                Sign Up Now <ExternalLink size={16} />
              </a>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h3 class="text-xl font-semibold text-white">Explore the Dashboard</h3>
              </div>
              <p class="mb-4">Familiarize yourself with the main dashboard where you can access all learning tools and view your progress. The dashboard provides quick links to:</p>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>AI Chat Assistant:</strong> Engage in conversations with an AI tutor.</li>
                <li><strong>Interactive Mindmaps:</strong> Generate visual mindmaps of any topic.</li>
                <li><strong>Flashcard System:</strong> Create and study flashcards.</li>
                <li><strong>Adaptive Quizzes:</strong> Test your knowledge with AI-generated quizzes.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
                <h3 class="text-xl font-semibold text-white">Start Learning</h3>
              </div>
              <p class="mb-4">Begin with your preferred learning method. Try uploading a PDF to the AI Chat to get contextual answers, or generate flashcards from a topic you're studying.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="bg-slate-700/30 rounded-lg p-4">
                  <h4 class="font-semibold text-blue-400 mb-2">Visual Learners</h4>
                  <p class="text-sm text-slate-300">Start with mind maps and flashcards. Visualize connections and memorize key facts.</p>
                </div>
                <div class="bg-slate-700/30 rounded-lg p-4">
                  <h4 class="font-semibold text-teal-400 mb-2">Interactive Learners</h4>
                  <p class="text-sm text-slate-300">Begin with AI chat and quizzes. Engage directly with the material and test your understanding.</p>
                </div>
              </div>
            </div>
          </div>
        `
      },
      'account-setup': {
        title: 'Account Setup & Navigation',
        content: `
          <p class="text-lg mb-6">Setting up your Ace It AI account is straightforward, and navigating the platform is designed to be intuitive.</p>
          <h3 class="text-xl font-semibold mb-4 text-white">Creating Your Account</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class class="mb-4">To get started with Ace It AI:</p>
            <ol class="list-decimal ml-6 space-y-2 text-slate-300">
              <li>Visit the <a href="/" class="text-blue-400 hover:underline">homepage</a>.</li>
              <li>Click on the "Get Started" or "Login" button, typically found in the top navigation bar.</li>
              <li>You can sign up or log in using your Google account for a quick and secure process. Alternatively, you can register with an email and password.</li>
              <li>Once logged in, you'll be directed to your main dashboard.</li>
            </ol>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Navigating the Platform</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="mb-4">Ace It AI's interface is designed for ease of use:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Dashboard:</strong> Your central hub. Access all main features (Chat, Mindmaps, Flashcards, Quizzes, Documentation) from here.</li>
              <li><strong>Top Navigation Bar:</strong> (On the landing page) Provides links to Features, How It Works, Documentation, and Pricing. The "Get Started" button takes you to the login/dashboard.</li>
              <li><strong>Feature Pages:</strong> Each core feature (Chat, Mindmaps, etc.) has its own dedicated page with a consistent layout. You'll typically find options to create new items, manage existing ones, and interact with the AI.</li>
              <li><strong>User Account Menu:</strong>accessible via a signin/singout button in the top-right corner. This is where you can sign in/out.</li>
            </ul>
          </div>
          
          <div class="bg-amber-900/20 border border-amber-700/50 rounded-xl p-6">
            <h4 class="text-lg font-semibold mb-3 text-amber-400">🔒 Account Security</h4>
            <p class="text-slate-300">If you sign up with Google, your account security is primarily managed by Google. Ensure your Google account itself is secure with a strong password and two-factor authentication if possible.</p>
          </div>
        `
      }
    },
    features: {
      flashcards: {
        title: 'Smart Flashcards',
        content: `
          <p class="text-lg mb-6">Ace It AI's Smart Flashcards help you create, organize, and study more effectively. Our AI-enhanced system adapts to your learning progress, making your study sessions more productive.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Key Feature</h3>
          <div class="mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-blue-400">Intelligent Organization & Creation</h4>
              <ul class="space-y-2 text-slate-300">
                <li>• <strong>AI-Powered Generation:</strong> Automatically generate flashcards from your notes, PDFs, or by simply describing a topic.</li>
                <li>• <strong>Custom Tags & Folders:</strong> Organize your flashcards with customizable tags and folders for easy retrieval.</li>
                <li>• <strong>Bulk Operations:</strong> Efficiently manage large sets of flashcards with bulk creation, editing, and deletion.</li>
              </ul>
            </div>
            
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Creating Effective Flashcards</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <h4 class="font-semibold mb-3 text-green-400">Best Practices</h4>
            <ul class="space-y-3 text-slate-300">
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Keep it Concise:</strong> Focus on one key concept or piece of information per card.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Use Your Own Words:</strong> Paraphrasing helps in better understanding and recall.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Incorporate Visuals:</strong> Add relevant images or diagrams to enhance memory. (Coming Soon)</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Add Context & Examples:</strong> Include brief explanations or examples where necessary.</span>
              </li>
            </ul>
          </div>
        `
      },
      'mind-maps': {
        title: 'Interactive Mind Maps',
        content: `
          <p class="text-lg mb-6">Visually organize complex information, brainstorm ideas, and see connections with Ace It AI's Interactive Mind Maps. Our tool is designed to enhance creative thinking and information retention.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Mind Map Features</h3>
          <div class="space-y-6 mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-purple-400">Intuitive Visual Learning</h4>
              <p class="text-slate-300 mb-4">Transform complex topics into clear, hierarchical visual diagrams that are easy to understand and remember.</p>
              <ul class="space-y-2 text-slate-300">
                <li>• <strong>AI-Assisted Creation:</strong> Generate mind maps from text, topics, or existing notes with AI.</li>
              </ul>
            </div>
            
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">How We Create Effective Mind Maps</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <ol class="space-y-3 text-slate-300">
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">1</div>
                <span><strong>Start with a Central Idea:</strong> Place your main topic or question at the center.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">2</div>
                <span><strong>Branch Out Main Themes:</strong> Create primary branches for key sub-topics or categories.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">3</div>
                <span><strong>Add Supporting Details:</strong> Expand branches with sub-branches for specific details, facts, or ideas.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">4</div>
                <span><strong>Use Keywords & Images:</strong> Keep text concise and use visuals to enhance understanding and recall.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-6 h-6 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">5</div>
                <span><strong>Make Connections:</strong> Draw lines or use arrows to show relationships between different ideas.</span>
              </li>
            </ol>
          </div>
        `
      },
      quizzes: {
        title: 'AI-Powered Quizzes',
        content: `
          <p class="text-lg mb-6">Test your knowledge and reinforce learning with Ace It AI's Quizzes. Our AI generates tailored quizzes based on your study materials, primarily focusing on multiple-choice questions derived from topics or uploaded PDF content.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white\">Intelligent Quiz Generation</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-orange-400\">Question Generation</h4>
              <p class="text-slate-300 mb-3">Our AI focuses on generating multiple-choice questions to test your understanding.</p>
              <ul class="space-y-1 text-sm text-slate-400">
                <li>• <strong>Multiple Choice Questions:</strong> Generated with 4 options, a correct answer, a simple explanation for the correct answer, and explanations for why other options are incorrect.</li>
                <li>• <strong>Topic or PDF-Based:</strong> Quizzes are generated based on a topic you provide or content extracted from an uploaded PDF file.</li>
                <li>• <strong>Subtopic Diversification:</strong> The AI first generates a set of diverse subtopics from the main topic/document to ensure comprehensive coverage at an introductory level.</li>
                <li>• <strong>Fixed Question Count:</strong> Currently, quizzes are generated with a fixed set of 10 questions.</li>
              </ul>
            </div>
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-red-400\">Quiz Experience</h4>
              <p class="text-slate-300 mb-3\">Engage with the generated quizzes and track your performance.</p>
              <ul class="space-y-1 text-sm text-slate-400">
                <li>• <strong>Sequential Answering:</strong> Answer questions one by one.</li>
                <li>• <strong>Immediate Feedback (Basic):</strong> See if your answer was correct. Detailed explanations are available.</li>
                <li>• <strong>Score Tracking:</strong> Your score is calculated based on the number of correct answers.</li>
                <li>• <strong>Attempt History:</strong> Previous quiz attempts are saved, allowing you to review your performance on a specific quiz.</li>
              </ul>
            </div>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white\">Current Capabilities & Future Enhancements</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <p class="text-slate-300 mb-4">Ace It AI quizzes are designed to be a helpful study tool. Here's what's currently available and what we're working on:</p>
            <ul class="space-y-3 text-slate-300">
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Available:</strong> Generation of multiple-choice questions from topics or PDFs.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Available:</strong> Saving quiz attempts and scores.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Available:</strong> Reviewing past attempts with your answers and correct answers/explanations.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Future:</strong> More question types (e.g., True/False, Fill-in-the-blanks, Short Answer).</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Future:</strong> True adaptive learning (dynamically adjusting difficulty based on ongoing performance within a quiz).</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Future:</strong> User-configurable quiz length and difficulty settings.</span>
               <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Future:</strong> Timed quizzes.</span>
              </li>
            </ul>
          </div>
        `
      },
      'ai-chat': {
        title: 'AI Chat Assistant',
        content: `
          <p class="text-lg mb-6">Engage with Ace, your personal AI Chat Assistant, for instant academic support. Ace can help you understand complex topics, generate ideas, summarize texts, and much more, directly within your learning environment.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Chat Capabilities</h3>
          <div class="space-y-6 mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-emerald-400">Context-Aware Assistance</h4>
              <p class="text-slate-300 mb-4">Ace understands the context of your current task, whether you're working on flashcards, mind maps, or reviewing quiz results.</p>
              <ul class="space-y-2 text-slate-300">
                <li>• <strong>Document Interaction:</strong> Ask questions about uploaded PDFs or other documents.</li>
                <li>• <strong>Content Generation:</strong> Get help drafting explanations, summaries, or study notes.</li>
                <li>• <strong>Problem Solving:</strong> Work through complex problems step-by-step with AI guidance.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-purple-400">Personalized Learning Support</h4>
              <p class="text-slate-300 mb-4">Ace adapts its responses and suggestions based on your learning style and progress.</p>
              <ul class="space-y-2 text-slate-300">
                <li>• <strong>Adaptive Explanations:</strong> Get explanations tailored to your level of understanding.</li>
                <li>• <strong>Study Strategy Advice:</strong> Receive tips on effective learning techniques.</li>
                <li>• <strong>Voice Input:</strong> Interact with Ace using voice for hands-free learning.</li>
              </ul>
            </div>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">How to Use the AI Chat (Ace)</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <div class="space-y-4">
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">?</div>
                <div>
                  <h5 class="font-semibold text-blue-400 mb-1">Ask Clarifying Questions</h5>
                  <p class="text-slate-300 text-sm">e.g., "Can you explain the concept of osmosis in simpler terms?" or "What are the main differences between Python and JavaScript?"</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">📝</div>
                <div>
                  <h5 class="font-semibold text-green-400 mb-1">Generate Content</h5>
                  <p class="text-slate-300 text-sm">e.g., "Summarize this PDF document for me." or "Help me brainstorm ideas for my essay on climate change."</p>
                </div>
              </div>
              <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">💡</div>
                <div>
                  <h5 class="font-semibold text-purple-400 mb-1">Get Study & Writing Tips</h5>
                  <p class="text-slate-300 text-sm">e.g., "What's an effective way to study for a history exam?" or "Can you give me feedback on this paragraph?"</p>
                </div>
              </div>
               <div class="flex items-start gap-4">
                <div class="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">🗣️</div>
                <div>
                  <h5 class="font-semibold text-red-400 mb-1">Use Voice Input</h5>
                  <p class="text-slate-300 text-sm">Click the microphone icon and speak your query directly to Ace.</p>
                </div>
              </div>
            </div>
          </div>
        `
      }
    },
    'user-guide': {
      dashboard: {
        title: 'Navigating the Dashboard',
        content: `
          <p class="text-lg mb-6">The Ace It AI dashboard is your central hub for accessing all learning tools and features. It's designed for quick navigation and an overview of your learning activities.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Dashboard Components</h3>
          <div class="space-y-6 mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-blue-400">Main Feature Cards</h4>
              <p class="text-slate-300 mb-4">The dashboard prominently features cards that provide direct access to the core functionalities of Ace It AI:</p>
              <ul class="space-y-3 text-slate-300">
                <li class="bg-slate-700/30 p-3 rounded-lg"><strong>AI Chat (Ace):</strong> Click here to open the chat interface with Ace, your AI assistant. You can ask questions, upload PDFs for discussion, and get personalized help.</li>
                <li class="bg-slate-700/30 p-3 rounded-lg"><strong>Interactive Mind Maps:</strong> Access the mind mapping tool to create, view, and manage your mind maps. Generate new maps from topics or text.</li>
                <li class="bg-slate-700/30 p-3 rounded-lg"><strong>Smart Flashcards:</strong> Navigate to the flashcard section to create new flashcards (individually or by generating from a topic/PDF), organize them into folders, and start your review sessions.</li>
                <li class="bg-slate-700/30 p-3 rounded-lg"><strong>Adaptive Quizzes:</strong> Go here to generate quizzes based on your chosen topics or by uploading a PDF. You can take quizzes and review your past attempts.</li>
                <li class="bg-slate-700/30 p-3 rounded-lg"><strong>Documentation:</strong> A direct link to this comprehensive guide you are currently reading.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-green-400">Navigation</h4>
              <p class="text-slate-300 mb-4">Consistent navigation is key to a smooth experience:</p>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>Main Navigation (Sidebar):</strong> A persistent sidebar navigation menu allows you to switch between the Dashboard, AI Chat, Mind Maps, Flashcards, and Quizzes sections easily.</li>
                <li><strong>User Account & Theme:</strong> Access your account options (Sign Out) and toggle between light/dark themes from the user icon typically found in the bottom-left of the sidebar.</li>
              </ul>
            </div>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Using the Dashboard Effectively</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <ul class="space-y-3 text-slate-300">
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0\"></div>
                <span><strong>Your Starting Point:</strong> Use the dashboard as your launchpad for any learning activity on Ace It AI.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Quick Access to Tools:</strong> The feature cards provide one-click access, saving you time.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Stay Oriented:</strong> The sidebar navigation ensures you can easily move between different sections of the application.</span>
              </li>
            </ul>
          </div>
        `
      },
      'organizing-content': {
        title: 'Organizing Your Study Material',
        content: `
          <p class="text-lg mb-6">Effectively organizing your study materials within Ace It AI can significantly enhance your learning efficiency. Here’s how you can manage your content:</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Flashcard Folders</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Flashcards are organized into folders. This is essential for targeted study and for generating specific quizzes.</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Automatic Folder Creation:</strong> When you generate flashcards from a topic or PDF, a folder is automatically created named after that topic or document.</li>
              <li><strong>Manual Folder Creation:</strong> You can create new, empty folders directly within the flashcards section to organize cards later.</li>
              <li><strong>Naming Folders:</strong> Use clear, descriptive names for your folders (e.g., "Psychology 101 - Chapter 3", "Calculus - Derivatives").</li>
              <li><strong>Managing Folders:</strong> You can rename folders and delete folders (which will also delete all flashcards within them). Moving flashcards between folders is a planned feature.</li>
            </ul>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Flashcard Tags</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Each flashcard has a 'tag' field, allowing for an additional layer of categorization.</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Adding Tags:</strong> When creating or editing a flashcard, assign a relevant tag (e.g., "Key Concept", "Formula", "Vocabulary", "Important Date").</li>
              <li><strong>Filtering by Tags:</strong> You can filter your flashcards by specific tags. In the search bar within the flashcards section, type '#' followed by your tag (e.g., "#Formula") to see all flashcards with that tag.</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-white">Mind Maps & Quizzes Organization</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Mind Maps and Quizzes are generally listed by creation date and title.</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
                <li><strong>Naming:</strong> Give your mind maps and quizzes descriptive titles for easy identification (e.g., "Mind Map: Causes of WWI", "Quiz: Cell Biology Basics").</li>
                <li><strong>Quiz Attempts:</strong> All your quiz attempts are saved and associated with the specific quiz you took. You can review these attempts to track your performance over time.</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-white">AI Chat (Ace) & Uploaded Documents</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Your interactions with Ace and the documents you upload are managed as follows:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>PDF Context:</strong> When you upload a PDF to the AI Chat, it provides context for that specific chat session. The AI will refer to this document when answering your questions. You can clear the PDF or upload a new one at any time to change the context.</li>
              <li><strong>Persistent Chat History:</strong> All your conversations with Ace are saved. You can revisit previous chat sessions, review the discussion, and even ask follow-up questions related to past conversations.</li>
              <li><strong>Document Storage:</strong> Uploaded PDFs are primarily for contextual use within a chat session. There isn't a central, persistent library of all uploaded documents within the app at this time; you re-upload PDFs as needed for new chat topics or if you want Ace to reference a specific document again.</li>
            </ul>
          </div>
        `
      },
      'study-sessions': {
        title: 'Effective Study Sessions with Ace It AI',
        content: `
          <p class="text-lg mb-6">Ace It AI offers a suite of tools to enhance your study process. Here’s a suggested workflow for incorporating them into effective study sessions:</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">A Strategic Approach to Learning</h3>
          <div class="space-y-6 mb-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-green-400">1. Understand & Explore: AI Chat and Mind Maps</h4>
              <p class="text-slate-300 mb-4">Begin by building a solid understanding of the material.</p>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>AI Chat (Ace):</strong> Upload your textbook chapter, lecture notes (as PDF), or research paper. Ask Ace to explain complex concepts, define key terms, summarize sections, or even generate potential questions about the material. Use it as an interactive tutor to clarify doubts.</li>
                <li><strong>Mind Maps:</strong> For a new or complex topic, use the AI to generate a mind map. This will help you visualize the main ideas, sub-topics, and their connections, providing a structural overview before you dive into detailed memorization. You can also create mind maps manually to synthesize your understanding.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-blue-400">2. Memorize & Reinforce: Smart Flashcards</h4>
              <p class="text-slate-300 mb-4">Once you grasp the concepts, use flashcards for active recall and memorization.</p>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>AI Flashcard Generation:</strong> Save time by letting Ace It AI generate flashcards from your uploaded PDF or a specific topic. Review and refine these AI-generated cards.</li>
                <li><strong>Manual Creation:</strong> Create your own flashcards for key terms, definitions, formulas, dates, or question-answer pairs. This act of creation itself aids learning.</li>
                <li><strong>Organized Review:</strong> Utilize folders and tags to study specific sets of flashcards. Focus on one topic or chapter at a time.</li>
                <li><strong>Regular Practice:</strong> Go through your flashcards regularly. (Note: While a full spaced repetition system (SRS) is a future goal, manually reviewing cards frequently is still highly effective).</li>
              </ul>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-purple-400">3. Test & Identify Gaps: Adaptive Quizzes</h4>
              <p class="text-slate-300 mb-4">Regularly assess your knowledge to find areas needing more attention.</p>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>Generate Targeted Quizzes:</strong> Create quizzes from specific flashcard folders or by uploading a relevant PDF. This allows you to test yourself on the material you've just studied.</li>
                <li><strong>Review Attempts:</strong> After each quiz, carefully review your answers. Pay close attention to incorrect responses and understand why you made those mistakes. The explanations provided can be very helpful.</li>
                <li><strong>Iterative Learning:</strong> Use your quiz performance to guide further study. If you struggled with certain topics, revisit your flashcards, re-read relevant sections of your material, or ask Ace for further clarification. Then, retake a similar quiz later to check for improvement.</li>
              </ul>
            </div>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-white">General Study Tips for Success</h3>
           <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <ul class="space-y-3 text-slate-300">
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0\"></div>
                <span><strong>Consistency is Key:</strong> Short, focused, and regular study sessions are generally more effective than long, sporadic cramming.</li>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Active Engagement:</strong> Actively use the tools – create, generate, quiz, ask. Passive reading is less effective for long-term retention.</span>
              </li>
              <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Minimize Distractions:</strong> Find a quiet study environment to maximize focus when using Ace It AI.</span>
              </li>
               <li class="flex items-start gap-3">
                <div class="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <span><strong>Set Goals:</strong> Before each study session, decide what you want to achieve (e.g., "Understand Chapter 5", "Memorize 20 vocabulary words", "Score 80% on a quiz about photosynthesis").</span>
              </li>
            </ul>
          </div>
        `
      },
      'progress-tracking': {
        title: 'Tracking Your Progress',
        content: `
          <p class="text-lg mb-6">Understanding your learning progress is key to staying motivated and identifying areas for improvement. Ace It AI offers ways to see how you're doing, primarily through quiz attempts.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Quiz Performance</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">The most direct way to track progress is by reviewing your quiz attempts:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Score Review:</strong> After completing a quiz, you'll see your score. This gives an immediate indication of your understanding of the tested material.</li>
              <li><strong>Attempt History:</strong> Ace It AI saves your quiz attempts. You can revisit past quizzes to see your scores and the questions you got right or wrong.</li>
              <li><strong>Identifying Weaknesses:</strong> Consistently scoring lower on quizzes related to certain topics or showing patterns of incorrect answers can help you pinpoint areas that require more focused study.</li>
            </ul>
          </div>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Flashcard Review (Self-Assessment)</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">While studying flashcards, you are implicitly tracking your progress through self-assessment:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Recall Success:</strong> As you go through your flashcards, note how easily and accurately you can recall the information on the reverse side.</li>
              <li><strong>Using Tags for Difficulty:</strong> You can use the 'tag' field on flashcards to mark them as 'easy', 'medium', or 'hard' based on your confidence. Periodically review the 'hard' tagged cards more frequently.</li>
            </ul>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-white">Future Enhancements for Progress Tracking</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <p class="text-slate-300 mb-4">We are continuously working to improve Ace It AI. Future enhancements for progress tracking may include:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li>More detailed analytics on flashcard review (e.g., recall rates over time).</li>
              <li>Visual progress charts and dashboards.</li>
              <li>Spaced repetition system with automated scheduling and tracking.</li>
            </ul>
            <p class="text-slate-300 mt-4">For now, actively using the quiz features and being mindful during your flashcard reviews are the best ways to monitor your learning journey with Ace It AI.</p>
          </div>
        `
      }
    },
    advanced: {
      'ai-personalization': {
        title: 'AI Personalization',
        content: `
          <p class="text-lg mb-6">Ace It AI leverages artificial intelligence to provide a learning experience that adapts to you. While we are continuously working on deeper personalization, here's how our AI currently assists in tailoring your study process:</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Adaptive AI Assistance</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Contextual AI Chat:</strong> Ace, your AI Chat Assistant, provides responses and explanations tailored to your queries and the documents you upload. It can adjust the complexity of explanations based on your interaction.</li>
              <li><strong>AI-Powered Content Generation:</strong> The AI generates flashcards, mind map structures, and quiz questions based on the specific topics or materials you provide, ensuring relevance to your study needs.</li>
              <li><strong>Responsive Feedback:</strong> In quizzes, you receive explanations for answers, helping you understand concepts more deeply.</li>
            </ul>
          </div>
          </div>
        `
      },
      'custom-tags': {
        title: 'Custom Tags & Folders',
        content: `
          <p class="text-lg mb-6">Organize your study materials effectively using folders and tags, primarily within the Flashcards feature.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Using Folders for Flashcards</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Group your flashcards into folders by subject, chapter, or any category that suits your study style. Folders can be created during bulk flashcard generation or managed directly in the flashcard interface. Refer to the 'Organizing Your Study Material' section in the User Guide for more details.</p>
          </div>

          <h3 class="text-xl font-semibold mb-4 text-white">Utilizing the Tag Field</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300">Each flashcard includes a single 'tag' field. You can use this field to add keywords for further categorization, such as 'Science', 'Social', or 'Math'. You can also filter the related tags through the search feature.</p>
          </div>
        `
      },
      'export-import': {
        title: 'Export & Import',
        content: `
          <p class="text-lg mb-6">We aim to provide robust options for managing your study data, including exporting and importing materials.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Current Capabilities & Future Plans</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">Currently, direct export/import features for flashcards, mind maps, and quizzes in various formats (like PDF, CSV, JSON, Anki decks, Quizlet sets) are primarily planned for future development. Our goal is to allow you to easily:</p>
            <ul class="space-y-3 text-slate-300 list-disc pl-5">
              <li><strong>Export your created content:</strong> Save your flashcards, mind maps, and quiz data for offline use, backup, or printing.</li>
              <li><strong>Import existing materials:</strong> Bring in study sets from other platforms or common file formats.</li>
            </ul>
            <p class="text-slate-300 mt-4">Please check back for updates as we roll out these functionalities. We understand the importance of data portability and are committed to implementing these features.</p>
          </div>
        `
      },
    },
    support: {
      faq: {
        title: 'Frequently Asked Questions',
        content: `
          <p class="text-lg mb-6">Find answers to common questions about Ace It AI. If your question isn't here, feel free to reach out to our support.</p>
          
          <div class="space-y-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-blue-400">1. Is Ace It AI free to use?</h4>
              <p class="text-slate-300">Yes, Ace It AI is currently free to use. All core features, including AI Chat, Flashcards, Mind Maps, and Quizzes, are available to all users without any subscription fees. We are committed to providing accessible AI-powered learning tools.</p>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-green-400">2. What types of files can I upload for the AI Chat?</h4>
              <p class="text-slate-300">Currently, you can upload PDF documents to the AI Chat (Ace) for contextual discussions, summaries, and question-answering. We are working on supporting more file types in the future.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-purple-400">3. How are my flashcards organized?</h4>
              <p class="text-slate-300">Flashcards are organized into folders. When you generate flashcards from a topic or PDF, a folder is automatically created. You can also create folders manually. Each flashcard also has a 'tag' field for further categorization, and you can filter by these tags using the search bar (e.g., #yourtag).</p>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-orange-400">4. Can I export my data (flashcards, mind maps)?</h4>
              <p class="text-slate-300">Currently, direct export features for flashcards and mind maps (e.g., as PDF, CSV) are planned for future development. We understand the importance of data portability and are working to implement these options.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-teal-400">5. How does the AI generate content like flashcards or quiz questions?</h4>
              <p class="text-slate-300">Our AI uses advanced natural language processing models. When you provide a topic or upload a PDF, the AI analyzes the content to identify key concepts, definitions, and important information, which it then uses to create relevant flashcards, mind map structures, or quiz questions.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-red-400">6. Is there a limit to how many flashcards or mind maps I can create?</h4>
              <p class="text-slate-300">While Ace It AI is free, there might be fair usage considerations in the future to ensure service quality for all users. For now, you can create a generous amount of content. If any specific limits are introduced, they will be clearly communicated.</p>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-yellow-400">7. How is my data privacy handled?</h4>
              <p class="text-slate-300">We take your privacy seriously. Please refer to our Privacy Policy for detailed information on how we collect, use, and protect your data. User authentication is handled via NextAuth, and we strive to use industry best practices for security.</p>
            </div>

             <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-indigo-400">8. What if I find an error in AI-generated content?</h4>
              <p class="text-slate-300">AI, while powerful, is not infallible and can sometimes make mistakes or generate information that isn't perfectly accurate. We recommend cross-referencing critical information with other reliable sources. You can also edit any AI-generated content (like flashcards) to correct it.</p>
            </div>

          </div>
        `
      },
      troubleshooting: {
        title: 'Troubleshooting Common Issues',
        content: `
          <p class="text-lg mb-6">Encountering an issue? Here are solutions to some common problems. If you don't find your answer here, please contact our support.</p>
          
          <h3 class="text-xl font-semibold mb-4 text-white">Common Issues & Solutions</h3>
          <div class="space-y-6">
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-red-400">1. Login Problems (e.g., Can't sign in)</h4>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>Check Credentials:</strong> Ensure you are using the correct email and password associated with your Google account (as we use Google for authentication).</li>
                <li><strong>Browser Issues:</strong> Try clearing your browser's cache and cookies. Sometimes, old site data can cause login conflicts.</li>
                <li><strong>Try Incognito/Private Window:</strong> Attempt logging in using an incognito or private browsing window to rule out browser extension conflicts.</li>
                <li><strong>Google Account Issues:</strong> Ensure there are no issues with your Google account itself.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-orange-400">2. PDF Upload Issues in AI Chat</h4>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>File Type:</strong> Ensure the file is a PDF. Other file types are not currently supported for upload.</li>
                <li><strong>File Size:</strong> Very large PDFs might take longer to process or could potentially cause issues. Try a smaller PDF if you encounter problems.</li>
                <li><strong>Clear Previous PDF:</strong> If a PDF is already loaded in the chat context, try clearing it before uploading a new one.</li>
                <li><strong>Browser/Connection:</strong> A stable internet connection is required. Try refreshing the page or checking your connection.</li>
              </ul>
            </div>
            
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-yellow-400">3. AI Content Generation Takes Too Long or Fails</h4>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>Server Load:</strong> Occasionally, high server load might slow down AI generation. Please try again after a few minutes.</li>
                <li><strong>Complexity of Request:</strong> Very broad topics or extremely large documents might take longer for the AI to process for flashcard/quiz generation. Try being more specific or using smaller chunks of text/PDFs.</li>
                <li><strong>Internet Connection:</strong> Ensure your internet connection is stable throughout the generation process.</li>
              </ul>
            </div>

            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h4 class="font-semibold mb-3 text-green-400">4. Flashcards/Mind Maps/Quizzes Not Saving or Displaying Correctly</h4>
              <ul class="space-y-2 text-slate-300 list-disc pl-5">
                <li><strong>Refresh Page:</strong> A simple page refresh can often resolve temporary display glitches.</li>
                <li><strong>Browser Cache:</strong> Clear your browser cache, as outdated cached files can sometimes interfere with how content is displayed or functions.</li>
                <li><strong>Check for Errors:</strong> Open your browser's developer console (usually by pressing F12) and look for any error messages in the 'Console' tab. This information can be helpful if you need to contact support.</li>
              </ul>
            </div>

          </div>
          
          <h3 class="text-xl font-semibold mb-4 mt-8 text-white">Contacting Support</h3>
          <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 mb-6">
            <p class="text-slate-300 mb-4">If you've tried the troubleshooting steps above and are still experiencing issues, or if you have a problem not listed, please don't hesitate to reach out. While we don't have a dedicated support email or live chat yet, you can report issues or provide feedback through the following channel:</p>
            <div class="bg-slate-700/30 rounded-lg p-4">
              <h5 class="font-semibold text-teal-400 mb-2">GitHub Issues (For Technical Users/Feedback)</h5>
              <p class="text-sm text-slate-300 mb-2">If you are comfortable with GitHub, you can check if a similar issue has been reported or create a new one in our project repository. This is also a great place for feature requests or general feedback.</p>
              <a href="https://github.com/amaantheone/ace-it-ai/issues" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg text-white font-medium transition-colors">
                Go to GitHub Issues <ExternalLink size={16} />
              </a>
              <!-- <p class="text-xs text-slate-400 mt-2">(Please replace with the actual link if available, or remove this if not applicable.)</p> -->
            </div>
            <p class="text-slate-300 mt-4">We are continuously working to improve Ace It AI and appreciate your patience and feedback!</p>
          </div>
        `
      }
    }
  };

  const handleSectionClick = (sectionId: string, subsectionId?: string) => {
    setActiveSection(sectionId);
    if (subsectionId) {
      setActiveSubsection(subsectionId);
    } else {
      // Set first subsection as active when clicking main section
      const section = sections.find(s => s.id === sectionId);
      if (section && section.subsections.length > 0) {
        setActiveSubsection(section.subsections[0].id);
      }
    }
    setIsMobileMenuOpen(false);
    // Scroll to top when navigating
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubsectionClick = (subsectionId: string) => {
    setActiveSubsection(subsectionId);
    setIsMobileMenuOpen(false);
  };

  type DocContent = { title: string; content: string };

  const getCurrentContent = (): DocContent | null => {
    const sectionContent = content[activeSection as keyof typeof content];
    if (sectionContent && activeSubsection) {
      const subsectionContent = sectionContent[activeSubsection as keyof typeof sectionContent];
      if (
        subsectionContent &&
        typeof subsectionContent === "object" &&
        "title" in subsectionContent &&
        "content" in subsectionContent
      ) {
        return subsectionContent as DocContent;
      }
    }
    return null;
  };

  const currentContent = getCurrentContent();

  // Prepare docsNavLinks for AppBar
  const docsNavLinks = sections.map(section => ({
    id: section.id,
    title: section.title,
    subsections: section.subsections.map(sub => ({
      id: sub.id,
      title: sub.title
    }))
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-teal-500/10"></div>
        <div className="absolute top-0 left-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <AppBar 
          currentPage='docs'
          docsNavLinks={docsNavLinks}
          onDocsNav={(sectionId, subsectionId) => {
            return handleSectionClick(sectionId, subsectionId);
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
          {/* Sidebar Navigation (hide on mobile) */}
          <aside className="hidden lg:block sticky top-20 left-0 right-0 lg:top-8 z-40 lg:z-auto w-full lg:w-80 h-screen lg:h-fit bg-slate-900 lg:bg-transparent p-4 lg:p-0 overflow-y-auto">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span>{section.title}</span>
                      <ChevronRight size={16} className={`ml-auto transition-transform ${isActive ? 'rotate-90' : ''}`} />
                    </button>
                    {isActive && (
                      <div className="ml-6 mt-2 space-y-1">
                        {section.subsections.map((subsection) => {
                          const isSubActive = activeSubsection === subsection.id;
                          return (
                            <button
                              key={subsection.id}
                              onClick={() => handleSubsectionClick(subsection.id)}
                              className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                                isSubActive
                                  ? 'text-teal-400 bg-teal-500/10'
                                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                              }`}
                            >
                              {subsection.title}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-4xl">
              {currentContent && (
                <div className="bg-slate-800/30 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 sm:p-8 lg:p-10">
                  <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                    {currentContent.title}
                  </h1>
                  <div 
                    className="prose prose-invert prose-lg max-w-none text-slate-300"
                    dangerouslySetInnerHTML={{ __html: currentContent.content }}
                  />
                  {/* Next Button Logic */}
                  {(() => {
                    const sectionIdx = sections.findIndex(s => s.id === activeSection);
                    const subsectionIdx = sectionIdx >= 0 ? sections[sectionIdx].subsections.findIndex(sub => sub.id === activeSubsection) : -1;
                    let nextSectionId = null;
                    let nextSubsectionId = null;
                    let nextLabel = '';
                    if (sectionIdx >= 0 && subsectionIdx >= 0) {
                      const section = sections[sectionIdx];
                      // Next subsection in current section
                      if (subsectionIdx < section.subsections.length - 1) {
                        nextSectionId = section.id;
                        nextSubsectionId = section.subsections[subsectionIdx + 1].id;
                        nextLabel = section.subsections[subsectionIdx + 1].title;
                      } else if (sectionIdx < sections.length - 1) {
                        // First subsection of next section
                        const nextSection = sections[sectionIdx + 1];
                        nextSectionId = nextSection.id;
                        nextSubsectionId = nextSection.subsections[0].id;
                        nextLabel = nextSection.title + ': ' + nextSection.subsections[0].title;
                      }
                    }
                    if (nextSectionId && nextSubsectionId) {
                      return (
                        <div className="mt-10 flex justify-end">
                          <button
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl"
                            onClick={() => handleSectionClick(nextSectionId, nextSubsectionId)}
                          >
                            Next: {nextLabel}
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;