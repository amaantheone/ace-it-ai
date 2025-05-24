'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, Trash2, X } from 'lucide-react';

interface FlashCardProps {
  id?: string;
  term: string;
  translation?: string | null;
  partOfSpeech?: string | null;
  definition: string;
  example: string;
  tag?: string | null;
  onEdit?: (card: FlashCardData) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export interface FlashCardData {
  id?: string;
  term: string;
  translation: string | null;
  partOfSpeech: string | null;
  definition: string;
  example: string;
  tag?: string | null;
  folderId?: string;
}

export function FlashCard({
  id,
  term,
  translation,
  partOfSpeech,
  definition,
  example,
  tag,
  onEdit,
  onDelete,
}: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<FlashCardData>({
    id,
    term,
    translation: translation || null,
    partOfSpeech: partOfSpeech || null,
    definition,
    example,
    tag: tag || '',
  });

  const handleFlip = () => {
    if (!isEditing) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onEdit) {
      await onEdit(editData);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      id,
      term,
      translation: translation || null,
      partOfSpeech: partOfSpeech || null,
      definition,
      example,
      tag: tag || '',
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (id && onDelete) {
      await onDelete(id);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Term</label>
              <Input
                value={editData.term}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditData({ ...editData, term: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Translation (optional)</label>
              <Input
                value={editData.translation || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditData({ ...editData, translation: e.target.value || null })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Part of Speech (optional)</label>
              <Input
                value={editData.partOfSpeech || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditData({ ...editData, partOfSpeech: e.target.value || null })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Definition</label>
              <Textarea
                value={editData.definition}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditData({ ...editData, definition: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Example</label>
              <Textarea
                value={editData.example}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditData({ ...editData, example: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Tag (subject)</label>
              <Input
                value={editData.tag || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditData({ ...editData, tag: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-end mb-2 gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleEdit}
          className="rounded-full"
        >
          <Edit className="h-4 w-4" />
        </Button>
        {id && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="rounded-full"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
      <div className="relative min-h-[200px]" style={{ perspective: 1000, height: 250 }}>
        <motion.div
          className="w-full h-full relative"
          style={{ transformStyle: 'preserve-3d', width: '100%', height: '100%' }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5 }}
          onClick={handleFlip}
        >
          {/* Front of card */}
          <div
            className="absolute w-full h-full flex flex-col items-center justify-center p-6 cursor-pointer hover:shadow-lg transition-shadow bg-background text-foreground rounded-3xl border border-border"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', zIndex: isFlipped ? 1 : 2, borderRadius: 'inherit' }}
          >
            <h2 className="text-2xl font-bold mb-2">{term}</h2>
            {translation && (
              <p className="text-sm text-muted-foreground">{translation}</p>
            )}
            {tag && (
              <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-accent text-accent-foreground">Tag: {tag}</span>
            )}
          </div>
          {/* Back of card */}
          <div
            className="absolute w-full h-full flex flex-col gap-4 p-6 cursor-pointer hover:shadow-lg transition-shadow bg-background text-foreground rounded-3xl border border-border"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              zIndex: isFlipped ? 2 : 1,
              borderRadius: 'inherit',
            }}
          >
            {partOfSpeech && (
              <p className="text-sm text-muted-foreground italic">{partOfSpeech}</p>
            )}
            <p className="text-base">{definition}</p>
            <p className="text-sm text-muted-foreground">
              Example: &quot;{example}&quot;
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
