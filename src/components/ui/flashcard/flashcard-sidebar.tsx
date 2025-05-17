'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, FolderIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FlashCardFolder, useFlashCards } from '@/contexts/FlashCardContext';

export function FlashCardSidebar() {
  const { 
    flashCards, 
    folders,
    setFlashCards,
    setFolders, 
    deleteFlashCard,
    deleteFolder,
    getFolderCards,
    getCurrentFolder,
    setCurrentFolder
  } = useFlashCards();

  const [error, setError] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch flash cards
        const cardsResponse = await fetch('/api/flashcard');
        if (!cardsResponse.ok) {
          const errorData = await cardsResponse.json();
          throw new Error(errorData.error || 'Failed to fetch flash cards');
        }
        const cardsData = await cardsResponse.json();
        setFlashCards(cardsData.flashCards);
        
        // Fetch folders
        const foldersResponse = await fetch('/api/flashcard/folder');
        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          setFolders(foldersData.folders);
        }

        // Set current ID from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        setCurrentId(urlParams.get('id'));
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flash cards');
      }
    };

    fetchData();
  }, [setFlashCards, setFolders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleSelectFolder = (folderId: string) => {
    setCurrentFolder(folderId);
    toggleFolder(folderId);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation
    e.stopPropagation(); // Prevent triggering the parent button click
    try {
      await deleteFlashCard(id);
      
      // If we deleted the current card, redirect to the main page
      if (id === currentId) {
        window.location.href = '/flashcard';
      }
    } catch (error) {
      console.error('Error deleting flash card:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete flash card');
    }
  };

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this folder? The flashcards will not be deleted.')) {
      try {
        await deleteFolder(folderId);
      } catch (error) {
        console.error('Error deleting folder:', error);
        setError('Failed to delete folder');
      }
    }
  };

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  // Get cards that are not in any folder
  const getStandaloneCards = () => {
    const allFolderCardIds = folders.flatMap(folder => folder.cardIds);
    return flashCards.filter(card => card.id && !allFolderCardIds.includes(card.id));
  };

  return (
    <aside className="h-screen bg-muted border-r border-border flex flex-col w-72">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <span className="font-semibold text-foreground">Flash Card Library</span>
      </div>
      
      <ScrollArea className="flex-1">
        {flashCards.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            Your flash cards will appear here
          </div>
        ) : (
          <div className="py-2">
            {/* Render folders */}
            {folders.length > 0 && (
              <div className="mb-2">
                {folders.map((folder) => (
                  <div key={folder.id} className="mb-1">
                    <div className="flex items-center group">
                      <button 
                        onClick={() => handleSelectFolder(folder.id)}
                        className="flex items-center flex-1 px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        {expandedFolders[folder.id] ? (
                          <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
                        )}
                        <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span className="max-w-[100px] truncate">{folder.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {folder.cardIds.length}
                        </span>
                      </button>
                      <div
                        role="button"
                        className="opacity-80 hover:opacity-100 px-2"
                        onClick={(e) => handleDeleteFolder(folder.id, e)}
                        title="Delete folder"
                      >
                        <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                      </div>
                    </div>
                    
                    {/* Render cards in folder if expanded */}
                    {expandedFolders[folder.id] && (
                      <div className="ml-4 pl-2 border-l border-border">
                        {getFolderCards(folder.id).map(card => (
                          <div key={card.id} className="group relative">
                            <Link
                              href={`/flashcard?id=${card.id}`}
                              className={cn(
                                'flex items-center w-full px-3 py-1.5 text-sm hover:bg-accent/50 transition-colors',
                                card.id === currentId && 'bg-accent text-accent-foreground'
                              )}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{card.term}</div>
                                {card.translation && (
                                  <div className="text-xs text-muted-foreground truncate">
                                    {card.translation}
                                  </div>
                                )}
                              </div>
                              <div
                                role="button"
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                                onClick={(e) => card.id && handleDelete(card.id, e)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive hover:text-destructive/80" />
                              </div>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Render standalone cards */}
            <div className="space-y-1">
              {getStandaloneCards().map((card) => (
                <div key={card.id} className="group relative">
                  <Link
                    href={`/flashcard?id=${card.id}`}
                    className={cn(
                      'flex items-center w-full px-4 py-2 text-sm hover:opacity-80 transition-opacity',
                      card.id === currentId && 'bg-white/5'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{card.term}</div>
                      {card.translation && (
                        <div className="text-sm text-muted-foreground truncate">
                          {card.translation}
                        </div>
                      )}
                    </div>
                    <div
                      role="button"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={(e) => card.id && handleDelete(card.id, e)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
