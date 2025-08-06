'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Initialize from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('aceItUser');
        if (cached) {
          const cachedUser = JSON.parse(cached);
          setUser(cachedUser);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading cached user:', error);
        localStorage.removeItem('aceItUser');
      }
    }
  }, []);

  // Update user when session changes
  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      const sessionUser = {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      };

      // Only update if the user data has actually changed
      const hasChanged = !user || 
        user.name !== sessionUser.name || 
        user.email !== sessionUser.email || 
        user.image !== sessionUser.image;

      if (hasChanged) {
        setUser(sessionUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('aceItUser', JSON.stringify(sessionUser));
        }
      }
      setIsLoading(false);
    } else if (status === 'unauthenticated') {
      // Clear user data if not authenticated
      setUser(null);
      setIsLoading(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('aceItUser');
      }
    }
  }, [session, status, user]);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
