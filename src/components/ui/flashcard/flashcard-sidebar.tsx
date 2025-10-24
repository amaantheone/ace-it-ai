'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronDown, ChevronRight, FolderIcon, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlashCards } from '@/contexts/FlashCardContext';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useFlashCardData, getStandaloneCards } from '@/utils/flashCardFunctions/sidebarHelpers';
import type { FlashCardData } from '@/components/ui/flashcard/flash-card';

interface Folder {
  id: string;
  name: string;
  cardIds: string[];
}
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Additional drop zone for folders with cards
function FolderDropZone({ folderId, isOver }: { folderId: string; isOver: boolean }) {
  const { setNodeRef } = useDroppable({
    id: `${folderId}-dropzone`,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "min-h-[20px] transition-all duration-200",
        isOver && "bg-accent/30 rounded py-1"
      )}
    />
  );
}

// Draggable Card Component
function DraggableCard({ 
  card, 
  currentId, 
  handleDelete,
  isInFolder = false 
}: { 
  card: FlashCardData; 
  currentId: string | null; 
  handleDelete: (id: string, e: React.MouseEvent) => void;
  isInFolder?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes}
      className={cn(
        "group relative", 
        isDragging && "z-50 shadow-lg scale-105",
        "touch-manipulation" // Optimizes touch interactions
      )}
    >
      <div {...listeners} className="touch-none cursor-grab active:cursor-grabbing">
        <Link
          href={`/flashcard?id=${card.id}`}
          className={cn(
            'flex items-center w-full text-sm hover:bg-accent/50 transition-all duration-200',
            'min-h-[36px]', // Back to original smaller size
            isInFolder ? 'px-2 py-1' : 'px-3 py-2', // Back to original padding
            card.id === currentId && (isInFolder ? 'bg-accent text-accent-foreground' : 'bg-white/5'),
            'active:scale-[0.98]' // Subtle press feedback
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{card.term}</div>
            {card.translation && (
              <div className={cn(
                "text-muted-foreground truncate",
                isInFolder ? "text-xs" : "text-sm"
              )}>
                {card.translation}
              </div>
            )}
            {card.tag && (
              <div className="text-xs text-primary/80 truncate mt-0.5">Tag: {card.tag}</div>
            )}
          </div>
          <div
            role="button"
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity ml-2",
              "min-w-[36px] min-h-[36px] flex items-center justify-center", // Back to original size
              "hover:bg-accent/20 rounded-md" // Better visual feedback
            )}
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              if (card.id) {
                handleDelete(card.id, e);
              }
            }}
          >
            <Trash2 className={cn(
              "text-destructive hover:text-destructive/80",
              isInFolder ? "h-3 w-3" : "h-4 w-4" // Back to original sizes
            )} />
          </div>
        </Link>
      </div>
    </div>
  );
}

// Droppable Folder Component  
function DroppableFolder({
  folder,
  expandedFolders,
  editingFolderId,
  menuOpen,
  currentId,
  getFolderCards,
  handleSelectFolder,
  setMenuOpen,
  setEditingFolderId,
  setShowConfirm,
  setFolders,
  folders,
  handleDelete,
  menuButtonRefs,
  isOver,
}: {
  folder: Folder;
  expandedFolders: Record<string, boolean>;
  editingFolderId: string | null;
  menuOpen: string | null;
  currentId: string | null;
  getFolderCards: (id: string) => FlashCardData[];
  handleSelectFolder: (id: string) => void;
  setMenuOpen: (id: string | null) => void;
  setEditingFolderId: (id: string | null) => void;
  setShowConfirm: (id: string | null) => void;
  setFolders: React.Dispatch<React.SetStateAction<Folder[]>>;
  folders: Folder[];
  handleDelete: (id: string, e: React.MouseEvent) => void;
  menuButtonRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  isOver?: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: folder.id,
  });

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "mb-1 transition-all duration-200 rounded-md",
        isOver && "bg-accent/30 border-2 border-primary/60 shadow-md transform scale-[1.02]" // Enhanced drop feedback
      )}
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
          className={cn(
            "flex items-center flex-1 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-all duration-200",
            "min-h-[40px]", // Back to original folder button size
            "active:scale-[0.98]" // Press feedback
          )}
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
      
      {/* Render cards in folder if expanded - This area should also be droppable */}
      {expandedFolders[folder.id] && (
        <div className={cn(
          "ml-4 pl-2 border-l border-border relative",
          // Add visual feedback when dragging over the expanded folder area
          isOver && "bg-accent/20 rounded-r-md"
        )}>
          {getFolderCards(folder.id).length === 0 ? (
            <div className={cn(
              "text-xs text-muted-foreground italic py-3 px-2 rounded",
              // Enhanced empty folder drop zone styling
              isOver && "bg-accent/30 border-2 border-dashed border-primary/40"
            )}>
              No cards in this folder
            </div>
          ) : (
            <>
              <SortableContext 
                items={getFolderCards(folder.id).map(card => card.id!)} 
                strategy={verticalListSortingStrategy}
              >
                {getFolderCards(folder.id).map(card => (
                  <DraggableCard 
                    key={card.id} 
                    card={card} 
                    currentId={currentId}
                    handleDelete={handleDelete}
                    isInFolder={true}
                  />
                ))}
              </SortableContext>
              {/* Additional droppable area at the bottom of folder when it has cards */}
              <FolderDropZone folderId={folder.id} isOver={isOver || false} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function FlashCardSidebar() {
  const { 
    flashCards, 
    folders,
    setFlashCards,
    setFolders, 
    deleteFlashCard,
    deleteFolder,
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

  // @dnd-kit state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // Long press delay for mobile
        tolerance: 5,
      },
    }),
  );

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

  // @dnd-kit drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Add haptic feedback on mobile devices
    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Short vibration for drag start
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      const overId = over.id as string;
      
      // Check if we're directly over a folder
      let targetFolderId = folders.find(f => f.id === overId)?.id;
      
      // Check if we're over a folder dropzone
      if (!targetFolderId && overId.endsWith('-dropzone')) {
        targetFolderId = overId.replace('-dropzone', '');
      }
      
      // If not directly over a folder, check if we're over a card that's in a folder
      if (!targetFolderId) {
        const cardFolder = folders.find(f => f.cardIds.includes(overId));
        if (cardFolder) {
          targetFolderId = cardFolder.id;
        }
      }
      
      setOverId(targetFolderId || overId);
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setOverId(null);

    if (!over || !active) {
      // Light haptic feedback for unsuccessful drop
      if ('vibrate' in navigator) {
        navigator.vibrate(25);
      }
      return;
    }

    const cardId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping on a folder directly
    let targetFolder = folders.find(f => f.id === overId);
    
    // Check if we're dropping on a folder dropzone
    if (!targetFolder && overId.endsWith('-dropzone')) {
      const folderId = overId.replace('-dropzone', '');
      targetFolder = folders.find(f => f.id === folderId);
    }
    
    // If not dropping directly on a folder, check if we're dropping on a card that's in a folder
    if (!targetFolder) {
      // Find which folder the drop target card belongs to
      targetFolder = folders.find(f => f.cardIds.includes(overId));
    }

    if (targetFolder) {
      try {
        // Success haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([50, 50, 100]); // Success pattern
        }
        
        // Remove card from all folders first
        setFolders(prev => prev.map(f => ({
          ...f,
          cardIds: f.cardIds.filter(id => id !== cardId)
        })));
        
        // Add to new folder
        await addCardToFolder(cardId, targetFolder.id);
      } catch (error) {
        console.error('Error moving card:', error);
        setError('Failed to move card to folder');
        
        // Error haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 100, 100]); // Error pattern
        }
      }
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
  const validFlashCards = flashCards.filter((card): card is FlashCardData => typeof card.id === 'string' && !!card.id);
  const idOnlyCards = validFlashCards.map(card => ({ id: card.id! }));
  const standaloneIds = getStandaloneCards(folders, idOnlyCards).map(card => card.id);
  const standaloneCards = validFlashCards.filter(card => card.id && standaloneIds.includes(card.id));

  // Get the active card for drag overlay
  const activeCard = activeId ? validFlashCards.find(card => card.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
                    const isTagSearch = searchQuery.trim().startsWith('#');
                    const query = isTagSearch ? searchQuery.trim().slice(1).toLowerCase() : searchQuery.trim().toLowerCase();
                    const highlight = (text: string, match: string) => {
                      if (!match) return text;
                      const idx = text.toLowerCase().indexOf(match);
                      if (idx === -1) return text;
                      return <>{text.slice(0, idx)}<span className="bg-primary/20 font-bold rounded px-0.5">{text.slice(idx, idx + match.length)}</span>{text.slice(idx + match.length)}</>;
                    };
                    return (
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
                      <DroppableFolder
                        key={folder.id}
                        folder={folder}
                        expandedFolders={expandedFolders}
                        editingFolderId={editingFolderId}
                        menuOpen={menuOpen}
                        currentId={currentId}
                        getFolderCards={getFolderCards}
                        handleSelectFolder={handleSelectFolder}
                        setMenuOpen={setMenuOpen}
                        setEditingFolderId={setEditingFolderId}
                        setShowConfirm={setShowConfirm}
                        setFolders={setFolders}
                        folders={folders}
                        handleDelete={handleDelete}
                        menuButtonRefs={menuButtonRefs}
                        isOver={overId === folder.id}
                      />
                    ))}
                  </div>
                  
                  {/* Render standalone cards */}
                  {standaloneCards.length > 0 && (
                    <div className="space-y-1">
                      <SortableContext 
                        items={standaloneCards.map(card => card.id!)} 
                        strategy={verticalListSortingStrategy}
                      >
                        {standaloneCards.map(card => (
                          <div key={card.id} 
                            onContextMenu={e => {
                              e.preventDefault();
                              setCardMenuOpen(card.id || null);
                              setCardMenuAnchor(e.currentTarget);
                            }}
                          >
                            <DraggableCard 
                              card={card} 
                              currentId={currentId}
                              handleDelete={handleDelete}
                              isInFolder={false}
                            />

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
                      </SortableContext>
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
                  const folder = folders.find(f => f.id === folderId);
                  const urlParams = new URLSearchParams(window.location.search);
                  const currentId = urlParams.get('id');
                  const isCurrentCardInFolder = currentId && folder?.cardIds.includes(currentId);
                  
                  await deleteFolder(folderId);
                  
                  if (isCurrentCardInFolder) {
                    window.location.href = '/flashcard';
                  } else {
                    window.location.reload();
                  }
                } catch (error) {
                  console.error('Error deleting folder:', error);
                  setError(error instanceof Error ? error.message : 'Failed to delete folder');
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

        {/* Drag Overlay */}
        <DragOverlay>
          {activeCard ? (
            <div className={cn(
              "bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-xl",
              "flex items-center min-h-[48px]",
              "border border-primary/20",
              "transform scale-105", // Slightly larger when dragging
              "backdrop-blur-sm bg-primary/90" // Semi-transparent for better visual feedback
            )}>
              <FileText className="h-5 w-5 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{activeCard.term}</div>
                {activeCard.translation && (
                  <div className="text-xs text-primary-foreground/80 truncate">
                    {activeCard.translation}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </aside>
    </DndContext>
  );
}