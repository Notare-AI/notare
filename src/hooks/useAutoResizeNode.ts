import { useEffect, useRef } from 'react';
import { useReactFlow } from '@xyflow/react';

const PADDING = 24;
const HEADER_HEIGHT = 40;
const MIN_HEIGHT = 150;
const MAX_HEIGHT = 800;

export const useAutoResizeNode = (nodeId: string, content: string) => {
  const { getNode, setNodes } = useReactFlow();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = getNode(nodeId);
    if (!node || !contentRef.current) {
      return;
    }

    // We need a brief timeout to allow the DOM to update after content changes
    const timer = setTimeout(() => {
      if (!contentRef.current) return;
      
      const scrollHeight = contentRef.current.scrollHeight;
      const newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, scrollHeight + PADDING + HEADER_HEIGHT));

      if (node.style?.height !== newHeight) {
        setNodes((nodes) =>
          nodes.map((n) => {
            if (n.id === nodeId) {
              return {
                ...n,
                style: { ...n.style, height: newHeight },
              };
            }
            return n;
          })
        );
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [content, nodeId, getNode, setNodes]);

  return contentRef;
};