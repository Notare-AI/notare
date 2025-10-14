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
import { showError } from '@/utils/toast';
import { Loader2, Settings, Map, Minimize2 } from 'lucide-react';
import CustomNode from './CustomNode';
import EditableNoteNode from './EditableNoteNode';
import TldrNode from './TldrNode';
import KeyPointsNode from './KeyPointsNode';
import ReferenceNode from './ReferenceNode';
import CanvasToolbar, { Tool } from './CanvasToolbar';
import { useDnD } from './DnDContext';
import CustomAnimatedEdge from './CustomAnimatedEdge';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
  editableNote: EditableNoteNode,
  tldr: TldrNode,
  keyPoints: KeyPointsNode,
  reference: ReferenceNode,
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

const calculateNodeSize = (content: string | undefined) => {
  if (!content) {
    return { width: 200, height: 150 }; // Default size for empty nodes
  }

  const baseWidth = 250;
  const headerHeight = 40;
  const padding = 24;
  const baseHeight = headerHeight + padding;
  
  const charsPerLine = 35; // Approximate characters per line for a 250px width with 14px font
  const lineHeight = 20; // Approximate line height for text-sm

  // Estimate lines from both explicit newlines and wrapping
  const lines = content.split('\n').reduce((acc, line) => {
    return acc + Math.max(1, Math.ceil(line.length / charsPerLine));
  }, 0);

  let calculatedHeight = baseHeight + lines * lineHeight;

  // Clamp the height between min and max values
  const minHeight = 150;
  const maxHeight = 600;
  calculatedHeight = Math.max(minHeight, calculatedHeight);
  calculatedHeight = Math.min(maxHeight, calculatedHeight);

  return { width: baseWidth, height: calculatedHeight };
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

      const { width, height } = calculateNodeSize(content);

      const newNode: Node = {
        id: getId(),
        type: getNodeTypeFromRequest(type),
        position,
        data: { label: content, sources: sources || [] },
        style: { width, height },
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
          return;
        }

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
      };
      setNodes((nds) => nds.concat(newNode));
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
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, type, setNodes]
  );

  const onDragLeave = useCallback((event: React.DragEvent) => {
    dragLeaveTimer.current = window.setTimeout(() => {
      setIsDragOver(false);
    }, 100);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
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
    </div>
  );
};

export default FlowCanvas;