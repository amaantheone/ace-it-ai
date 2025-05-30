'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, FolderIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlashCards } from '@/contexts/FlashCardContext';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useFlashCardData, getStandaloneCards, handleDragStart, handleDragEnd } from '@/utils/flashCardFunctions/sidebarHelpers';
import type { FlashCardData } from '@/components/ui/flashcard/flash-card';

export function FlashCardSidebar() {
  const { 
    flashCards, 
    folders,
    setFlashCards,
    setFolders, 
    deleteFlashCard,
    getFolderCards,
    setCurrentFolder,
    addCardToFolder
  } = useFlashCards();

  const [error, setError] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const menuButtonRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Drag and drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Right-click context menu for cards
  const [cardMenuOpen, setCardMenuOpen] = useState<string | null>(null);
  const [cardMenuAnchor, setCardMenuAnchor] = useState<HTMLDivElement | null>(null);

  // Move to folder submenu state
  const [moveCardId, setMoveCardId] = useState<string | null>(null);

  // Fetch flash card and folder data on mount
  useFlashCardData(setFlashCards, setFolders, setError, setCurrentId);

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
    const handleClick = () => {
      setMenuOpen(null);
    };
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [menuOpen]);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FlashCardData[] | null>(null);
  const [searching, setSearching] = useState(false);

  // --- SEARCH LOGIC ---
  // Live search effect with debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchQuery.trim();
      if (!query) {
        setSearchResults(null);
        setSearching(false);
        return;
      }
      setSearching(true);
      let results: FlashCardData[] = [];
      if (query.startsWith('#')) {
        // Tag search (remove #, case-insensitive, partial match)
        const tagQuery = query.slice(1).toLowerCase();
        results = flashCards.filter(card =>
          card.tag && card.tag.toLowerCase().includes(tagQuery)
        );
      } else {
        // Term search (case-insensitive, partial match)
        const termQuery = query.toLowerCase();
        results = flashCards.filter(card =>
          card.term && card.term.toLowerCase().includes(termQuery)
        );
      }
      setSearchResults(results);
    }, 200); // 200ms debounce
    return () => clearTimeout(handler);
  }, [searchQuery, flashCards]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearching(false);
  };

  // Keyboard navigation for search results
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  useEffect(() => {
    setSelectedIndex(-1); // Reset selection on new search
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchResults || searchResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      const card = searchResults[selectedIndex];
      if (card) {
        window.location.href = `/flashcard?id=${card.id}`;
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
  // Filter out cards with undefined id, then cast to FlashCardData (with id: string)
  const validFlashCards = flashCards.filter((card): card is FlashCardData => typeof card.id === 'string' && !!card.id);
  // Patch: getStandaloneCards expects {id: string}[] so we map to objects with guaranteed string id
  const idOnlyCards = validFlashCards.map(card => ({ id: card.id! }));
  const standaloneIds = getStandaloneCards(folders, idOnlyCards).map(card => card.id);
  const standaloneCards = validFlashCards.filter(card => card.id && standaloneIds.includes(card.id));

  // Drag and drop: show folder icon and name as drag image
  const handleDrag = (e: React.DragEvent, cardId: string, cardTerm: string) => {
    const dragIcon = handleDragStart(setDraggedCardId, cardId, cardTerm);
    e.dataTransfer.setDragImage(dragIcon, 10, 10);
  };

  const handleDropOnFolder = async (folderId: string) => {
    if (draggedCardId) {
      // Remove card from all folders first
      setFolders(prev => prev.map(f => ({
        ...f,
        cardIds: f.cardIds.filter(id => id !== draggedCardId)
      })));
      // Add to new folder if not already present
      await addCardToFolder(draggedCardId, folderId);
      setDraggedCardId(null);
    }
  };

  return (
    <aside className="h-screen bg-muted border-r border-border flex flex-col w-72">
      <div className="flex items-center justify-between p-4 border-b border-border relative">
        <span className="font-semibold text-foreground">Flash Card Library</span>
      </div>
      {/* Search input */}
      <form onSubmit={e => e.preventDefault()} className="flex gap-2 px-4 pt-2 pb-1 items-center">
        <input
          placeholder="🔎 term or #tag"
          aria-label="Search flashcards or tag"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8 text-sm w-36 min-w-0 flex-shrink rounded border border-border bg-background text-foreground px-2"
        />
        {searching && (
          <button type="button" className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground" onClick={handleClearSearch}>
            Clear
          </button>
        )}
      </form>
      {/* Card/folder summary below heading and above divider */}
      <div className="px-4 pb-2 pt-1 text-xs text-muted-foreground">
        {flashCards.length} cards in {folders.length} folders
      </div>
      <div className="border-b border-border" />
      
      <ScrollArea className="flex-1">
        {searching ? (
          <div className="py-2">
            <div className="mb-2 font-semibold text-sm text-foreground">Search Results</div>
            {searchResults && searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((card, idx) => {
                  // Determine if this is a tag or term match
                  const isTagSearch = searchQuery.trim().startsWith('#');
                  const query = isTagSearch ? searchQuery.trim().slice(1).toLowerCase() : searchQuery.trim().toLowerCase();
                  // Highlight match helper
                  const highlight = (text: string, match: string) => {
                    if (!match) return text;
                    const idx = text.toLowerCase().indexOf(match);
                    if (idx === -1) return text;
                    return <>{text.slice(0, idx)}<span className="bg-primary/20 font-bold rounded px-0.5">{text.slice(idx, idx + match.length)}</span>{text.slice(idx + match.length)}</>;
                  };
                  return (
                    // highlight selected result with ring
                    <div key={card.id} className={cn("group relative", (selectedIndex === idx ? 'ring-2 ring-primary rounded' : ''))}>
                      <Link
                        href={`/flashcard?id=${card.id}`}
                        className={cn(
                          'flex items-center w-full px-4 py-2 text-sm hover:opacity-80 transition-opacity',
                          card.id === currentId && 'bg-white/5'
                        )}
                        tabIndex={-1}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {isTagSearch
                              ? card.term
                              : highlight(card.term, query)
                            }
                          </div>
                          {card.translation && (
                            <div className="text-sm text-muted-foreground truncate">
                              {card.translation}
                            </div>
                          )}
                          {card.tag && (
                            <div className="text-xs text-primary/80 truncate mt-0.5">
                              {isTagSearch
                                ? highlight(card.tag, query)
                                : `Tag: ${card.tag}`
                              }
                            </div>
                          )}
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-sm text-muted-foreground">
                No flashcards found.<br />
                <span className="text-xs">Try a different search or <button className="underline text-primary" onClick={handleClearSearch}>clear</button> the search.</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {folders.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No folders yet
              </div>
            ) : (
              <div className="py-2">
                {/* Render folders */}
                <div className="mb-2">
                  {[...folders].reverse().map((folder) => (
                    <div key={folder.id} className="mb-1"
                      onDragOver={e => { e.preventDefault(); }}
                      onDrop={e => { e.preventDefault(); handleDropOnFolder(folder.id); }}
                    >
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
                              <span className="ml-2 text-xs text-muted-foreground">{Array.isArray(folder.cardIds) ? folder.cardIds.length : 0}</span>
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
                              onClick={() => {
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
                          {getFolderCards(folder.id).length === 0 ? (
                            <div className="text-xs text-muted-foreground italic py-1">No cards in this folder</div>
                          ) : (
                            getFolderCards(folder.id).map(card => (
                              <div key={card.id} className={cn("group relative", draggedCardId === card.id ? "opacity-60 border border-primary bg-accent" : "")}
                                draggable
                                onDragStart={e => handleDrag(e, card.id!, card.term)}
                                onDragEnd={() => handleDragEnd(setDraggedCardId)}
                              >
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
                                    {card.tag && (
                                      <div className="text-xs text-primary/80 truncate mt-0.5">Tag: {card.tag}</div>
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
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Render standalone cards */}
                {standaloneCards.length > 0 && (
                  <div className="space-y-1">
                    {standaloneCards.map(card => (
                      <div key={card.id} className={cn("group relative", draggedCardId === card.id ? "opacity-60 border border-primary bg-accent" : "")}
                        draggable
                        onDragStart={e => handleDrag(e, card.id!, card.term || "")}
                        onDragEnd={() => handleDragEnd(setDraggedCardId)}
                        onContextMenu={e => {
                          e.preventDefault();
                          setCardMenuOpen(card.id || null);
                          setCardMenuAnchor(e.currentTarget);
                        }}
                      >
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
                            {card.tag && (
                              <div className="text-xs text-primary/80 truncate mt-0.5">Tag: {card.tag}</div>
                            )}
                          </div>
                          <div
                            role="button"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                            onClick={e => card.id && handleDelete(card.id, e)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          </div>
                        </Link>

                        {/* Card context menu */}
                        {cardMenuOpen === card.id && cardMenuAnchor && (
                          <div
                            className="absolute left-32 top-2 z-50 bg-popover border border-border rounded shadow-lg flex flex-col min-w-[120px]"
                            style={{ left: cardMenuAnchor.getBoundingClientRect().left, top: cardMenuAnchor.getBoundingClientRect().top }}
                            onClick={e => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                              onClick={async () => {
                                setCardMenuOpen(null);
                                // Open move to folder submenu
                                setMoveCardId(card.id!);
                              }}
                            >
                              Move to Folder
                            </button>
                            <button
                              type="button"
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive"
                              onClick={e => card.id && handleDelete(card.id, e)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
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

      {/* Move to folder submenu */}
      {moveCardId && (
        <div className="fixed z-50 bg-popover border border-border rounded shadow-lg flex flex-col min-w-[140px] p-2">
          <div className="text-xs mb-2">Move to folder:</div>
          {folders.map(folder => (
            <button
              key={folder.id}
              className="text-left px-2 py-1 hover:bg-accent rounded"
              onClick={async () => {
                await addCardToFolder(moveCardId, folder.id);
                setMoveCardId(null);
              }}
            >
              {folder.name}
            </button>
          ))}
          <button className="text-xs text-muted-foreground mt-2" onClick={() => setMoveCardId(null)}>Cancel</button>
        </div>
      )}
    </aside>
  );
}
