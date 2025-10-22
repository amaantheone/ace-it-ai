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
    flashCards,
    folders,
    setFlashCards,
    setFolders,
    addFlashCard,
    updateFlashCard,
    deleteFlashCard,
    getCurrentFolder,
    getFolderCards,
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
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isGuestCardModalOpen, setIsGuestCardModalOpen] = useState(false);

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
      saveFlashCardToCache(id, cached);
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
    } catch (err) {
      console.error('Error fetching flash card:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch flash card');
    }
  }, [loadFlashCardFromCache, setCurrentCard, setError, saveFlashCardToCache, isGuest]);

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

  // Open the flashcard modal when in guest mode and a card is present
  useEffect(() => {
    if (isGuest && currentCard) {
      setIsGuestCardModalOpen(true);
    }
  }, [isGuest, currentCard]);

  // Fetch the specific card if an ID is provided in the URL
  useEffect(() => {
    const cardId = searchParams.get('id');
    if (cardId) {
      void fetchCard(cardId);
    }
  }, [searchParams, fetchCard]);

  // === NAVIGATION SYSTEM ===
  // Context-aware navigation that works for both folder cards and standalone cards
  
  // Helper function to get navigation cards based on current context
  const getNavigationCards = useCallback((): FlashCardData[] => {
    if (!currentCard) return [];
    
    // Check if current card is in a folder
    const cardFolder = folders.find(folder => folder.cardIds.includes(currentCard.id!));
    
    if (cardFolder) {
      // Return cards from the folder
      return getFolderCards(cardFolder.id);
    } else {
      // Return standalone cards (not in any folder)
      const allFolderCardIds = folders.flatMap(folder => folder.cardIds);
      return flashCards.filter(card => !allFolderCardIds.includes(card.id!));
    }
  }, [currentCard, folders, flashCards, getFolderCards]);

  // Helper function to get current card index in navigation context
  const getCurrentCardIndex = useCallback((): number => {
    if (!currentCard) return -1;
    const navCards = getNavigationCards();
    return navCards.findIndex(card => card.id === currentCard.id);
  }, [currentCard, getNavigationCards]);

  // Navigate to previous card (ChevronLeft)
  const goToPrevious = useCallback(() => {
    const navCards = getNavigationCards();
    const currentIndex = getCurrentCardIndex();
    
    if (navCards.length === 0 || currentIndex <= 0) return;
    
    const previousCard = navCards[currentIndex - 1];
    if (previousCard?.id) {
      router.push(`/flashcard?id=${previousCard.id}`);
    }
  }, [getNavigationCards, getCurrentCardIndex, router]);

  // Navigate to next card (ChevronRight)
  const goToNext = useCallback(() => {
    const navCards = getNavigationCards();
    const currentIndex = getCurrentCardIndex();
    
    if (navCards.length === 0 || currentIndex >= navCards.length - 1) return;
    
    const nextCard = navCards[currentIndex + 1];
    if (nextCard?.id) {
      router.push(`/flashcard?id=${nextCard.id}`);
    }
  }, [getNavigationCards, getCurrentCardIndex, router]);

  // Check if previous navigation is available
  const hasPrevious = useCallback((): boolean => {
    const currentIndex = getCurrentCardIndex();
    return currentIndex > 0;
  }, [getCurrentCardIndex]);

  // Check if next navigation is available
  const hasNext = useCallback((): boolean => {
    const navCards = getNavigationCards();
    const currentIndex = getCurrentCardIndex();
    return currentIndex >= 0 && currentIndex < navCards.length - 1;
  }, [getNavigationCards, getCurrentCardIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle navigation if not typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (event.key === 'ArrowLeft' && hasPrevious()) {
        event.preventDefault();
        goToPrevious();
      } else if (event.key === 'ArrowRight' && hasNext()) {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext, hasPrevious, hasNext]);

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

  // Helper function to find the next available flashcard after deletion
  const findNextFlashcard = useCallback((deletedCardId: string): string | null => {
    // First, determine which collection the deleted card belongs to
    const deletedCard = flashCards.find(card => card.id === deletedCardId);
    if (!deletedCard) return null;

    // Check if the deleted card is in a folder
    const cardFolder = folders.find(folder => folder.cardIds.includes(deletedCardId));
    const currentFolderId = getCurrentFolder();

    let availableCards: FlashCardData[] = [];
    let contextCards: FlashCardData[] = [];

    if (cardFolder && currentFolderId === cardFolder.id) {
      // User is viewing a card in the current folder context
      contextCards = getFolderCards(cardFolder.id);
      availableCards = contextCards.filter(card => card.id !== deletedCardId);
    } else if (cardFolder) {
      // Card is in a folder but user might not be in that folder context
      // Prioritize cards from the same folder
      contextCards = getFolderCards(cardFolder.id);
      availableCards = contextCards.filter(card => card.id !== deletedCardId);
      
      // If no cards left in the folder, fall back to main collection
      if (availableCards.length === 0) {
        const allFolderCardIds = folders.flatMap(folder => folder.cardIds);
        availableCards = flashCards.filter(card => 
          card.id !== deletedCardId && !allFolderCardIds.includes(card.id!)
        );
        contextCards = availableCards;
      }
    } else {
      // Card is in main collection (not in any folder)
      const allFolderCardIds = folders.flatMap(folder => folder.cardIds);
      contextCards = flashCards.filter(card => !allFolderCardIds.includes(card.id!));
      availableCards = contextCards.filter(card => card.id !== deletedCardId);
    }

    if (availableCards.length === 0) {
      // No cards in current context, try to find any available card
      const anyAvailableCard = flashCards.find(card => card.id !== deletedCardId);
      return anyAvailableCard?.id || null;
    }

    // Find the index of the deleted card in the context
    const deletedIndex = contextCards.findIndex(card => card.id === deletedCardId);
    
    if (deletedIndex === -1) {
      // Card not found in current context, return first available
      return availableCards[0]?.id || null;
    }

    // Try to get the card at the same index position (becomes "next" after deletion)
    if (deletedIndex < availableCards.length) {
      return availableCards[deletedIndex]?.id || null;
    }
    
    // If deleted card was last, get the previous one (last available)
    return availableCards[availableCards.length - 1]?.id || null;
  }, [flashCards, folders, getCurrentFolder, getFolderCards]);

  const handleDeleteCard = async (id: string) => {
    try {
      // Find the next card before deletion
      const nextCardId = findNextFlashcard(id);
      
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
        
        // Redirect to next card or main page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') === id) {
          if (nextCardId) {
            router.replace(`/flashcard?id=${nextCardId}`);
          } else {
            router.replace('/flashcard');
          }
        }
      } else {
        // For authenticated users, use the context function which handles the API call
        await deleteFlashCard(id);
        removeFlashCardFromCache(id); // Remove from localStorage
        setCurrentCard(null);
        
        // Redirect to next card or main page
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('id') === id) {
          if (nextCardId) {
            router.replace(`/flashcard?id=${nextCardId}`);
          } else {
            router.replace('/flashcard');
          }
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
          <Link href="/home">
            <Button variant="ghost" size="icon" className="hover:cursor-pointer">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold">Flash Card Generator</h1>
          {isGuest ? (
            <div className="ml-auto flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3">
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
                </div>
                {!isGuest && isBulk && (
                  <div className="flex flex-wrap items-center gap-2 mt-2">
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
                  {!isGuest && (
                    <label
                      className="inline-flex items-center gap-2 text-sm cursor-pointer select-none rounded-md border border-muted/60 px-3 py-1.5 shadow-sm hover:bg-accent transition-colors"
                      title="Generate multiple flashcards from this topic"
                    >
                      <input
                        type="checkbox"
                        checked={isBulk}
                        onChange={() => setIsBulk((prev) => !prev)}
                        className="accent-primary"
                      />
                      <span className="font-medium">Generate a pack</span>
                    </label>
                  )}
                </div>
              </form>
              {error && <p className="text-destructive mt-2">{error}</p>}
            </CardContent>
          </Card>
          
          {/* For authenticated users: render inline */}
          {!isGuest && currentCard && (
            <div className="flex flex-col items-center">
              <div className="flex justify-center items-center space-x-2 sm:space-x-4 w-full max-w-full sm:max-w-[600px]">
                {hasPrevious() && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToPrevious}
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

                {hasNext() && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={goToNext}
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

      {/* Guest Flashcard Modal Overlay */}
      {isGuest && isGuestCardModalOpen && currentCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative bg-background border border-border rounded-xl w-[95vw] max-w-[720px] max-h-[90vh] p-4 shadow-lg">
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              aria-label="Close"
              onClick={() => {
                setIsGuestCardModalOpen(false);
                setCurrentCard(null);
                // Clear id from URL if present
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('id')) {
                  router.replace('/flashcard');
                }
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full">
                <FlashCard
                  {...currentCard}
                  onEdit={handleEditCard}
                  onDelete={handleDeleteCard}
                />
              </div>
              <div className="flex justify-end w-full">
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">Sign in to save</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
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
