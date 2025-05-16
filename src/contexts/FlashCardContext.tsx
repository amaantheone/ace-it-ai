'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { FlashCardData } from '@/components/ui/flashcard/flash-card';

interface FlashCardContextType {
  flashCards: FlashCardData[];
  setFlashCards: (cards: FlashCardData[]) => void;
  addFlashCard: (card: FlashCardData) => void;
  updateFlashCard: (updatedCard: FlashCardData) => void;
  deleteFlashCard: (id: string) => void;
}

const FlashCardContext = createContext<FlashCardContextType | undefined>(undefined);

export function FlashCardProvider({ children }: { children: React.ReactNode }) {
  const [flashCards, setFlashCards] = useState<FlashCardData[]>([]);

  const addFlashCard = useCallback((card: FlashCardData) => {
    setFlashCards(prev => [card, ...prev]);
  }, []);

  const updateFlashCard = useCallback((updatedCard: FlashCardData) => {
    setFlashCards(prev =>
      prev.map(card => (card.id === updatedCard.id ? updatedCard : card))
    );
  }, []);

  const deleteFlashCard = useCallback((id: string) => {
    setFlashCards(prev => prev.filter(card => card.id !== id));
  }, []);

  return (
    <FlashCardContext.Provider
      value={{
        flashCards,
        setFlashCards,
        addFlashCard,
        updateFlashCard,
        deleteFlashCard,
      }}
    >
      {children}
    </FlashCardContext.Provider>
  );
}

export function useFlashCards() {
  const context = useContext(FlashCardContext);
  if (!context) {
    throw new Error('useFlashCards must be used within a FlashCardProvider');
  }
  return context;
}
