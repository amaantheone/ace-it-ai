'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Moon, Sun, X } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { MindmapRenderer } from '@/components/ui/mindmap/mindmap-renderer';
import { ChatInput } from "@/components/ui/chat/chat-input";
import { MindmapSidebar } from '@/components/ui/mindmap/mindmap-sidebar';
import { useGuest } from "@/contexts/GuestContext";
import { LoginPopup } from "@/components/ui/login-popup";

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
  const { theme, toggleTheme } = useTheme();
  const { 
    isGuest, 
    incrementGuestMindmapCount, 
    showMindmapLoginPopup,
    saveGuestData,
    loadGuestData 
  } = useGuest();
  
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mindmapData, setMindmapData] = useState<MindmapData | null>(null);
  const [mindmaps, setMindmaps] = useState<{ id: string; topic: string; createdAt: string; data?: MindmapData }[]>([]);
  const [currentMindmapId, setCurrentMindmapId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // --- LocalStorage Caching Helpers ---

  type MindmapListItem = { id: string; topic: string; createdAt: string; data?: MindmapData }[];

  // Load mindmap list from localStorage
  const loadMindmapListFromCache = useCallback((): MindmapListItem | null => {
    try {
      const key = isGuest ? 'guest_mindmaps' : 'mindmap_list';
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  }, [isGuest]);

  // Save mindmap list to localStorage
  const saveMindmapListToCache = useCallback((list: MindmapListItem) => {
    try {
      const key = isGuest ? 'guest_mindmaps' : 'mindmap_list';
      localStorage.setItem(key, JSON.stringify(list));
    } catch {}
  }, [isGuest]);

  // Load individual mindmap from localStorage
  const loadMindmapFromCache = useCallback((id: string): MindmapData | null => {
    try {
      const key = isGuest ? `guest_mindmap_${id}` : `mindmap_${id}`;
      const cached = localStorage.getItem(key);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch {}
    return null;
  }, [isGuest]);

  // Save individual mindmap to localStorage
  const saveMindmapToCache = useCallback((id: string, data: MindmapData) => {
    try {
      const key = isGuest ? `guest_mindmap_${id}` : `mindmap_${id}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch {}
  }, [isGuest]);

  // --- Fetch mindmap list: cache first, then API (only for authenticated users) ---
  useEffect(() => {
    // Try to load from cache first
    const cachedList = loadMindmapListFromCache();
    if (cachedList) {
      setMindmaps(cachedList);
    }

    // For authenticated users, also update from API
    if (!isGuest) {
      fetch('/api/mindmap')
        .then(res => res.json())
        .then(data => {
          setMindmaps(data.mindmaps || []);
          saveMindmapListToCache(data.mindmaps || []);
        })
        .catch(error => {
          console.error('Error fetching mindmaps:', error);
        });
    }
  }, [isGuest, loadMindmapListFromCache, saveMindmapListToCache]);

  // --- Generate mindmap: update cache ---
  const handleGenerateMindmap = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      let response;
      if (pdfFile) {
        const formData = new FormData();
        formData.append('topic', topic);
        formData.append('pdf', pdfFile);
        response = await fetch('/api/mindmap', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/mindmap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mindmap');
      }
      const data = await response.json();
      setMindmapData(data.mindmap as MindmapData);
      setCurrentMindmapId(data.id);
      
      // Save to cache
      saveMindmapToCache(data.id, data.mindmap);
      
      // For guest users, save mindmap data and increment count
      if (isGuest) {
        const guestMindmaps = (loadGuestData('guest_mindmaps') as { id: string; topic: string; createdAt: string; data?: MindmapData }[]) || [];
        const newMindmap = {
          id: data.id,
          topic,
          createdAt: new Date().toISOString(),
          data: data.mindmap
        };
        guestMindmaps.unshift(newMindmap);
        saveGuestData('guest_mindmaps', guestMindmaps);
        setMindmaps(guestMindmaps);
        
        // Increment guest mindmap count
        incrementGuestMindmapCount();
      } else {
        // For authenticated users, refetch mindmaps and update cache
        fetch('/api/mindmap')
          .then(res => res.json())
          .then(data => {
            setMindmaps(data.mindmaps || []);
            saveMindmapListToCache(data.mindmaps || []);
          });
      }
    } catch (err) {
      console.error('Error generating mindmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate mindmap');
    } finally {
      setIsLoading(false);
      setTopic('');
      setPdfFile(null);
    }
  };

  // --- Select mindmap: load from cache first, then API (guest mode uses only cache) ---
  const handleSelectMindmap = async (id: string) => {
    setCurrentMindmapId(id);
    setIsLoading(true);
    setError('');
    
    // Try cache first
    const cached = loadMindmapFromCache(id);
    if (cached) {
      setMindmapData(cached as MindmapData);
      setIsLoading(false);
      return; // Do not fetch from API if found in cache
    }

    // For guest users, if not in cache, it doesn't exist
    if (isGuest) {
      setError('Mindmap not found');
      setIsLoading(false);
      return;
    }

    // For authenticated users, try API
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

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Sidebar for desktop (flex child) */}
      <div className={`hidden md:block w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? '' : 'md:-ml-64'}`}> 
        <MindmapSidebar
          mindmaps={mindmaps}
          currentMindmapId={currentMindmapId || undefined}
          onSelectMindmap={handleSelectMindmap}
          onCloseSidebar={() => setIsSidebarOpen(false)}
        />
      </div>
      {/* Sidebar for mobile (fixed overlay) */}
      {isMobileView && isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setIsSidebarOpen(false)}
            style={{ pointerEvents: 'auto' }}
          />
          <div className="fixed left-0 top-0 h-full w-[75vw] z-50 bg-background shadow-lg transition-transform duration-300">
            <MindmapSidebar
              mindmaps={mindmaps}
              currentMindmapId={currentMindmapId || undefined}
              onSelectMindmap={handleSelectMindmap}
              onCloseSidebar={() => setIsSidebarOpen(false)}
            />
          </div>
        </>
      )}
      {/* Main Content */}
      <div className={
        `flex-1 ${isMobileView ? 'w-full h-full p-1' : isSidebarOpen ? 'container mx-auto p-4' : 'w-full h-full p-4'} flex flex-col`
      }>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Sidebar toggle button for both mobile and desktop */}
            <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </Button>
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
            }} className="flex flex-col gap-2 min-h-0">
              <div className="flex gap-2 items-center w-full">
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
                <Button type="submit" disabled={isLoading} className="cursor-pointer hover:opacity-90">
                  {isLoading ? 'Generating...' : 'Generate'}
                </Button>
              </div>
            </form>
            {error && <p className="text-destructive mt-2">{error}</p>}
          </CardContent>
        </Card>
        {mindmapData && (
          <div className={`flex-1 flex ${isMobileView ? 'min-h-0 min-w-0' : ''}`}>
            <Card className="w-full h-full flex-1 flex flex-col">
              <CardContent className={`flex-1 pt-6 ${isMobileView ? 'p-1' : ''} flex flex-col`} style={isMobileView ? {height: '100%', minHeight: 0, minWidth: 0} : {}}>
                <div className="flex-1 w-full h-full min-h-0 min-w-0">
                  <MindmapRenderer mindmapData={mindmapData} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Login Popup for Guest Users */}
      <LoginPopup
        isOpen={showMindmapLoginPopup}
        title="Sign in to Continue Creating Mindmaps"
        description="You've created 1 mindmap as a guest. Sign in to unlock unlimited mindmap creation and save your work!"
        closable={false}
      />
    </div>
  );
}
