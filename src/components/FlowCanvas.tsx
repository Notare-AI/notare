import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Viewport,
  useReactFlow,
  Node,
  SelectionMode, // Import SelectionMode
} from '@xyflow/react';
import CustomNode from './CustomNode';
import EditableNoteNode from './EditableNoteNode';
import TldrNode from './TldrNode';
import KeyPointsNode from './KeyPointsNode';
import ReferenceNode from './ReferenceNode';
import ImageNode from './ImageNode';
import YouTubeVideoNode from './YouTubeVideoNode'; // New import
import CanvasToolbar, { Tool } from './CanvasToolbar';
import CustomAnimatedEdge from './CustomAnimatedEdge';
import FlowControls from './FlowControls';
import BacklinksToggleButton from './BacklinksToggleButton';
import AddYoutubeVideoModal from './AddYoutubeVideoModal'; // New import

// Import the new hooks
import { useCanvasData } from '@/hooks/useCanvasData';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { useNodeCreation } from '@/hooks/useNodeCreation';
import { useCanvasDragAndDrop } from '@/hooks/useCanvasDragAndDrop';
import { useCanvasKeyboardShortcuts } from '@/hooks/useCanvasKeyboardShortcuts';
import { useCanvasActions } from '@/hooks/useCanvasActions';
import { useImageUpload } from '@/hooks/useImageUpload';
import { CanvasActionsProvider } from '@/contexts/CanvasActionsContext';
import { markdownToLexicalJson } from '@/lib/markdownToLexical';


import '@xyflow/react/dist/style.css';

const nodeTypes = {
  custom: CustomNode,
  editableNote: EditableNoteNode,
  tldr: TldrNode,
  keyPoints: KeyPointsNode,
  reference: ReferenceNode,
  image: ImageNode,
  youtubeVideo: YouTubeVideoNode, // New node type
};

const edgeTypes = {
  customAnimated: CustomAnimatedEdge,
};

interface Source { // Define Source interface here for consistency
  text: string;
  page: number;
}

interface NewNodeRequest {
  type: string;
  content: string;
  sources?: Source[]; // Changed to Source[]
}

interface FlowCanvasProps {
  canvasId: string;
  newNodeRequest: NewNodeRequest | null;
  onNodeAdded: () => void;
  onSelectionChange: (selectedIds: string[]) => void;
  isBacklinksPanelOpen: boolean;
  onToggleBacklinksPanel: () => void;
}

const FlowCanvas = ({ canvasId, newNodeRequest, onNodeAdded, onSelectionChange, isBacklinksPanelOpen, onToggleBacklinksPanel }: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef(0);
  const isInitializedRef = useRef(false);
  const { getNode, screenToFlowPosition } = useReactFlow();
  const [isAddYoutubeVideoModalOpen, setIsAddYoutubeVideoModalOpen] = useState(false); // New state

  // --- Hooks for modularity ---
  const { handleUndo, handleRedo, setInitialHistory } = useCanvasHistory({ nodes, edges, setNodes, setEdges, isInitializedRef });
  const { isLoading } = useCanvasData({ canvasId, nodes, edges, setNodes, setEdges, setInitialHistory, isInitializedRef });
  const { addNode, addNodeFromRequest, addNodeOnPaneClick } = useNodeCreation({ setNodes, onNodeAdded });
  const { onDragOver, onDrop, onDragLeave, isDragOver } = useCanvasDragAndDrop({ onNodeAdded });
  useCanvasKeyboardShortcuts({ nodes, setNodes, setEdges, handleUndo, handleRedo, canvasId, reactFlowWrapper, onNodeAdded, setActiveTool });
  const { downloadNodeBranch } = useCanvasActions({ nodes, edges });
  const { uploadAndAddImageNode } = useImageUpload({ canvasId, setNodes, reactFlowWrapper });

  // --- Effects ---
  useEffect(() => {
    if (newNodeRequest) {
      addNodeFromRequest(newNodeRequest);
    }
  }, [newNodeRequest, addNodeFromRequest]);

  // --- Callbacks ---
  const onConnect = useCallback(
    (connection: any) => {
      const edge = { ...connection, type: 'customAnimated', animated: true };
      setEdges((eds) => addEdge(edge, eds));
    },
    [setEdges]
  );

  const addNodeFromMessage = useCallback((content: string, parentNodeId: string) => {
    const parentNode = getNode(parentNodeId);
    if (!parentNode) {
      console.error("Parent node not found for adding message to canvas");
      const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
      addNode('Note', markdownToLexicalJson(content), position);
      return;
    }

    const position = {
      x: parentNode.position.x + (parentNode.width || 200) + 50,
      y: parentNode.position.y,
    };

    addNode('Note', markdownToLexicalJson(content), position, [], false, parentNodeId, parentNode.data.color as string); // Cast parentNode.data.color to string
  }, [getNode, addNode, screenToFlowPosition]);

  const onMove = useCallback((_, viewport: Viewport) => {
    const wrapperBounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!wrapperBounds) {
      return;
    }

    cancelAnimationFrame(animationFrameId.current);

    animationFrameId.current = requestAnimationFrame(() => {
      setNodes((nds) => {
        const viewWidth = wrapperBounds.width;
        const viewHeight = wrapperBounds.height;

        const visibleArea = {
          x1: -viewport.x / viewport.zoom,
          y1: -viewport.y / viewport.zoom,
          x2: (-viewport.x + viewWidth) / viewport.zoom,
          y2: (-viewport.y + viewHeight) / viewport.zoom,
        };

        const buffer = 200;

        return nds.map((node) => {
          const nodeWidth = node.width || 300;
          const nodeHeight = node.height || 200;

          const nodeIsVisible =
            node.position.x + nodeWidth > visibleArea.x1 - buffer &&
            node.position.x < visibleArea.x2 + buffer &&
            node.position.y + nodeHeight > visibleArea.y1 - buffer &&
            node.position.y < visibleArea.y2 + buffer;

          if (!!node.hidden === !nodeIsVisible) {
            return node;
          }

          return { ...node, hidden: !nodeIsVisible };
        });
      });
    });
  }, [setNodes]);

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      if (activeTool === 'note') {
        addNodeOnPaneClick(event);
      }
    },
    [activeTool, addNodeOnPaneClick]
  );

  const handleDrop = useCallback((event: React.DragEvent) => {
    onDrop(event, setNodes);
  }, [onDrop, setNodes]);

  const handleSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    onSelectionChange(nodes.map(n => n.id));
  }, [onSelectionChange]);

  const handleAddYoutubeVideo = useCallback((videoId: string, title: string) => {
    const position = screenToFlowPosition({
      x: window.innerWidth * 0.4,
      y: window.innerHeight / 3,
    });
    addNode('youtubeVideo', videoId, position, [], false, undefined, undefined, { title });
  }, [addNode, screenToFlowPosition]);

  const canvasActions = useMemo(() => ({ downloadNodeBranch, addNodeFromMessage }), [downloadNodeBranch, addNodeFromMessage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" ref={reactFlowWrapper}>
      <CanvasActionsProvider value={canvasActions}>
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
          onPaneClick={handlePaneClick}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onMove={onMove}
          onSelectionChange={handleSelectionChange}
          fitView
          zoomOnDoubleClick={false}
          panOnDrag={activeTool === 'pan' ? [0, 1] : [1]}
          selectionOnDrag={activeTool === 'select'}
          // Removed selectionMode="partial" as it's not a valid type
          nodesDraggable={activeTool === 'select'}
          elementsSelectable={activeTool === 'select'}
          nodesConnectable={activeTool === 'select'}
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
          <FlowControls />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#313131" />
           <div 
            className="absolute right-4 bottom-4 z-10"
          >
            <BacklinksToggleButton
              onClick={onToggleBacklinksPanel}
              isActive={isBacklinksPanelOpen}
            />
          </div>
        </ReactFlow>
      </CanvasActionsProvider>
      <CanvasToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onImageUpload={uploadAndAddImageNode}
        onAddYoutubeVideo={() => setIsAddYoutubeVideoModalOpen(true)} // Open modal
      />
      <AddYoutubeVideoModal
        isOpen={isAddYoutubeVideoModalOpen}
        onOpenChange={setIsAddYoutubeVideoModalOpen}
        onAddVideo={handleAddYoutubeVideo}
      />
    </div>
  );
};

export default FlowCanvas;