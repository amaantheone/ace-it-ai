import { Card } from '@/components/ui/card';

interface MindmapSidebarProps {
  mindmaps: Array<{
    id: string;
    topic: string;
    createdAt: string;
    data?: {
      root?: {
        text?: string;
      };
    };
  }>;
  currentMindmapId?: string;
  onSelectMindmap: (id: string) => void;
  onCloseSidebar?: () => void; // Optional prop for mobile overlay close
}

export function MindmapSidebar({ mindmaps, currentMindmapId, onSelectMindmap, onCloseSidebar }: MindmapSidebarProps) {
  // Only close sidebar on mobile (when onCloseSidebar is provided and isMobileView is true)
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  const handleCardClick = (id: string) => {
    onSelectMindmap(id);
    if (onCloseSidebar && isMobileView) {
      onCloseSidebar();
    }
  };
  return (
    <aside className="w-64 bg-muted h-full flex flex-col border-r">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mind Map History</h2>
        {/* Show close button on mobile overlay */}
        {onCloseSidebar && (
          <button
            className="md:hidden ml-2 p-1 rounded hover:bg-accent"
            onClick={onCloseSidebar}
            aria-label="Close sidebar"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/></svg>
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {mindmaps.length === 0 ? (
          <div className="p-4 text-muted-foreground">No mindmaps yet.</div>
        ) : (
          mindmaps.map((mindmap) => {
            // Use the root node's text as the display name if available
            let displayName = mindmap.topic;
            if (mindmap.data && mindmap.data.root && mindmap.data.root.text) {
              displayName = mindmap.data.root.text;
            }
            return (
              <Card
                key={mindmap.id}
                className={`mx-2 my-1 cursor-pointer transition-colors duration-150 ${mindmap.id === currentMindmapId ? 'border-primary bg-primary/10' : 'hover:bg-accent'} border-2 shadow-none`}
                onClick={() => handleCardClick(mindmap.id)}
              >
                <div className="py-1 px-2 flex items-center gap-2">
                  <div className={`truncate font-medium text-sm ${mindmap.id === currentMindmapId ? 'text-primary' : ''}`}>
                    {displayName}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </aside>
  );
}
