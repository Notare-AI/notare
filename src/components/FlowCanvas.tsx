import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  Node,
  useReactFlow,
  ControlButton,
  useEdgesState,
  addEdge,
  Edge,
  MiniMap,
} from '@xyflow/react';
import { supabase } from '@/integrations/supabase/client';
import { showError, showSuccess, showLoading, dismissToast } from '@/utils/toast';
import { Loader2, Settings, Map, Minimize2 } from 'lucide-react';
import CustomNode from './CustomNode';
import EditableNoteNode from './EditableNoteNode';
import TldrNode from './TldrNode';
import KeyPointsNode from './KeyPointsNode';
import ReferenceNode from './ReferenceNode';
import ImageNode from './ImageNode';
import CanvasToolbar, { Tool } from './CanvasToolbar';
import { useDnD } from './DnDContext';
import CustomAnimatedEdge from './CustomAnimatedEdge';
import { CanvasActionsProvider } from '@/contexts/CanvasActionsContext';
import NoteEditorModal from './NoteEditorModal';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
  editableNote: EditableNoteNode,
  tldr: TldrNode,
  keyPoints: KeyPointsNode,
  reference: ReferenceNode,
  image: ImageNode,
};

const edgeTypes = {
  customAnimated: CustomAnimatedEdge,
};

let id = 0;
const getId = () => `node_${+new Date()}_${id++}`;

interface NewNodeRequest {
  type: string;
  content: string;
  sources?: string[];
}

interface FlowCanvasProps {
  canvasId: string;
  newNodeRequest: NewNodeRequest | null;
  onNodeAdded: () => void;
  onSettingsClick: () => void;
}

const getNodeTypeFromRequest = (requestType: string): string => {
  switch (requestType) {
    case 'TLDR':
      return 'tldr';
    case 'Key Points':
      return 'keyPoints';
    case 'Reference':
      return 'reference';
    case 'Note':
      return 'editableNote';
    default:
      return 'editableNote';
  }
};

const FlowCanvas = ({ canvasId, newNodeRequest, onNodeAdded, onSettingsClick }: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const saveTimeoutRef = useRef<number | null>(null);
  const isInitializedRef = useRef(false);
  const { screenToFlowPosition, fitView, getNodes } = useReactFlow();
  const [type] = useDnD();
  const [isDragOver, setIsDragOver] = useState(false);
  const dragLeaveTimer = useRef<number | null>(null);
  const clipboardRef = useRef<Node[]>([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [editingNode, setEditingNode] = useState<{ id: string; content: string } | null>(null);

  // --- UNDO/REDO STATE ---
  const history = useRef<{ nodes: Node[]; edges: Edge[] }[]>([{ nodes: [], edges: [] }]);
  const historyIndex = useRef(0);
  const isUndoRedo = useRef(false);

  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: 'customAnimated', animated: true };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  useEffect(() => {
    if (newNodeRequest) {
      const { type, content, sources } = newNodeRequest;
      const position = screenToFlowPosition({
        x: window.innerWidth * 0.4,
        y: window.innerHeight / 3,
      });

      const newNode: Node = {
        id: getId(),
        type: getNodeTypeFromRequest(type),
        position,
        data: { label: content, sources: sources || [] },
        style: { width: 250 }, // Nodes will now auto-determine their height
      };

      setNodes((nds) => nds.concat(newNode));
      onNodeAdded();

      setTimeout(() => {
        fitView({ nodes: [{ id: newNode.id }], duration: 500, padding: 0.2 });
      }, 100);
    }
  }, [newNodeRequest, onNodeAdded, screenToFlowPosition, setNodes, fitView]);

  useEffect(() => {
    if (!canvasId) return;

    isInitializedRef.current = false;
    setIsLoading(true);

    const fetchCanvasData = async () => {
      const { data, error } = await supabase
        .from('canvases')
        .select('canvas_data')
        .eq('id', canvasId)
        .single();

      if (error) {
        showError('Failed to load canvas data.');
        console.error(error);
        setIsLoading(false);
        return;
      }

      if (data && data.canvas_data) {
        const { nodes: dbNodes = [], edges: dbEdges = [] } = data.canvas_data as { nodes: Node[], edges: Edge[] };
        const typedNodes = dbNodes.map(n => ({ ...n, type: n.type || 'custom' }));
        setNodes(typedNodes);
        setEdges(dbEdges);
        history.current = [{ nodes: typedNodes, edges: dbEdges }];
        historyIndex.current = 0;
      } else {
        setNodes([]);
        setEdges([]);
        history.current = [{ nodes: [], edges: [] }];
        historyIndex.current = 0;
      }
      setIsLoading(false);
      setTimeout(() => {
        isInitializedRef.current = true;
      }, 100);
    };

    fetchCanvasData();
  }, [canvasId, setNodes, setEdges]);

  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    if (isUndoRedo.current) {
      isUndoRedo.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      const newHistory = history.current.slice(0, historyIndex.current + 1);
      newHistory.push({ nodes, edges });
      history.current = newHistory;
      historyIndex.current = newHistory.length - 1;

      const canvas_data = { nodes, edges };
      await supabase
        .from('canvases')
        .update({ canvas_data })
        .eq('id', canvasId);
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
      }
    };
  }, [nodes, edges, canvasId]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isUndo = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !event.shiftKey;
      const isRedo = (event.metaKey || event.ctrlKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey));

      if (isUndo) {
        event.preventDefault();
        if (historyIndex.current > 0) {
          isUndoRedo.current = true;
          const newIndex = historyIndex.current - 1;
          historyIndex.current = newIndex;
          const state = history.current[newIndex];
          setNodes(state.nodes);
          setEdges(state.edges);
        }
        return;
      }

      if (isRedo) {
        event.preventDefault();
        if (historyIndex.current < history.current.length - 1) {
          isUndoRedo.current = true;
          const newIndex = historyIndex.current + 1;
          historyIndex.current = newIndex;
          const state = history.current[newIndex];
          setNodes(state.nodes);
          setEdges(state.edges);
        }
        return;
      }

      const isCopy = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'c';
      const isPaste = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'v';

      if (isCopy) {
        const selectedNodes = getNodes().filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          clipboardRef.current = JSON.parse(JSON.stringify(selectedNodes));
        }
      }

      if (isPaste) {
        if (clipboardRef.current.length === 0) {
          // No nodes in our internal clipboard, so let the native paste event handle it (e.g., for images).
          return;
        }

        // We have nodes to paste, so handle it and prevent the native paste event.
        event.preventDefault();

        const pastedNodes = clipboardRef.current.map((node: Node) => {
          const newNode: Node = {
            ...node,
            id: getId(),
            position: {
              x: node.position.x + 25,
              y: node.position.y + 25,
            },
            selected: true,
          };
          return newNode;
        });

        setNodes((currentNodes) => [
          ...currentNodes.map(n => ({ ...n, selected: false })),
          ...pastedNodes
        ]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [getNodes, setNodes, setEdges]);

  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      if (!canvasId) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const items = event.clipboardData?.items;
      if (!items) return;

      let imageFile: File | null = null;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          imageFile = item.getAsFile();
          break;
        }
      }

      if (!imageFile) return;

      event.preventDefault();
      const toastId = showLoading('Uploading image...');

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You must be logged in to upload images.');

        const fileExt = imageFile.name.split('.').pop() || 'png';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `${user.id}/${canvasId}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('canvas_images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('canvas_images').getPublicUrl(filePath);
        if (!publicUrl) throw new Error('Could not get public URL for the image.');

        const pane = reactFlowWrapper.current?.querySelector('.react-flow__pane');
        if (!pane) throw new Error("Could not determine paste location.");
        
        const { top, left, width, height } = pane.getBoundingClientRect();
        const position = screenToFlowPosition({ x: left + width / 2, y: top + height / 2 });

        const image = new Image();
        image.onload = () => {
          const aspectRatio = image.width / image.height;
          const defaultWidth = 300;
          const defaultHeight = defaultWidth / aspectRatio;

          const newNode: Node = {
            id: getId(), type: 'image', position,
            data: { src: publicUrl, alt: imageFile?.name },
            style: { width: defaultWidth, height: defaultHeight },
          };
          setNodes((nds) => nds.concat(newNode));
          dismissToast(toastId);
          showSuccess('Image pasted successfully!');
        };
        image.onerror = () => {
          const newNode: Node = {
            id: getId(), type: 'image', position,
            data: { src: publicUrl, alt: imageFile?.name },
            style: { width: 300, height: 200 },
          };
          setNodes((nds) => nds.concat(newNode));
          dismissToast(toastId);
          showSuccess('Image pasted successfully!');
        };
        image.src = publicUrl;

      } catch (error: any) {
        dismissToast(toastId);
        showError(error.message || 'Failed to paste image.');
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [canvasId, screenToFlowPosition, setNodes]);

  useEffect(() => {
    return () => {
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
      }
      setIsDragOver(false);
    };
  }, []);

  const onPaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool !== 'note') return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `node_${+new Date()}`;
      const newNode: Node = {
        id,
        type: 'editableNote',
        position,
        data: { label: '' },
        style: { width: 200, height: 150 },
        selected: true,
      };
      setNodes((nds) => nds.map(n => ({...n, selected: false})).concat(newNode));
      setActiveTool('select');
    },
    [activeTool, screenToFlowPosition, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    if (dragLeaveTimer.current) {
      clearTimeout(dragLeaveTimer.current);
      dragLeaveTimer.current = null;
    }
    
    if (type && !isDragOver) {
      setIsDragOver(true);
    }
  }, [type, isDragOver]);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      
      if (dragLeaveTimer.current) {
        clearTimeout(dragLeaveTimer.current);
        dragLeaveTimer.current = null;
      }

      if (!type) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: getId(),
        type: type,
        position,
        data: { label: '' },
        style: { width: 200, height: 150 },
        selected: true,
      };

      setNodes((nds) => nds.map(n => ({...n, selected: false})).concat(newNode));
    },
    [screenToFlowPosition, type, setNodes]
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    dragLeaveTimer.current = window.setTimeout(() => {
      setIsDragOver(false);
    }, 100);
  }, []);

  const downloadNodeBranch = useCallback((startNodeId: string) => {
    const startNode = nodes.find(n => n.id === startNodeId);
    if (!startNode) {
      showError("Could not find the starting node.");
      return;
    }

    const queue: string[] = [startNodeId];
    const visited = new Set<string>([startNodeId]);
    const branchNodes: Node[] = [startNode];

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      const connectedEdges = edges.filter(edge => edge.source === currentNodeId || edge.target === currentNodeId);

      for (const edge of connectedEdges) {
        const neighborId = edge.source === currentNodeId ? edge.target : edge.source;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push(neighborId);
          const neighborNode = nodes.find(n => n.id === neighborId);
          if (neighborNode) {
            branchNodes.push(neighborNode);
          }
        }
      }
    }

    const textNodes = branchNodes.filter(n => n.type !== 'image');
    const startTextNode = textNodes.find(n => n.id === startNodeId);

    if (!startTextNode) {
        showError("The selected node has no text content to export.");
        return;
    }

    let markdownContent = `# ${startTextNode.data.label || 'Untitled Note'}\n\n`;
    
    const otherNodes = textNodes.filter(n => n.id !== startNodeId);

    otherNodes.forEach(node => {
      const title = node.data.label?.split('\n')[0] || 'Untitled';
      const type = node.type?.replace(/([A-Z])/g, ' $1').replace(/^./, (str: string) => str.toUpperCase()) || 'Note';
      markdownContent += `---\n\n## ${type}: ${title}\n\n${node.data.label || ''}\n\n`;
    });

    const filename = `${(startNode.data.label || 'canvas_branch').substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccess("Branch downloaded successfully!");
  }, [nodes, edges]);

  const openNodeInEditor = useCallback((nodeId: string, content: string) => {
    setEditingNode({ id: nodeId, content });
  }, []);

  const handleSaveFromEditor = (newContent: string) => {
    if (!editingNode) return;

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === editingNode.id) {
          return { ...n, data: { ...n.data, label: newContent } };
        }
        return n;
      })
    );
    setEditingNode(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <CanvasActionsProvider value={{ downloadNodeBranch, openNodeInEditor }}>
        {isDragOver && (
          <div className="absolute inset-0 bg-blue-500/10 border-2 border-dashed border-blue-500 rounded-lg z-10 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500/90 text-white px-4 py-2 rounded-lg font-medium">
              Drop to create note
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          fitView
          zoomOnDoubleClick={false}
          panOnDrag={activeTool === 'pan' ? [0, 1] : [1]}
          selectionOnDrag={activeTool === 'select'}
          nodesDraggable={activeTool === 'select'}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          deleteKeyCode={['Backspace', 'Delete']}
          proOptions={{ hideAttribution: true }}
          minZoom={0.1}
          snapToGrid={true}
          snapGrid={[15, 15]}
          multiSelectionKeyCode="Shift"
          className={
            activeTool === 'pan'
              ? 'cursor-grab'
              : activeTool === 'note'
              ? 'cursor-crosshair'
              : ''
          }
        >
          <Controls>
            <ControlButton onClick={onSettingsClick} title="Settings" className="order-first">
              <Settings size={16} />
            </ControlButton>
          </Controls>
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#313131" />
          {isMinimapOpen && (
            <MiniMap 
              style={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
              }}
              nodeColor={(node) => {
                if (node.style?.backgroundColor) return node.style.backgroundColor;
                return 'hsl(var(--accent))';
              }}
              nodeStrokeColor={'hsl(var(--border))'}
              maskColor={'hsla(var(--background), 0.8)'}
            />
          )}
        </ReactFlow>
      </CanvasActionsProvider>
      <div 
        className="absolute right-4 z-10 transition-all duration-200 ease-in-out"
        style={{ bottom: isMinimapOpen ? '170px' : '1rem' }}
      >
        <button
          onClick={() => setIsMinimapOpen(!isMinimapOpen)}
          title={isMinimapOpen ? 'Hide Minimap' : 'Show Minimap'}
          className="bg-card text-foreground w-8 h-8 flex items-center justify-center rounded-sm border border-border shadow-md hover:bg-accent"
        >
          {isMinimapOpen ? <Minimize2 size={16} /> : <Map size={16} />}
        </button>
      </div>
      <CanvasToolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <NoteEditorModal
        isOpen={!!editingNode}
        onOpenChange={(isOpen) => !isOpen && setEditingNode(null)}
        initialContent={editingNode?.content || ''}
        onSave={handleSaveFromEditor}
      />
    </div>
  );
};

export default FlowCanvas;