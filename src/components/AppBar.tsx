"use client"

import React, { useState, useEffect, useRef } from 'react';
import { LogIn, LogOut, Menu, FileText } from 'lucide-react';
import Link from 'next/link';
import useSession from "@/hooks/useNextAuthSession";
import { signOut } from "next-auth/react";
import Image from 'next/image';

interface AppBarProps {
  currentPage?: 'home' | 'features' | 'docs' | 'pricing';
  docsNavLinks?: { id: string; title: string; subsections: { id: string; title: string; }[]; }[];
  onDocsNav?: (sectionId: string, subsectionId: string) => void;
}

export default function AppBar({ currentPage }: AppBarProps) {
  const { data: session } = useSession();
  const [showAppBar, setShowAppBar] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          if (currentScrollY < 10) {
            setShowAppBar(true);
          } else if (currentScrollY > lastScrollY.current) {
            setShowAppBar(false); // scrolling down
          } else if (currentScrollY > 80) {
            setShowAppBar(true); // scrolling up, but only after scrolling down a bit
          }
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`px-4 sm:px-6 py-4 sm:py-6 border-b border-slate-200/10 transition-transform duration-300 bg-slate-900/90 backdrop-blur-md z-50 w-full ${showAppBar ? 'fixed top-0 left-0 right-0 translate-y-0' : 'fixed top-0 left-0 right-0 -translate-y-full'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg flex items-center">
              <Image
                src="/Ace It AI.png" 
                alt="Ace It AI Logo" 
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </Link>
            <Link href="/" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ace It AI
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <Link
              href="/" 
              className={`font-medium transition-colors hover:text-blue-500 ${
                currentPage === 'home' ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              Home
            </Link>
            <Link
              href="/#features" 
              className={`font-medium transition-colors hover:text-blue-500 ${
                currentPage === 'features' ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              Features
            </Link>
            <a 
              href="/docs" 
              className={`font-medium transition-colors hover:text-blue-500 ${
                currentPage === 'docs' ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              Documentation
            </a>
            <a 
              href="/pricing" 
              className={`font-medium transition-colors hover:text-blue-500 ${
                currentPage === 'pricing' ? 'text-blue-500' : 'text-slate-300'
              }`}
            >
              Pricing
            </a>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center gap-3">
            <a 
              href="/docs" 
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl text-sm ${
                currentPage === 'docs' 
                  ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700' 
                  : 'bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700 backdrop-blur-sm'
              }`}
            >
              <FileText size={14} />
              Docs
            </a>
            {session ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl text-sm sm:text-base"
              >
                <LogOut size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Sign out</span>
              </button>
            ) : (
              <a href="/auth/login" className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl text-sm sm:text-base">
                <LogIn size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Sign In</span>
                <span className="sm:hidden">Sign In</span>
              </a>
            )}
            <button className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-white border border-slate-700" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex justify-end">
          <div className="w-64 bg-slate-900 h-full shadow-lg p-6 flex flex-col gap-6">
            <button className="self-end mb-4 text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(false)}>
              ✕
            </button>
            <Link href="/" className={`font-medium transition-colors hover:text-blue-500 ${currentPage === 'home' ? 'text-blue-500' : 'text-slate-300'}`} onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link href="/#features" className={`font-medium transition-colors hover:text-blue-500 ${currentPage === 'features' ? 'text-blue-500' : 'text-slate-300'}`} onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link href="/docs" className={`font-medium transition-colors hover:text-blue-500 ${currentPage === 'docs' ? 'text-blue-500' : 'text-slate-300'}`} onClick={() => setMobileMenuOpen(false)}>
              Documentation
            </Link>
            <Link href="/pricing" className={`font-medium transition-colors hover:text-blue-500 ${currentPage === 'pricing' ? 'text-blue-500' : 'text-slate-300'}`} onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            {session ? (
              <button
                onClick={() => { signOut(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl text-sm"
              >
                <LogOut size={14} /> Sign Out
              </button>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl text-sm" onClick={() => setMobileMenuOpen(false)}>
                <LogIn size={14} /> Sign In
              </Link>
            )}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}
      {/* Spacer to prevent content from being hidden behind the AppBar */}
      <div className="h-16 sm:h-20" />
    </>
  );
}