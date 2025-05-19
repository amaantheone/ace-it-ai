'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, PanelLeft } from 'lucide-react';
import { FlashCard, FlashCardData } from '@/components/ui/flashcard/flash-card';
import { FlashCardSidebar } from '@/components/ui/flashcard/flashcard-sidebar';
import { FlashCardProvider, useFlashCards } from '@/contexts/FlashCardContext';
import { ChatInput } from '@/components/ui/chat/chat-input';
import { useSession } from "next-auth/react";

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
  const { status } = useSession();

  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCard, setCurrentCard] = useState<FlashCardData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [isBulk, setIsBulk] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkCardsGenerated, setBulkCardsGenerated] = useState(0);

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
  }, [searchParams]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  const fetchCard = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcard/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flash card');
      }
      const data = await response.json();
      setCurrentCard(data.flashCard);
    } catch (err) {
      console.error('Error fetching flash card:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch flash card');
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
      // Streaming bulk API: expects NDJSON (one card per line)
      const response = await fetch('/api/flashcard/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
        },
        body: JSON.stringify({
          topic,
          count: bulkCount,
          createFolder: true
        }),
      });

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
          if (data.folder && !folderAdded) {
            folder = data.folder;
            setFolders(prev => [...prev, folder!]);
            folderAdded = true;
          }
          if (data.flashCard) {
            cards.push(data.flashCard);
            setFlashCards(prev => [...prev, data.flashCard]);
            // If we have a folder, add this card's id to its cardIds (avoid duplicates)
            if (folder && data.flashCard.id) {
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

    setIsLoading(true);
    setError('');

    try {
      if (isBulk) {
        // Handle bulk generation
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
    } catch (error) {
      console.error('Error updating flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to update flashcard');
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcard/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      deleteFlashCard(id);
      setCurrentCard(null);
      // If the deleted card is in the URL, redirect to /flashcard
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('id') === id) {
        router.replace('/flashcard');
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete flashcard');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-background text-foreground">
      {/* Sidebar Container */}
      <div className={`${isSidebarOpen ? 'w-64 md:w-64' : 'w-0'} ${
        isMobileView ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'
      } flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden bg-background border-r border-border`}>
        <FlashCardSidebar />
      </div>

      {/* Overlay for mobile */}
      {isMobileView && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center gap-2 p-4 border-b border-border">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:opacity-80 transition-opacity"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Flash Card Generator</h1>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate a Flash Card</CardTitle>
            </CardHeader>
            <CardContent>
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
                </div>
                {isBulk && (
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
            <div className="flex justify-center">
              <FlashCard 
                {...currentCard}
                onEdit={handleEditCard}
                onDelete={handleDeleteCard}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function FlashCardPage() {
  const router = useRouter();
  const { status } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  return (
    <FlashCardProvider>
      <FlashCardPageContent />
    </FlashCardProvider>
  );
}
