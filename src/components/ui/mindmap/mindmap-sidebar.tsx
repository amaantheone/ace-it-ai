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
}

export function MindmapSidebar({ mindmaps, currentMindmapId, onSelectMindmap }: MindmapSidebarProps) {
  return (
    <aside className="w-64 bg-muted h-full flex flex-col border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Mind Map History</h2>
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
                onClick={() => onSelectMindmap(mindmap.id)}
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
