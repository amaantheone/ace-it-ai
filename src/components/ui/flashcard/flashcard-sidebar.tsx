'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { FlashCardData } from './flash-card';

export function FlashCardSidebar() {
  const [flashCards, setFlashCards] = useState<FlashCardData[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFlashCards = async () => {
      try {
        const response = await fetch('/api/flashcard');
        if (!response.ok) {
          throw new Error('Failed to fetch flash cards');
        }
        const data = await response.json();
        setFlashCards(data.flashCards);
      } catch (err) {
        console.error('Error fetching flash cards:', err);
        setError('Failed to load flash cards');
      }
    };

    fetchFlashCards();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <Card className="h-[calc(100vh-4rem)] flex flex-col">
      <CardHeader>
        <CardTitle>Flash Card Library</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {flashCards.map((card) => (
              <Link
                key={card.id}
                href={`/flashcard?id=${card.id}`}
                className="block"
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start text-left h-auto py-2"
                >
                  <div>
                    <div className="font-medium">{card.term}</div>
                    {card.translation && (
                      <div className="text-sm text-muted-foreground truncate">
                        {card.translation}
                      </div>
                    )}
                  </div>
                </Button>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
