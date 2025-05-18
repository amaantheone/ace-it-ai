'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, FolderIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlashCards } from '@/contexts/FlashCardContext';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export function FlashCardSidebar() {
  const { 
    flashCards, 
    folders,
    setFlashCards,
    setFolders, 
    deleteFlashCard,
    deleteFolder,
    getFolderCards,
    setCurrentFolder
  } = useFlashCards();
  const router = useRouter();

  const [error, setError] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const menuButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Close menu on click outside
  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      setMenuOpen(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menuOpen]);

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
                    <div
                      className="flex items-center group relative select-none"
                      onContextMenu={e => {
                        e.preventDefault();
                        setMenuOpen(folder.id);
                      }}
                      ref={el => { menuButtonRefs.current[folder.id] = el; }}
                    >
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
                        {editingFolderId === folder.id ? (
                          <input
                            className="w-48 max-w-full truncate border rounded px-2 py-1 text-sm bg-background"
                            autoFocus
                            defaultValue={folder.name}
                            onBlur={async e => {
                              const newName = e.target.value.trim();
                              if (newName && newName !== folder.name) {
                                try {
                                  await fetch(`/api/flashcard/folder/${folder.id}`, {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ name: newName }),
                                  });
                                  await setFolders(folders.map(f => f.id === folder.id ? { ...f, name: newName } : f));
                                } finally {
                                  setEditingFolderId(null);
                                }
                              } else {
                                setEditingFolderId(null);
                              }
                            }}
                            onKeyDown={async e => {
                              if (e.key === 'Enter') {
                                const newName = (e.target as HTMLInputElement).value.trim();
                                if (newName && newName !== folder.name) {
                                  try {
                                    await fetch(`/api/flashcard/folder/${folder.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ name: newName }),
                                    });
                                    await setFolders(folders.map(f => f.id === folder.id ? { ...f, name: newName } : f));
                                  } finally {
                                    setEditingFolderId(null);
                                  }
                                } else {
                                  setEditingFolderId(null);
                                }
                              } else if (e.key === 'Escape') {
                                setEditingFolderId(null);
                              }
                            }}
                          />
                        ) : (
                          <>
                            <span className="max-w-[100px] truncate">{folder.name}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{folder.cardIds.length}</span>
                          </>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                          {folder.cardIds.length}
                        </span>
                      </button>
                      {/* Dropdown menu on right click */}
                      {menuOpen === folder.id && (
                        <div
                          className="absolute left-32 top-2 z-50 bg-popover border border-border rounded shadow-lg flex flex-col min-w-[100px]"
                          onClick={e => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-t"
                            onClick={() => {
                              setEditingFolderId(folder.id);
                              setMenuOpen(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent rounded-b text-destructive"
                            onClick={e => {
                              setMenuOpen(null);
                              setShowConfirm(folder.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
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

      {/* ConfirmDialog for folder deletion */}
      {showConfirm && (
        <ConfirmDialog
          open={!!showConfirm}
          title="Delete Folder?"
          description="Are you sure you want to delete this folder and all its flashcards? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={async () => {
            const folderId = showConfirm;
            setShowConfirm(null);
            if (folderId) {
              try {
                // Find all card ids in this folder
                const folder = folders.find(f => f.id === folderId);
                const cardIds = folder ? folder.cardIds.map(String) : [];
                const urlParams = new URLSearchParams(window.location.search);
                const currentId = urlParams.get('id');
                await fetch(`/api/flashcard/folder/${folderId}`, { method: 'DELETE' });
                setFolders(folders.filter(f => f.id !== folderId));
                // Remove all cards that were in this folder from local state
                if (folder) {
                  setFlashCards(flashCards.filter(card => !folder.cardIds.includes(card.id!)));
                }
                // If the currentId is in the deleted folder, redirect to /flashcard
                if (currentId && cardIds.includes(String(currentId))) {
                  window.location.href = '/flashcard';
                  return;
                } else if (!currentId) {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error deleting folder:', error);
                setError('Failed to delete folder');
              }
            }
          }}
          onCancel={() => setShowConfirm(null)}
        />
      )}
    </aside>
  );
}
