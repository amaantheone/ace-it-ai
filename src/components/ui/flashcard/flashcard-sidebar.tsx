'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFlashCards } from '@/contexts/FlashCardContext';

export function FlashCardSidebar() {
  const { flashCards, setFlashCards, deleteFlashCard } = useFlashCards();
  const [error, setError] = useState('');
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlashCards = async () => {
      try {
        const response = await fetch('/api/flashcard');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch flash cards');
        }
        const data = await response.json();
        setFlashCards(data.flashCards);

        // Set current ID from URL if it exists
        const urlParams = new URLSearchParams(window.location.search);
        setCurrentId(urlParams.get('id'));
      } catch (err) {
        console.error('Error fetching flash cards:', err);
        setError(err instanceof Error ? err.message : 'Failed to load flash cards');
      }
    };

    fetchFlashCards();
  }, [setFlashCards]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent the Link navigation
    e.stopPropagation(); // Prevent triggering the parent button click
    try {
      const response = await fetch(`/api/flashcard/${id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete flash card');
      }

      deleteFlashCard(id);

      // If we deleted the current card, redirect to the main page
      if (id === currentId) {
        window.location.href = '/flashcard';
      }
    } catch (error) {
      console.error('Error deleting flash card:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete flash card');
    }
  };

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

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
          <div className="py-2 space-y-1">
            {flashCards.map((card) => (
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
        )}
      </ScrollArea>
    </aside>
  );
}
