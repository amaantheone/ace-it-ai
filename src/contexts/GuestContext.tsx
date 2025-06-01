'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface GuestContextType {
  isGuest: boolean;
  guestMessageCount: number;
  incrementGuestMessageCount: () => void;
  resetGuestMessageCount: () => void;
  guestMindmapCount: number;
  incrementGuestMindmapCount: () => void;
  resetGuestMindmapCount: () => void;
  showLoginPopup: boolean;
  setShowLoginPopup: (show: boolean) => void;
  clearGuestData: () => void;
  saveGuestData: (key: string, data: unknown) => void;
  loadGuestData: (key: string) => unknown;
  removeGuestData: (key: string) => void;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) {
    throw new Error('useGuest must be used within a GuestProvider');
  }
  return context;
};

interface GuestProviderProps {
  children: React.ReactNode;
}

export const GuestProvider: React.FC<GuestProviderProps> = ({ children }) => {
  const { data: session } = useSession();
  const [guestMessageCount, setGuestMessageCount] = useState(0);
  const [guestMindmapCount, setGuestMindmapCount] = useState(0);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Determine if user is guest
  const isGuest = !session?.user?.email;

  // Guest data keys
  const GUEST_FLAG_KEY = 'isGuest';
  const GUEST_MESSAGE_COUNT_KEY = 'guest_message_count';
  const GUEST_MINDMAP_COUNT_KEY = 'guest_mindmap_count';
  const GUEST_SESSIONS_KEY = 'guest_sessions';
  const GUEST_MESSAGES_KEY = 'guest_messages';
  const GUEST_FLASHCARDS_KEY = 'guest_flashcards';
  const GUEST_MINDMAPS_KEY = 'guest_mindmaps';
  const GUEST_QUIZZES_KEY = 'guest_quizzes';

  const clearGuestData = useCallback(() => {
    try {
      // Remove all guest-related keys
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.removeItem(GUEST_MESSAGE_COUNT_KEY);
      localStorage.removeItem(GUEST_MINDMAP_COUNT_KEY);
      localStorage.removeItem(GUEST_SESSIONS_KEY);
      localStorage.removeItem(GUEST_MESSAGES_KEY);
      localStorage.removeItem(GUEST_FLASHCARDS_KEY);
      localStorage.removeItem(GUEST_MINDMAPS_KEY);
      localStorage.removeItem(GUEST_QUIZZES_KEY);
      
      // Also remove any dynamic guest keys (like individual flashcards)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('guest_') || key.startsWith('flashcard_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing guest data:', error);
    }
  }, []);

  // Load guest message count from localStorage
  useEffect(() => {
    if (isGuest) {
      try {
        const savedCount = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
        if (savedCount) {
          setGuestMessageCount(parseInt(savedCount, 10));
        }
        const savedMindmapCount = localStorage.getItem(GUEST_MINDMAP_COUNT_KEY);
        if (savedMindmapCount) {
          setGuestMindmapCount(parseInt(savedMindmapCount, 10));
        }
        localStorage.setItem(GUEST_FLAG_KEY, 'true');
      } catch (error) {
        console.error('Error loading guest counts:', error);
      }
    } else {
      // Clear all guest data when user logs in
      clearGuestData();
      setGuestMessageCount(0);
      setGuestMindmapCount(0);
      setShowLoginPopup(false);
    }
  }, [isGuest, clearGuestData]);

  // Save guest message count to localStorage
  useEffect(() => {
    if (isGuest) {
      try {
        localStorage.setItem(GUEST_MESSAGE_COUNT_KEY, guestMessageCount.toString());
      } catch (error) {
        console.error('Error saving guest message count:', error);
      }
    }
  }, [guestMessageCount, isGuest]);

  // Save guest mindmap count to localStorage
  useEffect(() => {
    if (isGuest) {
      try {
        localStorage.setItem(GUEST_MINDMAP_COUNT_KEY, guestMindmapCount.toString());
      } catch (error) {
        console.error('Error saving guest mindmap count:', error);
      }
    }
  }, [guestMindmapCount, isGuest]);

  // Check if should show login popup (after 4 messages or 2 mindmaps)
  useEffect(() => {
    if (isGuest && (guestMessageCount >= 4 || guestMindmapCount >= 2) && !showLoginPopup) {
      setShowLoginPopup(true);
    }
  }, [guestMessageCount, guestMindmapCount, isGuest, showLoginPopup]);

  const incrementGuestMessageCount = useCallback(() => {
    if (isGuest) {
      setGuestMessageCount(prev => prev + 1);
    }
  }, [isGuest]);

  const resetGuestMessageCount = useCallback(() => {
    setGuestMessageCount(0);
    try {
      localStorage.removeItem(GUEST_MESSAGE_COUNT_KEY);
    } catch (error) {
      console.error('Error resetting guest message count:', error);
    }
  }, []);

  const incrementGuestMindmapCount = useCallback(() => {
    if (isGuest) {
      setGuestMindmapCount(prev => prev + 1);
    }
  }, [isGuest]);

  const resetGuestMindmapCount = useCallback(() => {
    setGuestMindmapCount(0);
    try {
      localStorage.removeItem(GUEST_MINDMAP_COUNT_KEY);
    } catch (error) {
      console.error('Error resetting guest mindmap count:', error);
    }
  }, []);

  const saveGuestData = useCallback((key: string, data: unknown) => {
    if (isGuest) {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving guest data:', error);
      }
    }
  }, [isGuest]);

  const loadGuestData = useCallback((key: string) => {
    if (isGuest) {
      try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Error loading guest data:', error);
        return null;
      }
    }
    return null;
  }, [isGuest]);

  const removeGuestData = useCallback((key: string) => {
    if (isGuest) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing guest data:', error);
      }
    }
  }, [isGuest]);

  const value: GuestContextType = {
    isGuest,
    guestMessageCount,
    incrementGuestMessageCount,
    resetGuestMessageCount,
    guestMindmapCount,
    incrementGuestMindmapCount,
    resetGuestMindmapCount,
    showLoginPopup,
    setShowLoginPopup,
    clearGuestData,
    saveGuestData,
    loadGuestData,
    removeGuestData,
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};
