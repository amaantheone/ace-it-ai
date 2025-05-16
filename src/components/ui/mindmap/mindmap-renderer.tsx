'use client';

import { useEffect, useRef } from 'react';
import { renderMindmap } from '@/utils/mindmapFunctions/mindmapRenderer';
import { generateMindmapSyntax } from '@/utils/mindmapFunctions/mindmapUtils';

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

  useEffect(() => {
    renderMindmap({ mindmapData, mermaidRef: mermaidRef as React.RefObject<HTMLDivElement>, generateMindmapSyntax });
  }, [mindmapData]);

  return (
    <div 
      ref={mermaidRef} 
      className="w-full overflow-x-auto bg-background p-4 rounded-lg"
      style={{ minHeight: '400px' }}
    />
  );
}
