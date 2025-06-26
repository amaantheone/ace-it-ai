import React from 'react';
import { Check, Star, Zap, ArrowRight } from 'lucide-react';
import AppBar from '@/components/AppBar';
import Footer from '@/components/Footer';


export default function PricingPage() {
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
        <AppBar currentPage="pricing" />

        {/* Hero Section */}
        <section className="px-4 sm:px-6 py-12 sm:py-16 lg:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 sm:mb-16 lg:mb-20">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                Simple, Transparent Pricing
              </h1>
              <p className="text-lg sm:text-xl max-w-3xl mx-auto font-light text-slate-300 px-4">
                Ace It AI is completely free to use! We believe education should be accessible to everyone.
              </p>
            </div>

            {/* Main Pricing Card */}
            <div className="max-w-5xl mx-auto mb-12 sm:mb-16 lg:mb-20">
              <div className="p-8 sm:p-10 lg:p-12 rounded-3xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500">
                <div className="flex flex-col lg:flex-row items-center justify-between mb-8 sm:mb-10 lg:mb-12">
                  <div className="text-center lg:text-left mb-6 lg:mb-0">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-white">
                      Free Forever Plan
                    </h2>
                    <p className="text-lg sm:text-xl font-light text-slate-300">
                      Full access to all features, no hidden costs
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      $0
                    </div>
                    <p className="text-slate-400 font-light">Forever</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 mb-8 sm:mb-10 lg:mb-12">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center text-white">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center mr-3 sm:mr-4">
                        <Star size={18} className="sm:w-5 sm:h-5 text-white" />
                      </div>
                      Core Features
                    </h3>
                    <ul className="space-y-4 sm:space-y-5">
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Interactive AI-powered chat assistance</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Dynamic flashcard creation and study tools</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Interactive mind maps for visual learning</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Adaptive quizzes with personalized feedback</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Unlimited study sessions</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 flex items-center text-white">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center mr-3 sm:mr-4">
                        <Zap size={18} className="sm:w-5 sm:h-5 text-white" />
                      </div>
                      Additional Benefits
                    </h3>
                    <ul className="space-y-4 sm:space-y-5">
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Access to all future feature updates</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Cloud storage for all your learning materials</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Progress tracking and analytics</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Mobile-friendly design for learning on-the-go</span>
                      </li>
                      <li className="flex items-start">
                        <Check size={18} className="sm:w-5 sm:h-5 text-teal-500 mr-3 sm:mr-4 mt-1 flex-shrink-0" />
                        <span className="text-base sm:text-lg font-light text-slate-300">Community support</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="text-center">
                  <a href="/auth/login" className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-xl font-semibold text-lg sm:text-xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl">
                    <Zap size={20} className="sm:w-6 sm:h-6" />
                    Get Started Now
                    <ArrowRight size={20} className="sm:w-6 sm:h-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg sm:text-xl font-light text-slate-300">
                  Everything you need to know about our free platform
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
                    Is it really completely free?
                  </h3>
                  <p className="text-base sm:text-lg font-light leading-relaxed text-slate-300">
                    Yes! Ace It AI is 100% free with no hidden costs or premium tiers. We believe that quality education should be accessible to everyone.
                  </p>
                </div>
                
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
                    How can you offer this for free?
                  </h3>
                  <p className="text-base sm:text-lg font-light leading-relaxed text-slate-300">
                    We&apos;re passionate about education and committed to maintaining a free platform through optimized operations and strategic partnerships.
                  </p>
                </div>
                
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
                    Will it remain free in the future?
                  </h3>
                  <p className="text-base sm:text-lg font-light leading-relaxed text-slate-300">
                    Yes! Our core features will always remain free. We may introduce optional premium features in the future, but the current functionality will always be available at no cost.
                  </p>
                </div>
                
                <div className="p-6 sm:p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-500">
                  <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">
                    Do I need to create an account?
                  </h3>
                  <p className="text-base sm:text-lg font-light leading-relaxed text-slate-300">
                    Yes, a free account is required to save your progress and personalize your learning experience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}