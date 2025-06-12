'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { renderMindmap } from '@/utils/mindmapFunctions/mindmapRenderer';
import { generateMindmapSyntax } from '@/utils/mindmapFunctions/mindmapUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const [isMobile, setIsMobile] = useState(false);
  const [popover, setPopover] = useState<{ open: boolean; word: string; definition: string | null; x: number; y: number }>({ 
    open: false, word: '', definition: null, x: 0, y: 0 
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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
    <>
      <div
        ref={mermaidRef}
        className="w-full overflow-x-auto bg-background p-4 rounded-lg"
        style={{ minHeight: '400px' }}
      />
      
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
    </>
  );
}
