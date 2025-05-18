'use client';

import { useEffect, useRef, useState } from 'react';
import { renderMindmap } from '@/utils/mindmapFunctions/mindmapRenderer';
import { generateMindmapSyntax } from '@/utils/mindmapFunctions/mindmapUtils';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MindmapRendererProps {
  mindmapData: {
    root: {
      text: string;
      children?: Array<{
        text: string;
        children?: Array<{ text: string }>;
      }>;
    };
  };
}

export function MindmapRenderer({ mindmapData }: MindmapRendererProps) {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [popover, setPopover] = useState<{ open: boolean; word: string; definition: string | null; x: number; y: number }>({ open: false, word: '', definition: null, x: 0, y: 0 });

  // Helper to find definition by node text
  function findDefinition(node: any, word: string): string | null {
    if (node.text === word) return node.definition || null;
    if (node.children) {
      for (const child of node.children) {
        const def = findDefinition(child, word);
        if (def) return def;
      }
    }
    return null;
  }

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
        setPopover({ open: true, word, definition, x, y });
      },
    });
  }, [mindmapData]);

  return (
    <>
      <div
        ref={mermaidRef}
        className="w-full overflow-x-auto bg-background p-4 rounded-lg"
        style={{ minHeight: '400px' }}
      />
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
    </>
  );
}
