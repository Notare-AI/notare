import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  Node,
  useEdgesState,
  addEdge,
  Edge,
} from '@xyflow/react';
import CustomNode from './CustomNode';
import EditableNoteNode from './EditableNoteNode';
import TldrNode from './TldrNode';
import KeyPointsNode from './KeyPointsNode';
import ReferenceNode from './ReferenceNode';
import ImageNode from './ImageNode';
import CanvasToolbar, { Tool } from './CanvasToolbar';
import CustomAnimatedEdge from './CustomAnimatedEdge';
import NoteEditorModal from './NoteEditorModal';
import CanvasMinimap from './CanvasMinimap';
import FlowControls from './FlowControls';

// Import the new hooks
import { useCanvasData } from '@/hooks/useCanvasData';
import { useCanvasHistory } from '@/hooks/useCanvasHistory';
import { useNodeCreation } from '@/hooks/useNodeCreation';
import { useCanvasDragAndDrop } from '@/hooks/useCanvasDragAndDrop';
import { useCanvasKeyboardShortcuts } from '@/hooks/useCanvasKeyboardShortcuts';
import { useCanvasActions } from '@/hooks/useCanvasActions';
import { CanvasActionsProvider } from '@/contexts/CanvasActionsContext';


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

const FlowCanvas = ({ canvasId, newNodeRequest, onNodeAdded, onSettingsClick }: FlowCanvasProps) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [isMinimapOpen, setIsMinimapOpen] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // --- Hooks for modularity ---
  const { handleUndo, handleRedo, setInitialHistory } = useCanvasHistory({ nodes, edges, setNodes, setEdges, isInitializedRef: useRef(false) });
  const { isLoading, isInitializedRef } = useCanvasData({ canvasId, nodes, edges, setNodes, setEdges, setInitialHistory });
  const { addNode, addNodeFromRequest, addNodeOnPaneClick } = useNodeCreation({ setNodes, onNodeAdded, canvasId }); // NEW: Passed canvasId
  const { onDragOver, onDrop, onDragLeave, isDragOver } = useCanvasDragAndDrop({ onNodeAdded });
  useCanvasKeyboardShortcuts({ nodes, setNodes, setEdges, handleUndo, handleRedo, canvasId, reactFlowWrapper, onNodeAdded });
  const { downloadNodeBranch, openNodeInEditor } = useCanvasActions({ nodes, edges, setEditingNodeId });

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

  const handleSaveFromEditor = (newContent: string) => {
    if (!editingNodeId) return;

    setNodes((nodes) =>
      nodes.map((n) => {
        if (n.id === editingNodeId) {
          return { ...n, data: { ...n.data, label: newContent } };
        }
        return n;
      })
    );
    setEditingNodeId(null);
  };

  const getCurrentEditingNodeContent = () => {
    if (!editingNodeId) return '';
    const node = nodes.find(n => n.id === editingNodeId);
    return node?.data.label || '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-8 w-8 animate-spin text-gray-400" />
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
          onPaneClick={handlePaneClick}
          onDrop={handleDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          fitView
          zoomOnDoubleClick={false}
          panOnDrag={activeTool === 'pan' ? [0, 1] : [1]}
          selectionOnDrag={activeTool === 'select'}
          selectionMode="partial"
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
              : activeTool === 'select'
              ? 'cursor-pointer'
              : ''
          }
        >
          <FlowControls onSettingsClick={onSettingsClick} />
          <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#313131" />
          <CanvasMinimap isMinimapOpen={isMinimapOpen} setIsMinimapOpen={setIsMinimapOpen} />
        </ReactFlow>
      </CanvasActionsProvider>
      <CanvasToolbar activeTool={activeTool} onToolChange={setActiveTool} />
      <NoteEditorModal 
        isOpen={!!editingNodeId} 
        onOpenChange={(isOpen) => !isOpen && setEditingNodeId(null)}
        initialContent={getCurrentEditingNodeContent()}
        onSave={handleSaveFromEditor}
      />
    </div>
  );
};

export default FlowCanvas;