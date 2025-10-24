'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { FlashCardData } from '@/components/ui/flashcard/flash-card';

// Define the folder structure
export interface FlashCardFolder {
  id: string;
  name: string;
  cardIds: string[];
}

interface FlashCardContextType {
  flashCards: FlashCardData[];
  folders: FlashCardFolder[];
  setFlashCards: React.Dispatch<React.SetStateAction<FlashCardData[]>>;
  setFolders: React.Dispatch<React.SetStateAction<FlashCardFolder[]>>;
  addFlashCard: (card: FlashCardData, folderId?: string) => Promise<void>;
  updateFlashCard: (updatedCard: FlashCardData) => Promise<void>;
  deleteFlashCard: (id: string) => Promise<void>;
  addFolder: (name: string) => Promise<FlashCardFolder>;
  updateFolder: (folderId: string, name: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  addCardToFolder: (cardId: string, folderId: string) => Promise<void>;
  removeCardFromFolder: (cardId: string, folderId: string) => Promise<void>;
  getFolderCards: (folderId: string) => FlashCardData[];
  getCurrentFolder: () => string | null;
  setCurrentFolder: (folderId: string | null) => void;
}

const FlashCardContext = createContext<FlashCardContextType | undefined>(undefined);

export function FlashCardProvider({ children }: { children: React.ReactNode }) {
  const [flashCards, setFlashCards] = useState<FlashCardData[]>([]);
  const [folders, setFolders] = useState<FlashCardFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);

  const addFlashCard = useCallback(async (card: FlashCardData, folderId?: string) => {
    // Add card to local state
    setFlashCards(prev => [card, ...prev]);
    
    // If a folder ID is provided, add the card to that folder both in state and database
    if (folderId && card.id) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === folderId 
            ? { ...folder, cardIds: [card.id!, ...folder.cardIds] } 
            : folder
        )
      );
      
      // Update the database relationship if the card already exists
      try {
        await fetch(`/api/flashcard/folder/${folderId}/card/${card.id}`, {
          method: 'PUT',
        });
      } catch (error) {
        console.error('Error adding card to folder in database:', error);
      }
    }
  }, []);

  const updateFlashCard = useCallback(async (updatedCard: FlashCardData) => {
    // Update local state
    setFlashCards(prev =>
      prev.map(card => (card.id === updatedCard.id ? updatedCard : card))
    );
    
    // Update in database if the card has an ID
    if (updatedCard.id) {
      try {
        // We'll implement this API endpoint in a future iteration
        await fetch(`/api/flashcard/${updatedCard.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCard),
        });
      } catch (error) {
        console.error('Error updating card in database:', error);
      }
    }
  }, []);

  const deleteFlashCard = useCallback(async (id: string) => {
    // Remove from the main list
    setFlashCards(prev => prev.filter(card => card.id !== id));
    
    // Remove from any folders
    setFolders(prev => 
      prev.map(folder => ({
        ...folder,
        cardIds: folder.cardIds.filter(cardId => cardId !== id)
      }))
    );
    
    // Delete from database
    try {
      await fetch(`/api/flashcard/${id}/delete`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting card from database:', error);
    }
  }, []);

  const addFolder = useCallback(async (name: string): Promise<FlashCardFolder> => {
    try {
      // Save folder to database
      const response = await fetch('/api/flashcard/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create folder');
      }
      
      const data = await response.json();
      const newFolder: FlashCardFolder = data.folder;
      
      // Update local state
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (error) {
      console.error('Error creating folder:', error);
      // Fallback to local-only folder if API call fails
      const localFolder: FlashCardFolder = {
        id: `folder_${Date.now()}`,
        name,
        cardIds: []
      };
      
      setFolders(prev => [...prev, localFolder]);
      return localFolder;
    }
  }, []);

  const updateFolder = useCallback(async (folderId: string, name: string) => {
    // Update local state first for immediate UI feedback
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId ? { ...folder, name } : folder
      )
    );
    
    // Update in database if it's a database folder (not a local folder)
    if (!folderId.startsWith('folder_')) {
      try {
        await fetch(`/api/flashcard/folder/${folderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name }),
        });
      } catch (error) {
        console.error('Error updating folder in database:', error);
      }
    }
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    // Store the folder data for potential rollback
    const folderToDelete = folders.find(f => f.id === folderId);
    const cardsToDelete = folderToDelete ? folderToDelete.cardIds : [];
    
    // Update local state first for immediate UI feedback
    setFolders(prev => prev.filter(folder => folder.id !== folderId));
    
    // Remove flashcards that were in this folder from local state
    setFlashCards(prev => prev.filter(card => !cardsToDelete.includes(card.id!)));
    
    // If the deleted folder is the current folder, reset current folder
    if (currentFolder === folderId) {
      setCurrentFolder(null);
    }
    
    // Delete from database if it's a database folder (not a local folder)
    if (!folderId.startsWith('folder_')) {
      try {
        const response = await fetch(`/api/flashcard/folder/${folderId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to delete folder');
        }

        await response.json();
        
      } catch (error) {
        console.error('Error deleting folder from database:', error);
        
        // Revert the local state changes since the API call failed
        if (folderToDelete) {
          setFolders(prev => [...prev, folderToDelete]);
        }
        
        // Restore the deleted flashcards
        const cardsToRestore = flashCards.filter(card => cardsToDelete.includes(card.id!));
        setFlashCards(prev => [...prev, ...cardsToRestore]);
        
        // Re-throw the error so the caller can handle it
        throw error;
      }
    }
  }, [currentFolder, folders, flashCards]);

  const addCardToFolder = useCallback(async (cardId: string, folderId: string) => {
    // Update local state first for immediate UI feedback
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, cardIds: [...new Set([...folder.cardIds, cardId])] } 
          : folder
      )
    );
    
    // Update in database if it's a database folder (not a local folder)
    if (!folderId.startsWith('folder_')) {
      try {
        await fetch(`/api/flashcard/folder/${folderId}/card/${cardId}`, {
          method: 'PUT',
        });
      } catch (error) {
        console.error('Error adding card to folder in database:', error);
      }
    }
  }, []);

  const removeCardFromFolder = useCallback(async (cardId: string, folderId: string) => {
    // Update local state first for immediate UI feedback
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId 
          ? { ...folder, cardIds: folder.cardIds.filter(id => id !== cardId) } 
          : folder
      )
    );
    
    // Update in database if it's a database folder (not a local folder)
    if (!folderId.startsWith('folder_')) {
      try {
        await fetch(`/api/flashcard/folder/${folderId}/card/${cardId}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.error('Error removing card from folder in database:', error);
      }
    }
  }, []);

  const getFolderCards = useCallback((folderId: string): FlashCardData[] => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];
    
    return flashCards.filter(card => card.id && folder.cardIds.includes(card.id));
  }, [folders, flashCards]);

  const getCurrentFolder = useCallback(() => currentFolder, [currentFolder]);

  return (
    <FlashCardContext.Provider
      value={{
        flashCards,
        folders,
        setFlashCards,
        setFolders,
        addFlashCard,
        updateFlashCard,
        deleteFlashCard,
        addFolder,
        updateFolder,
        deleteFolder,
        addCardToFolder,
        removeCardFromFolder,
        getFolderCards,
        getCurrentFolder,
        setCurrentFolder,
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
