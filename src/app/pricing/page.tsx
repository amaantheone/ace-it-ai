"use client"

import React from 'react';
import { Check, Star, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Pricing
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Ace It AI is completely free to use! We believe education should be accessible to everyone.
          </p>
        </div>

        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Free Forever Plan</h2>
              <p className="text-slate-300">Full access to all features</p>
            </div>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              $0
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Star className="text-yellow-400 mr-2" size={20} />
                Core Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Interactive AI-powered chat assistance</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Dynamic flashcard creation and study tools</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Interactive mind maps for visual learning</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Adaptive quizzes with personalized feedback</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Unlimited study sessions</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Zap className="text-blue-400 mr-2" size={20} />
                Additional Benefits
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Access to all future feature updates</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Cloud storage for all your learning materials</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Progress tracking and analytics</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Mobile-friendly design for learning on-the-go</span>
                </li>
                <li className="flex items-start">
                  <Check className="text-green-400 mr-2 mt-1 flex-shrink-0" size={18} />
                  <span>Community support</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center">
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl hover:cursor-pointer">
                <Zap size={20} className="mr-2" />
                Get Started Now
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
          
          <div className="space-y-6 text-left">
            <div>
              <h3 className="text-xl font-semibold mb-2">Is it really completely free?</h3>
              <p className="text-slate-300">Yes! Ace It AI is 100% free with no hidden costs or premium tiers. We believe that quality education should be accessible to everyone.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">How can you offer this for free?</h3>
              <p className="text-slate-300">We&apos;re passionate about education and committed to maintaining a free platform through optimized operations and strategic partnerships.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Will it remain free in the future?</h3>
              <p className="text-slate-300">Yes! Our core features will always remain free. We may introduce optional premium features in the future, but the current functionality will always be available at no cost.</p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Do I need to create an account?</h3>
              <p className="text-slate-300">Yes, a free account is required to save your progress and personalize your learning experience.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
