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
  onSettingsClick: () => void;
}

const FlowDiagram = ({ canvasId, newNodeRequest, onNodeAdded, onSettingsClick }: FlowDiagramProps) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isBacklinksPanelOpen, setIsBacklinksPanelOpen] = useState(true);

  return (
    <ReactFlowProvider>
      <DnDProvider>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={75}>
            <FlowCanvas
              canvasId={canvasId}
              newNodeRequest={newNodeRequest}
              onNodeAdded={onNodeAdded}
              onSettingsClick={onSettingsClick}
              onSelectionChange={(selectedIds) => setSelectedNodeId(selectedIds[0] || null)}
              isBacklinksPanelOpen={isBacklinksPanelOpen}
              onToggleBacklinksPanel={() => setIsBacklinksPanelOpen(prev => !prev)}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={25}
            minSize={10}
            collapsible={true}
            collapsed={!isBacklinksPanelOpen}
            onCollapse={() => setIsBacklinksPanelOpen(false)}
            onExpand={() => setIsBacklinksPanelOpen(true)}
          >
            <BacklinksPanel selectedNodeId={selectedNodeId} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default FlowDiagram;