"use client"

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="px-4 sm:px-6 py-8 sm:py-12 border-t border-slate-700/50">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/Ace It AI.png"
              alt="Ace It AI Logo"
              width={40}
              height={40}
              className="w-full h-full object-contain"
              priority
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
            href="/privacy"
            className={`transition-colors hover:text-blue-500 font-medium ${
              pathname === '/privacy' ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className={`transition-colors hover:text-blue-500 font-medium ${
              pathname === '/terms' ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            Terms of Service
          </a>
          <a
            href="/docs"
            className={`transition-colors hover:text-blue-500 font-medium ${
              pathname === '/docs' ? 'text-blue-500' : 'text-slate-400'
            }`}
          >
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}
