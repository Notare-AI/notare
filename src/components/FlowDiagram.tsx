import { ReactFlowProvider } from '@xyflow/react';
import FlowCanvas from './FlowCanvas';
import { DnDProvider } from './DnDContext';

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
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <FlowCanvas
          canvasId={canvasId}
          newNodeRequest={newNodeRequest}
          onNodeAdded={onNodeAdded}
          onSettingsClick={onSettingsClick}
        />
      </DnDProvider>
    </ReactFlowProvider>
  );
};

export default FlowDiagram;