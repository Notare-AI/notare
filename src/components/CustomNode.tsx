import { useReactFlow, Handle, Position } from '@xyflow/react';
import NodeToolbarComponent from './NodeToolbar';
import { useNodeLogic } from '@/hooks/useNodeLogic';
import { memo } from 'react';

interface CustomNodeData {
  label?: string;
  color?: string;
}

type CustomNodeProps = {
  id: string;
  data: CustomNodeData;
  selected?: boolean;
};

function CustomNode({ id, data, selected }: CustomNodeProps) {
  const { handleDelete, handleColorChange, handleZoomToNode, nodeStyles } = useNodeLogic(id, data.color);

  return (
    <>
      <Handle type="source" position={Position.Top} id="top-source" />
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <NodeToolbarComponent
        isVisible={selected}
        onDelete={handleDelete}
        onColorChange={handleColorChange}
        onZoomToNode={handleZoomToNode}
      />
      <div
        className="border border-solid rounded-sm p-2.5"
        style={{
          color: 'hsl(var(--foreground))',
          backgroundColor: nodeStyles.background,
          borderColor: nodeStyles.borderColor,
        }}
      >
        <div className="px-2 py-1 text-center">
          {data.label || 'New Node'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />
      <Handle type="target" position={Position.Bottom} id="bottom-target" />
    </>
  );
}

export default memo(CustomNode);