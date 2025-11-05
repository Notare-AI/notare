import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './FlowCanvas';
import { DnDProvider } from './DnDContext';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import BacklinksPanel from './BacklinksPanel';

interface NewNodeRequest {
  type: string;
  content: string;
}

interface FlowDiagramProps {
  canvasId: string;
  newNodeRequest: NewNodeRequest | null;
  onNodeAdded: () => void;
}

const FlowDiagram = ({ canvasId, newNodeRequest, onNodeAdded }: FlowDiagramProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isBacklinksPanelOpen, setIsBacklinksPanelOpen] = useState(true);

  const flowCanvasProps = {
    canvasId,
    newNodeRequest,
    onNodeAdded,
    onSelectionChange: (selectedIds: string[]) => setSelectedNodeId(selectedIds[0] || null),
    isBacklinksPanelOpen,
    onToggleBacklinksPanel: () => setIsBacklinksPanelOpen(prev => !prev),
  };

  return (
    <ReactFlowProvider>
      <DnDProvider>
        {isBacklinksPanelOpen ? (
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={75}>
              <FlowCanvas {...flowCanvasProps} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={10}>
              <BacklinksPanel selectedNodeId={selectedNodeId} />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <FlowCanvas {...flowCanvasProps} />
        )}
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default FlowDiagram;