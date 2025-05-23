'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { MindmapRenderer } from '@/components/ui/mindmap/mindmap-renderer';
import { ChatInput } from "@/components/ui/chat/chat-input";
import { MindmapSidebar } from '@/components/ui/mindmap/mindmap-sidebar';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define a MindmapNode and MindmapData type for strong typing
interface MindmapNode {
  text: string;
  definition?: string;
  children?: MindmapNode[];
}
interface MindmapData {
  root: MindmapNode;
}

export default function MindmapPage() {
  const router = useRouter();
  const { status } = useSession(); // remove 'session' as it's unused
  const { theme, toggleTheme } = useTheme();
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [mindmaps, setMindmaps] = useState<{ id: string; topic: string; createdAt: string; data?: MindmapData }[]>([]);
  const [currentMindmapId, setCurrentMindmapId] = useState<string | null>(null);

  // --- LocalStorage Caching Helpers ---
  const MINDMAP_LIST_KEY = 'mindmap_list';
  const getMindmapKey = (id: string) => `mindmap_${id}`;

  type MindmapListItem = { id: string; topic: string; createdAt: string; data?: MindmapData }[];

  // Load mindmap list from localStorage
  const loadMindmapListFromCache = useCallback((): MindmapListItem | null => {
    try {
      const cached = localStorage.getItem(MINDMAP_LIST_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  }, []);

  // Save mindmap list to localStorage
  const saveMindmapListToCache = useCallback((list: MindmapListItem) => {
    try {
      localStorage.setItem(MINDMAP_LIST_KEY, JSON.stringify(list));
    } catch {}
  }, []);

  // Load individual mindmap from localStorage
  const loadMindmapFromCache = useCallback((id: string): MindmapData | null => {
    try {
      const cached = localStorage.getItem(getMindmapKey(id));
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  }, []);

  // Save individual mindmap to localStorage
  const saveMindmapToCache = useCallback((id: string, data: MindmapData) => {
    try {
      localStorage.setItem(getMindmapKey(id), JSON.stringify(data));
    } catch {}
  }, []);

  // --- Fetch mindmap list: cache first, then API ---
  useEffect(() => {
    // Redirect to login if not authenticated
    if (status === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Try to load from cache first
    const cachedList = loadMindmapListFromCache();
    if (cachedList) {
      setMindmaps(cachedList);
    }
    // Always update from API
    fetch('/api/mindmap')
      .then(res => res.json())
      .then(data => {
        setMindmaps(data.mindmaps || []);
        saveMindmapListToCache(data.mindmaps || []);
      });
  }, [loadMindmapListFromCache, saveMindmapListToCache]);

  // --- Generate mindmap: update cache ---
  const handleGenerateMindmap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/mindmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mindmap');
      }
      const data = await response.json();
      setMindmapData(data.mindmap as MindmapData);
      setCurrentMindmapId(data.id);
      // Save to cache
      saveMindmapToCache(data.id, data.mindmap);
      // Refetch mindmaps and update cache
      fetch('/api/mindmap')
        .then(res => res.json())
        .then(data => {
          setMindmaps(data.mindmaps || []);
          saveMindmapListToCache(data.mindmaps || []);
        });
    } catch (err) {
      console.error('Error generating mindmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
    } finally {
      setIsLoading(false);
      setTopic('');
    }
  };

  // --- Select mindmap: load from cache first, then API ---
  const handleSelectMindmap = async (id: string) => {
    setCurrentMindmapId(id);
    setIsLoading(true);
    setError('');
    // Try cache first
    const cached = loadMindmapFromCache(id);
    if (cached) {
      setMindmapData(cached as MindmapData);
    }
    try {
      const response = await fetch(`/api/mindmap/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch mindmap');
      }
      const data = await response.json();
      setMindmapData(data.mindmap.data as MindmapData);
      // Update cache
      saveMindmapToCache(id, data.mindmap.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch mindmap');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <MindmapSidebar
        mindmaps={mindmaps}
        currentMindmapId={currentMindmapId || undefined}
        onSelectMindmap={handleSelectMindmap}
      />
      <div className="flex-1 container mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Mindmap Generator</h1>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              toggleTheme();
            }}
            className="rounded-full"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-primary" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate a Mindmap</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleGenerateMindmap();
            }} className="flex gap-2 items-center min-h-0">
              <div className="flex-1">
                <ChatInput
                  placeholder="Enter a topic (e.g., Quantum Physics, Climate Change, Machine Learning)"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerateMindmap();
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
        
        {mindmapData && (
          <Card>
            <CardContent className="pt-6">
              <MindmapRenderer mindmapData={mindmapData} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
