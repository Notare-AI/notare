import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant, ReactFlowProvider } from '@xyflow/react';
import UserNode from '@/components/UserNode';

import '@xyflow/react/dist/style.css';

const nodeTypes = {
  user: UserNode,
};

const initialNodes = [
  {
    id: '1',
    type: 'user',
    position: { x: 250, y: 50 },
    data: { name: 'Jane Doe', role: 'CEO', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
  },
  {
    id: '2',
    type: 'user',
    position: { x: 100, y: 200 },
    data: { name: 'John Smith', role: 'Head of Engineering', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e' },
  },
  {
    id: '3',
    type: 'user',
    position: { x: 400, y: 200 },
    data: { name: 'Emily White', role: 'Head of Design', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f' },
  },
  {
    id: '4',
    type: 'user',
    position: { x: 100, y: 400 },
    data: { name: 'Michael Brown', role: 'Frontend Developer', avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704g' },
  },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: 'hsl(var(--foreground))' } },
  { id: 'e1-3', source: '1', target: '3', animated: true, style: { stroke: 'hsl(var(--foreground))' } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: 'hsl(var(--foreground))' } },
];

const GuiDemoFlow = () => {
  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <ReactFlow
        nodes={initialNodes}
        edges={initialEdges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}

const GuiDemoPage = () => {
  return (
    <ReactFlowProvider>
      <GuiDemoFlow />
    </ReactFlowProvider>
  );
};

export default GuiDemoPage;