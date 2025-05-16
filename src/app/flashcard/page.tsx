'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { FlashCard, FlashCardData } from '@/components/ui/flashcard/flash-card';
import { FlashCardSidebar } from '@/components/ui/flashcard/flashcard-sidebar';
import { ChatInput } from '@/components/ui/chat/chat-input';

export default function FlashCardPage() {
  const searchParams = useSearchParams();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentCard, setCurrentCard] = useState<FlashCardData | null>(null);

  // Fetch the specific card if an ID is provided in the URL
  useEffect(() => {
    const cardId = searchParams.get('id');
    if (cardId) {
      fetchCard(cardId);
    }
  }, [searchParams]);

  const fetchCard = async (id: string) => {
    try {
      const response = await fetch(`/api/flashcard/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch flash card');
      }
      const data = await response.json();
      setCurrentCard(data.flashCard);
    } catch (err: any) {
      console.error('Error fetching flash card:', err);
      setError(err.message || 'Failed to fetch flash card');
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
      setTopic(''); // Clear input after successful generation
    } catch (err: any) {
      console.error('Error generating flashcard:', err);
      setError(err.message || 'Failed to generate flashcard');
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
    } catch (error: any) {
      console.error('Error updating flashcard:', error);
      setError(error.message || 'Failed to update flashcard');
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

      setCurrentCard(null);
      // Force reload the sidebar
      window.location.href = '/flashcard';
    } catch (error: any) {
      console.error('Error deleting flashcard:', error);
      setError(error.message || 'Failed to delete flashcard');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="grid grid-cols-4 gap-4 p-4">
        <div className="col-span-1">
          <FlashCardSidebar />
        </div>
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Flash Card Generator</h1>
            </div>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate a Flash Card</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleGenerateFlashCard();
              }} className="flex gap-2 items-center">
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
                <Button type="submit" disabled={isLoading} className="cursor-pointer hover:opacity-90">
                  {isLoading ? 'Generating...' : 'Generate'}
                </Button>
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
