import React, { useState } from 'react';
import { LogIn, User, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from "next-auth/react";
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useUser } from '@/contexts/UserContext';

export default function Header() {
  const { data: session, status } = useSession();
  const { user } = useUser();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const isLoggedIn = status === "authenticated";

  // Use cached user data if available, fallback to session
  const displayUser = user || session?.user;

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/home" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg flex items-center">
              <Image 
                src="/Ace It AI.png" 
                alt="Ace It AI Logo" 
                width={40}
                height={40}
                className="w-full h-full object-contain"
                priority
              />
            </Link>
            <Link href="/home" className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ace It AI
            </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          {pathname !== '/dashboard' && (
            <ThemeToggle 
              variant="ghost" 
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-slate-800/50 w-8 h-8"
            />
          )}

          <Link
            href="/dashboard"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${pathname === '/dashboard' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}
            aria-label="Dashboard"
          >
            <Settings className="w-3 h-3" />
            <span>Dashboard</span>
          </Link>
          
          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={toggleUserMenu}
                className="p-0 bg-transparent border-none focus:outline-none flex items-center justify-center align-middle"
                aria-haspopup="true"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
                style={{ lineHeight: 0 }}
                type="button"
              >
                {displayUser?.image ? (
                  <Image
                    src={displayUser.image}
                    alt="User Avatar"
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover border border-slate-600/50 shadow align-middle"
                    style={{ display: 'block' }}
                    priority
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center align-middle">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 bg-slate-800/95 backdrop-blur-md rounded-md shadow-xl border border-slate-700/50 py-1 z-50">
                  {displayUser?.name && (
                    <div className="px-3 py-2 border-b border-slate-700/50 mb-1">
                      <div className="font-semibold text-base text-white truncate">{displayUser.name}</div>
                      {displayUser.email && (
                        <div className="text-xs text-slate-400 truncate">{displayUser.email}</div>
                      )}
                    </div>
                  )}
                  <hr className="my-1 border-slate-700/50" />
                  <button 
                    onClick={handleLogout}
                    className="w-full px-2.5 py-1.5 text-left text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-2 text-xs"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={() => window.location.href = 'auth/login'}
              className="flex items-center space-x-1 px-2.5 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-md hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-indigo-500/30 text-xs font-medium"
            >
              <LogIn className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}