import { memo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, NodeProps, useReactFlow, Node } from '@xyflow/react';
import { cn } from '@/lib/utils';
import LexicalEditor from '@/components/lexical/LexicalEditor';
import { NodeToolbar } from '@/components/nodes/NodeToolbar';
import { getLuminance } from '@/lib/colorUtils';

const EditableNoteNode = ({ id, data, selected, dragging }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditable, setIsEditable] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Separate state for active editing

  const handleDoubleClick = useCallback(() => {
    setIsEditable(true);
    setIsEditing(true);
  }, []);

  const handleEditorChange = useCallback((content: string) => {
    setNodes((nodes: Node[]) =>
      nodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: content } };
        }
        return node;
      })
    );
  }, [id, setNodes]);

  const handleBlur = useCallback(() => {
    setIsEditable(false);
    setIsEditing(false);
  }, []);

  // When the node is selected but not being actively edited, it should not be editable.
  // It becomes editable only on double-click.
  useEffect(() => {
    if (selected && !isEditing) {
      setIsEditable(false);
    }
  }, [selected, isEditing]);

  const nodeColor = data.color || '#f0f0f0';
  const textColor = getLuminance(nodeColor) > 0.5 ? 'black' : 'white';
  const borderColor = getLuminance(nodeColor) > 0.5 ? 'border-gray-300' : 'border-gray-500';

  return (
    <div
      className={cn(
        "editable-note-node nowheel nodrag rounded-lg border shadow-md overflow-hidden flex flex-col h-full",
        selected ? "ring-2 ring-blue-500 shadow-lg" : "",
        borderColor
      )}
      style={{ backgroundColor: nodeColor, color: textColor }}
      onDoubleClick={handleDoubleClick}
      onBlur={handleBlur} // Using onBlur on the container to detect when focus is lost
    >
      <NodeToolbar
        nodeId={id}
        isEditing={isEditing}
        isEditable={isEditable}
        setIsEditable={setIsEditable}
        setIsEditing={setIsEditing}
        nodeType="Note"
        nodeColor={nodeColor}
      />
      <div className="p-2 pt-1 flex-grow">
        <LexicalEditor
          initialValue={data.label}
          onChange={handleEditorChange}
          isEditable={isEditable}
          showToolbar={isEditable}
        />
      </div>
      <Handle type="target" position={Position.Top} className="w-4 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-4 !bg-orange-500" />
    </div>
  );
};

export default memo(EditableNoteNode);