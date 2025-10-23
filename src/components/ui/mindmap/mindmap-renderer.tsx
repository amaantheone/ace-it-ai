'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { renderMindmap } from '@/utils/mindmapFunctions/mindmapRenderer';
import { generateMindmapSyntax } from '@/utils/mindmapFunctions/mindmapUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Define a MindmapNode type for strong typing
interface MindmapNode {
  text: string;
  definition?: string;
  children?: MindmapNode[];
}

interface MindmapRendererProps {
  mindmapData: {
    root: MindmapNode;
  };
}

export function MindmapRenderer({ mindmapData }: MindmapRendererProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [popover, setPopover] = useState<{ open: boolean; word: string; definition: string | null; x: number; y: number }>({ 
    open: false, word: '', definition: null, x: 0, y: 0 
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Zoom and pan state
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);

  // Helper to find definition by node text
  const findDefinition = useCallback((node: MindmapNode, word: string): string | null => {
    if (node.text === word) return node.definition || null;
    if (node.children) {
      for (const child of node.children) {
        const def = findDefinition(child, word);
        if (def) return def;
      }
    }
    return null;
  }, []);

  // Zoom functions
  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Touch distance calculator
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Touch handlers for pinch zoom
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setLastTouchDistance(getTouchDistance(e.touches));
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  }, [position]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = getTouchDistance(e.touches);
      if (lastTouchDistance > 0) {
        const scaleDelta = currentDistance / lastTouchDistance;
        setScale(prev => Math.max(0.3, Math.min(3, prev * scaleDelta)));
      }
      setLastTouchDistance(currentDistance);
    } else if (e.touches.length === 1 && isDragging) {
      e.preventDefault();
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y
      });
    }
  }, [lastTouchDistance, isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setLastTouchDistance(0);
  }, []);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.3, Math.min(3, prev * delta)));
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Add event listeners for pan and zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Touch events (keep for mobile)
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    // Mouse wheel for zoom only (no dragging for laptop/desktop)
    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('wheel', handleWheel);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleWheel]);

  useEffect(() => {
    renderMindmap({
      mindmapData,
      mermaidRef: mermaidRef as React.RefObject<HTMLDivElement>,
      generateMindmapSyntax,
      onNodeClick: (word: string, evt?: MouseEvent) => {
        // Get mouse position for popover placement
        let x = 0, y = 0;
        if (evt && 'clientX' in evt && 'clientY' in evt) {
          x = evt.clientX;
          y = evt.clientY;
        }
        const definition = findDefinition(mindmapData.root, word) || 'No definition found.';
        
        if (isMobile) {
          // Use Dialog for mobile
          setPopover({ open: false, word, definition, x, y });
          setDialogOpen(true);
        } else {
          // Use Popover for desktop
          setDialogOpen(false);
          setPopover({ open: true, word, definition, x, y });
        }
      },
    });
  }, [mindmapData, findDefinition, isMobile]);

  return (
    <div className="relative w-full h-full">
      {/* Zoom Controls */}
      {isMobile && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm"
            onClick={zoomIn}
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm"
            onClick={zoomOut}
            disabled={scale <= 0.3}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="w-10 h-10 p-0 bg-background/80 backdrop-blur-sm"
            onClick={resetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Zoom indicator */}
      {(isMobile && scale !== 1) && (
        <div className="absolute bottom-4 left-4 z-10 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
          {Math.round(scale * 100)}%
        </div>
      )}

      {/* Mindmap Container */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-hidden bg-background rounded-lg"
        style={{ 
          minHeight: '400px'
        }}
      >
        <div
          ref={mermaidRef}
          className="w-full bg-background p-4 rounded-lg transition-transform origin-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            minHeight: '400px'
          }}
        />
      </div>
      
      {/* Popover for desktop */}
      <Popover open={popover.open} onOpenChange={(open) => setPopover((prev) => ({ ...prev, open }))}>
        <PopoverContent
          align="center"
          sideOffset={8}
          style={{ position: 'fixed', left: popover.x, top: popover.y, zIndex: 1000 }}
        >
          <Card className="w-72">
            <CardHeader>
              <CardTitle>{popover.word}</CardTitle>
              <CardDescription>
                {popover.definition}
              </CardDescription>
            </CardHeader>
            <Button variant="outline" size="sm" onClick={() => setPopover((prev) => ({ ...prev, open: false }))}>
              Close
            </Button>
          </Card>
        </PopoverContent>
      </Popover>
      
      {/* Dialog for mobile */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{popover.word}</DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-sm mt-2 whitespace-pre-wrap">
            {popover.definition}
          </DialogDescription>
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
