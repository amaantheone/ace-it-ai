'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ChevronRight, ChevronDown } from 'lucide-react';

// Define a MindmapNode type for strong typing
interface MindmapNode {
  text: string;
  definition?: string;
  children?: MindmapNode[];
}

interface MindmapData {
  root: MindmapNode;
}

interface MindmapEditDialogProps {
  open: boolean;
  mindmapData: MindmapData;
  onSave: (updatedData: MindmapData) => void;
  onClose: () => void;
}

interface NodeEditorProps {
  node: MindmapNode;
  path: number[];
  onUpdate: (path: number[], updatedNode: MindmapNode) => void;
  onDelete: (path: number[]) => void;
  onAddChild: (path: number[]) => void;
  isRoot?: boolean;
  level: number;
}

function NodeEditor({ node, path, onUpdate, onDelete, onAddChild, isRoot = false, level }: NodeEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);
  const [editDefinition, setEditDefinition] = useState(node.definition || '');

  const handleSave = () => {
    onUpdate(path, {
      ...node,
      text: editText.trim(),
      definition: editDefinition.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(node.text);
    setEditDefinition(node.definition || '');
    setIsEditing(false);
  };

  const hasChildren = node.children && node.children.length > 0;
  const indentLevel = Math.min(level * 16, 64); // Cap indentation on mobile

  return (
    <div className="w-full">
      <Card className={`mb-2 ${isRoot ? 'border-primary bg-primary/5' : ''}`} style={{ marginLeft: `${indentLevel}px` }}>
        <CardHeader className="pb-2 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 flex-shrink-0"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              )}
              {!hasChildren && <div className="w-5 flex-shrink-0" />}
              
              <CardTitle className="text-xs font-medium text-muted-foreground truncate">
                {isRoot ? 'Root Topic' : `Level ${level} Node`}
              </CardTitle>
            </div>
            
            <div className="flex gap-1 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="h-6 w-6 sm:w-auto sm:px-2 p-0 text-xs"
                onClick={() => onAddChild(path)}
                title="Add child node"
              >
                <Plus className="h-3 w-3" />
                <span className="hidden sm:inline ml-1">Add</span>
              </Button>
              
              {!isRoot && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  onClick={() => onDelete(path)}
                  title="Delete node"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 pb-3">
          {isEditing ? (
            <div className="space-y-2">
              <div>
                <Label htmlFor={`text-${path.join('-')}`} className="text-xs">Text</Label>
                <Input
                  id={`text-${path.join('-')}`}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm h-8"
                  placeholder="Enter node text"
                />
              </div>
              
              <div>
                <Label htmlFor={`definition-${path.join('-')}`} className="text-xs">Definition (optional)</Label>
                <Textarea
                  id={`definition-${path.join('-')}`}
                  value={editDefinition}
                  onChange={(e) => setEditDefinition(e.target.value)}
                  className="text-sm min-h-[50px] resize-none"
                  placeholder="Enter definition or description"
                />
              </div>
              
              <div className="flex gap-1">
                <Button size="sm" className="h-7 px-3 text-xs" onClick={handleSave} disabled={!editText.trim()}>
                  Save
                </Button>
                <Button size="sm" className="h-7 px-3 text-xs" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm break-words">{node.text}</p>
                  {node.definition && (
                    <p className="text-xs text-muted-foreground mt-1 break-words">{node.definition}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs flex-shrink-0"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child, index) => (
            <NodeEditor
              key={index}
              node={child}
              path={[...path, index]}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function MindmapEditDialog({ open, mindmapData, onSave, onClose }: MindmapEditDialogProps) {
  const [editedData, setEditedData] = useState<MindmapData>(mindmapData);

  // Update local state when mindmapData changes
  useEffect(() => {
    setEditedData(mindmapData);
  }, [mindmapData]);

  const updateNode = (path: number[], updatedNode: MindmapNode) => {
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as MindmapData;
      
      if (path.length === 0) {
        // Update root
        newData.root = updatedNode;
      } else {
        // Navigate to the parent and update the specific child
        let current = newData.root;
        for (let i = 0; i < path.length - 1; i++) {
          if (current.children) {
            current = current.children[path[i]];
          }
        }
        if (current.children) {
          current.children[path[path.length - 1]] = updatedNode;
        }
      }
      
      return newData;
    });
  };

  const deleteNode = (path: number[]) => {
    if (path.length === 0) return; // Can't delete root
    
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as MindmapData;
      
      // Navigate to parent and remove the child
      let current = newData.root;
      for (let i = 0; i < path.length - 1; i++) {
        if (current.children) {
          current = current.children[path[i]];
        }
      }
      if (current.children) {
        current.children.splice(path[path.length - 1], 1);
      }
      
      return newData;
    });
  };

  const addChild = (path: number[]) => {
    setEditedData(prev => {
      const newData = JSON.parse(JSON.stringify(prev)) as MindmapData;
      
      // Navigate to the target node
      let current = newData.root;
      for (const index of path) {
        if (current.children) {
          current = current.children[index];
        }
      }
      
      // Add new child
      if (!current.children) {
        current.children = [];
      }
      current.children.push({
        text: 'New Node',
        definition: '',
      });
      
      return newData;
    });
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  const handleCancel = () => {
    setEditedData(mindmapData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] w-[95vw] sm:w-full flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 sm:px-6 py-4 border-b flex-shrink-0">
          <DialogTitle className="text-lg sm:text-xl">Edit Mindmap Structure</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="space-y-3 pr-2 sm:pr-4">
            <NodeEditor
              node={editedData.root}
              path={[]}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onAddChild={addChild}
              isRoot={true}
              level={0}
            />
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 px-4 sm:px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={handleCancel} className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1 sm:flex-none">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}