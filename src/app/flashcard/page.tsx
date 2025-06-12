'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PanelLeft, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { FlashCard, FlashCardData } from '@/components/ui/flashcard/flash-card';
import { FlashCardSidebar } from '@/components/ui/flashcard/flashcard-sidebar';
import { FlashCardProvider, useFlashCards } from '@/contexts/FlashCardContext';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { useGuest } from '@/contexts/GuestContext';
import { LoginPopup } from '@/components/ui/login-popup';
import { ThemeToggle } from '@/components/ui/theme-toggle';

function FlashCardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const {
    setFlashCards,
    setFolders,
    addFlashCard,
    updateFlashCard,
    deleteFlashCard,
  } = useFlashCards();
  const {
    isGuest,
    guestIndividualFlashcardCount,
    incrementGuestIndividualFlashcardCount,
    showFlashcardLoginPopup,
    setShowFlashcardLoginPopup
  } = useGuest();

  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCard, setCurrentCard] = useState<FlashCardData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkCardsGenerated, setBulkCardsGenerated] = useState(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cardsInFolder, setCardsInFolder] = useState<FlashCardData[]>([]);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // --- LocalStorage Caching Helpers ---
  const FLASHCARD_LIST_KEY = 'flashcard_list';
  const FLASHCARD_FOLDERS_KEY = 'flashcard_folders';
  const getFlashCardKey = (id: string) => `flashcard_${id}`;

  // Load flashcard list from localStorage
  const loadFlashCardListFromCache = useCallback((): FlashCardData[] | null => {
    try {
      // For guests, prioritize guest_flashcards key, fallback to flashcard_list
      if (isGuest) {
        const guestCached = localStorage.getItem('guest_flashcards');
        if (guestCached) return JSON.parse(guestCached);
      }
      const cached = localStorage.getItem(FLASHCARD_LIST_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  }, [isGuest]);

  // Save flashcard list to localStorage
  const saveFlashCardListToCache = useCallback((list: FlashCardData[]) => {
    try {
      if (isGuest) {
        // For guests, save to guest_flashcards key
        localStorage.setItem('guest_flashcards', JSON.stringify(list));
      } else {
        // For authenticated users, save to flashcard_list key
        localStorage.setItem(FLASHCARD_LIST_KEY, JSON.stringify(list));
      }
    } catch {}
  }, [isGuest]);

  // Load folders from localStorage
  const loadFoldersFromCache = useCallback((): { id: string; name: string; cardIds: string[] }[] | null => {
    try {
      const cached = localStorage.getItem(FLASHCARD_FOLDERS_KEY);
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  }, []);

  // Save folders to localStorage
  const saveFoldersToCache = useCallback((folders: { id: string; name: string; cardIds: string[] }[]) => {
    try {
      localStorage.setItem(FLASHCARD_FOLDERS_KEY, JSON.stringify(folders));
    } catch {}
  }, []);

  // Load individual flashcard from localStorage
  const loadFlashCardFromCache = useCallback((id: string): FlashCardData | null => {
    try {
      const cached = localStorage.getItem(getFlashCardKey(id));
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  }, []);

  // Save individual flashcard to localStorage
  const saveFlashCardToCache = useCallback((id: string, data: FlashCardData) => {
    try {
      localStorage.setItem(getFlashCardKey(id), JSON.stringify(data));
    } catch {}
  }, []);

  // Remove individual flashcard from localStorage
  const removeFlashCardFromCache = useCallback((id: string) => {
    try {
      localStorage.removeItem(getFlashCardKey(id));
    } catch {}
  }, []);

  // Update flashcard list and folders fetching for guest/authenticated users
  useEffect(() => {
    if (isGuest) {
      // For guests, load from localStorage only
      const cachedList = loadFlashCardListFromCache();
      if (cachedList) setFlashCards(cachedList);
      const cachedFolders = loadFoldersFromCache();
      if (cachedFolders) setFolders(cachedFolders);
    } else {
      // For authenticated users, clear any guest data first, then load from API
      setFlashCards([]);
      setFolders([]);
      
      // Always update from API for authenticated users
      fetch('/api/flashcard')
        .then(res => res.json())
        .then(data => {
          setFlashCards(data.flashCards || []);
          saveFlashCardListToCache(data.flashCards || []);
        });
      fetch('/api/flashcard/folder')
        .then(res => res.json())
        .then(data => {
          setFolders(data.folders || []);
          saveFoldersToCache(data.folders || []);
        });
    }
  }, [isGuest, loadFlashCardListFromCache, saveFlashCardListToCache, loadFoldersFromCache, saveFoldersToCache, setFlashCards, setFolders]);

  // Update fetchCard to use cache and support guest mode
  const fetchCard = useCallback(async (id: string) => {
    // Try cache first
    const cached = loadFlashCardFromCache(id);
    if (cached) {
      setCurrentCard(cached);
      // If the card has a folderId, fetch all cards in that folder (from state or cache)
      if (cached.folderId && !isGuest) {
        const folder = (loadFoldersFromCache() || []).find(f => f.id === cached.folderId);
        if (folder) {
          const folderCards = (loadFlashCardListFromCache() || []).filter(card => folder.cardIds.includes(card.id!));
          setCardsInFolder(folderCards);
          const index = folderCards.findIndex((card: FlashCardData) => card.id === id);
          setCurrentIndex(index);
        }
      }
      return;
    }
    
    if (isGuest) {
      // For guests, only use localStorage - no API calls
      return;
    }
    
    // Fallback to API for authenticated users
    try {
      const response = await fetch(`/api/flashcard/${id}`);
      if (!response.ok) throw new Error('Failed to fetch flash card');
      const data = await response.json();
      setCurrentCard(data.flashCard);
      saveFlashCardToCache(id, data.flashCard);
      // If the card has a folderId, try to get folder cards from cache
      if (data.flashCard.folderId) {
        const folder = (loadFoldersFromCache() || []).find(f => f.id === data.flashCard.folderId);
        if (folder) {
          const folderCards = (loadFlashCardListFromCache() || []).filter(card => folder.cardIds.includes(card.id!));
          setCardsInFolder(folderCards);
          const index = folderCards.findIndex((card: FlashCardData) => card.id === id);
          setCurrentIndex(index);
        }
      }
    } catch (err) {
      console.error('Error fetching flash card:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch flash card');
    }
  }, [loadFlashCardFromCache, setCurrentCard, loadFoldersFromCache, loadFlashCardListFromCache, setCardsInFolder, setCurrentIndex, setError, saveFlashCardToCache, isGuest]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when a card is selected on mobile
  useEffect(() => {
    if (isMobileView && currentCard) {
      setIsSidebarOpen(false);
    }
  }, [currentCard, isMobileView]);

  // Fetch the specific card if an ID is provided in the URL
  useEffect(() => {
    const cardId = searchParams.get('id');
    if (cardId) {
      void fetchCard(cardId);
    }
  }, [searchParams, fetchCard]);

  const goToNextCard = () => {
    if (currentIndex < cardsInFolder.length - 1) {
      const prevCard = cardsInFolder[currentIndex + 1];
      router.push(`/flashcard?id=${prevCard.id}`);
    }
  };

  const goToPreviousCard = () => {
    if (currentIndex > 0) {
      const nextCard = cardsInFolder[currentIndex - 1];
      router.push(`/flashcard?id=${nextCard.id}`);
    }
  };

  const generateBulkFlashCards = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setIsLoading(true);
    setError('');
    setBulkCardsGenerated(0);
    try {
      let response;
      if (pdfFile) {
        const formData = new FormData();
        formData.append('topic', topic);
        formData.append('count', String(bulkCount));
        formData.append('createFolder', isGuest ? 'false' : 'true'); // No folders for guests
        formData.append('pdf', pdfFile);
        response = await fetch('/api/flashcard/bulk', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/x-ndjson' },
        });
      } else {
        response = await fetch('/api/flashcard/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/x-ndjson',
          },
          body: JSON.stringify({
            topic,
            count: bulkCount,
            createFolder: !isGuest // No folders for guests
          }),
        });
      }

      if (!response.ok || !response.body) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate flashcards');
      }

      let folder: { id: string; name: string; cardIds: string[] } | undefined;
      let folderAdded = false;
      let firstCard: FlashCardData | undefined;
      const cards: FlashCardData[] = [];
      const reader = response.body.getReader();
      let buffer = '';
      let cardsGenerated = 0;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += new TextDecoder().decode(value);
        const lines = buffer.split('\n');
        buffer = lines.pop()!; // last line may be incomplete
        for (const line of lines) {
          if (!line.trim()) continue;
          let data;
          try {
            data = JSON.parse(line);
          } catch {
            continue;
          }
          if (data.folder && !folderAdded && !isGuest) {
            folder = data.folder;
            setFolders(prev => [...prev, folder!]);
            folderAdded = true;
          }
          if (data.flashCard) {
            cards.push(data.flashCard);
            
            if (isGuest) {
              // For guests, save individual card to localStorage
              saveFlashCardToCache(data.flashCard.id, data.flashCard);
            } else {
              // For authenticated users, add to state immediately
              setFlashCards(prev => [...prev, data.flashCard]);
            }
            
            // If we have a folder, add this card's id to its cardIds (avoid duplicates)
            if (folder && data.flashCard.id && !isGuest) {
              setFolders(prev => prev.map(f =>
                f.id === folder!.id && !f.cardIds.includes(data.flashCard.id)
                  ? { ...f, cardIds: [...f.cardIds, data.flashCard.id] }
                  : f
              ));
            }
            cardsGenerated++;
            setBulkCardsGenerated(cardsGenerated);
            if (!firstCard) {
              firstCard = data.flashCard;
              setCurrentCard(firstCard ?? null);
              if (firstCard && firstCard.id) {
                router.push(`/flashcard?id=${firstCard.id}`);
              }
            }
          }
        }
      }
      
      // If no cards were generated
      if (cards.length === 0) {
        throw new Error('No flashcards were generated');
      }
      
      // For guests, save all generated cards to localStorage
      if (isGuest && cards.length > 0) {
        const existingCards = loadFlashCardListFromCache() || [];
        const updatedCards = [...cards, ...existingCards];
        saveFlashCardListToCache(updatedCards);
        // Also update the state to reflect the new cards
        setFlashCards(updatedCards);
      }
      
      setTopic('');
    } catch (err) {
      console.error('Error generating flashcards:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFlashCard = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    // Check guest limits for individual flashcards (limit reached at 4)
    if (isGuest) {
      const newCount = incrementGuestIndividualFlashcardCount();
      if (newCount >= 4) {
        setShowFlashcardLoginPopup(true);
        return;
      }
    }

    // Prevent bulk generation for guests
    if (isGuest && isBulk) {
      setShowFlashcardLoginPopup(true);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (isBulk) {
        // Handle bulk generation (only for authenticated users)
        await generateBulkFlashCards();
        return;
      }

      // Individual card generation logic
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate flashcard');
      }

      const data = await response.json();
      setCurrentCard(data.flashCard);
      
      if (isGuest) {
        // For guests, save to localStorage and update state
        saveFlashCardToCache(data.flashCard.id, data.flashCard);
        const existingCards = loadFlashCardListFromCache() || [];
        const updatedCards = [data.flashCard, ...existingCards];
        saveFlashCardListToCache(updatedCards);
        setFlashCards(updatedCards);
        
        // Increment guest individual flashcard count
        incrementGuestIndividualFlashcardCount();
      } else {
        // For authenticated users, use the existing logic
        await addFlashCard(data.flashCard);
        // Ensure 'Uncategorized' folder is in state and updated
        if (data.flashCard.folderId) {
          setFolders(prev => {
            // If folder already exists, add cardId if not present
            const exists = prev.find(f => f.id === data.flashCard.folderId);
            if (exists) {
              return prev.map(f =>
                f.id === data.flashCard.folderId && !f.cardIds.includes(data.flashCard.id)
                  ? { ...f, cardIds: [...f.cardIds, data.flashCard.id] }
                  : f
              );
            }
            // If folder does not exist, add it
            return [
              { id: data.flashCard.folderId, name: 'Uncategorized', cardIds: [data.flashCard.id] },
              ...prev,
            ];
          });
        }
      }
      
      setTopic(''); // Clear input after successful generation
      // Update the URL with the new card's id
      if (data.flashCard && data.flashCard.id) {
        router.push(`/flashcard?id=${data.flashCard.id}`);
      }
    } catch (err) {
      console.error('Error generating flashcard:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate flashcard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCard = async (updatedCard: FlashCardData) => {
    if (!currentCard?.id) {
      setError('Cannot edit unsaved card');
      return;
    }

    try {
      if (isGuest) {
        // For guests, update localStorage only
        setCurrentCard(updatedCard);
        updateFlashCard(updatedCard);
        if (updatedCard.id) {
          saveFlashCardToCache(updatedCard.id, updatedCard);
        }
        
        // Update the guest flashcards list
        const existingCards = loadFlashCardListFromCache() || [];
        const updatedCards = existingCards.map(card => 
          card.id === updatedCard.id ? updatedCard : card
        );
        saveFlashCardListToCache(updatedCards);
        setFlashCards(updatedCards);
      } else {
        // For authenticated users, update via API
        const response = await fetch(`/api/flashcard/${currentCard.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCard),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update flashcard');
        }

        const { flashCard } = await response.json();
        setCurrentCard(flashCard);
        updateFlashCard(flashCard);

        // Update URL if the ID has changed
        if (flashCard.id && flashCard.id !== currentCard.id) {
          router.push(`/flashcard?id=${flashCard.id}`);
        }
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to update flashcard');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      if (isGuest) {
        // For guests, remove from localStorage only
        deleteFlashCard(id);
        removeFlashCardFromCache(id);
        
        // Update the guest flashcards list
        const existingCards = loadFlashCardListFromCache() || [];
        const updatedCards = existingCards.filter(card => card.id !== id);
        saveFlashCardListToCache(updatedCards);
        setFlashCards(updatedCards);
        
        setCurrentCard(null);
        
        // If the deleted card is in the URL, redirect to /flashcard
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') === id) {
          router.replace('/flashcard');
        }
      } else {
        // For authenticated users, delete via API
        const response = await fetch(`/api/flashcard/${id}/delete`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete flashcard');
        }

        deleteFlashCard(id);
        removeFlashCardFromCache(id); // Remove from localStorage
        setCurrentCard(null);
        
        // If the deleted card is in the URL, redirect to /flashcard
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') === id) {
          router.replace('/flashcard');
        }
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete flashcard');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar Container - Hidden for guests */}
      {!isGuest && (
        <div className={`${isSidebarOpen ? 'w-64 md:w-64' : 'w-0'} ${
          isMobileView ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'
        } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-background border-r border-border`}>
          <FlashCardSidebar />
        </div>
      )}

      {/* Overlay for mobile */}
      {isMobileView && isSidebarOpen && !isGuest && (
        <div 
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 sm:p-4 border-b border-border">
          {!isGuest && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hover:opacity-80 transition-opacity"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
          )}
          <Link href="/">
            <Button variant="ghost" size="icon" className="hover:cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Flash Card Generator</h1>
          {isGuest ? (
            <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3">
              <div className="text-xs sm:text-sm text-muted-foreground text-right sm:text-left">
                Guest Mode - {3 - guestIndividualFlashcardCount} flashcards remaining
              </div>
              <Link href="/auth/login">
                <Button size="sm" variant="outline" className="text-xs h-7 px-2 sm:px-3 hover:cursor-pointer whitespace-nowrap">
                  Sign in
                </Button>
              </Link>
              <ThemeToggle size="sm" />
            </div>
          ) : (
            <div className="ml-auto">
              <ThemeToggle size="sm" />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {/* Guest Feature Hint - Moved to top and made smaller */}
          {isGuest && (
            <Card className="mb-4 border-muted/60">
              <CardContent className="p-2 sm:p-3">
                <div className="flex flex-col sm:flex-col sm:items-start gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-muted/60 rounded-full flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">💡</span>
                    </div>
                    <h3 className="font-medium text-foreground text-sm">More features with sign in</h3>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap sm:flex-row gap-x-2 sm:gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span>• Bulk creation</span>
                      <span>• Library access</span>
                      <span>• Smart folders</span>
                      <span>• PDF upload</span>
                    </div>
                    <div className="flex justify-start">
                      <Link href="/auth/login">
                        <Button size="sm" variant="outline" className="text-xs h-7 px-3 hover:cursor-pointer">
                          Sign in for more features
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="py-3 px-3 sm:px-6">
              <CardTitle>Generate a Flash Card</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 pb-4">
              {isGuest && guestIndividualFlashcardCount >= 4 && (
                <div className="mb-4 p-3 bg-muted rounded-lg border">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    You&apos;ve reached the guest limit of 3 flashcards. 
                    <Link href="/auth/login" className="text-primary hover:underline ml-1">
                      Sign in
                    </Link> to access your flashcard library and generate unlimited flashcards.
                  </p>
                </div>
              )}
              <form onSubmit={(e) => {
                e.preventDefault();
                handleGenerateFlashCard();
              }} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <ChatInput
                      placeholder="Enter a word or phrase to learn"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      disabled={isLoading}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleGenerateFlashCard();
                        }
                      }}
                    />
                  </div>
                  {!isGuest && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isBulk}
                          onChange={() => setIsBulk((prev) => !prev)}
                          className="accent-primary"
                        />
                        Pack
                      </label>
                    </div>
                  )}
                </div>
                {!isGuest && isBulk && (
                  <>
                    <div className="flex items-center gap-2 mt-2">
                      <label htmlFor="bulk-count" className="text-sm">Number of flashcards</label>
                      <input
                        id="bulk-count"
                        type="number"
                        min={1}
                        max={100}
                        value={bulkCount}
                        onChange={(e) => setBulkCount(Number(e.target.value))}
                        className="w-20 border rounded px-2 py-1 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <label htmlFor="pdf-upload">
                        <Button variant="outline" className="px-4 py-2 cursor-pointer rounded-lg shadow-sm border-muted/60 hover:cursor-pointer" asChild>
                          <span>{pdfFile ? "Change PDF" : "Choose PDF"}</span>
                        </Button>
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        id="pdf-upload"
                        className="hidden"
                        onChange={e => setPdfFile(e.target.files?.[0] || null)}
                        disabled={isLoading}
                      />
                      {pdfFile && (
                        <div className="flex items-center gap-1 bg-muted/60 px-2 py-1 rounded text-xs shadow-sm">
                          <span className="truncate max-w-[140px] font-medium">{pdfFile.name}</span>
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-destructive"
                            onClick={() => setPdfFile(null)}
                            aria-label="Remove file"
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="cursor-pointer hover:opacity-90"
                  >
                    {isLoading ? (
                      isBulk 
                        ? `Generating ${bulkCardsGenerated}/${bulkCount}...` 
                        : 'Generating...'
                    ) : 'Generate'}
                  </Button>
                </div>
              </form>
              {error && <p className="text-destructive mt-2">{error}</p>}
            </CardContent>
          </Card>
          
          {currentCard && (
            <div className="flex flex-col items-center">
              <div className="flex justify-center items-center space-x-2 sm:space-x-4 w-full max-w-full sm:max-w-[600px]">
                {currentCard.folderId && currentIndex > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPreviousCard}
                    className="hover:bg-accent h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                )}

                <div className="flex-1 w-full max-w-full overflow-hidden">
                  <FlashCard 
                    {...currentCard}
                    onEdit={handleEditCard}
                    onDelete={handleDeleteCard}
                  />
                </div>

                {currentCard.folderId && currentIndex < cardsInFolder.length - 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNextCard}
                    className="hover:bg-accent h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Login Popup for when guest limits are reached */}
      {showFlashcardLoginPopup && (
        <LoginPopup 
          isOpen={showFlashcardLoginPopup}
          onClose={() => setShowFlashcardLoginPopup(false)}
          closable={true}
        />
      )}
    </div>
  );
}

export default function FlashCardPage() {
  return (
    <FlashCardProvider>
      <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
        <FlashCardPageContent />
      </Suspense>
    </FlashCardProvider>
  );
}
