import React, { useRef, useEffect, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

interface SelectionRectangleProps {
  isEnabled: boolean;
}

const SelectionRectangle: React.FC<SelectionRectangleProps> = ({ isEnabled }) => {
  const { getNodes, setNodes, screenToFlowPosition } = useReactFlow();
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = document.querySelector('.react-flow__pane') as HTMLDivElement;
    if (canvas) {
      canvasRef.current = canvas;
    }
  }, []);

  useEffect(() => {
    if (!isEnabled || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleMouseDown = (event: MouseEvent) => {
      // Only start selection if clicking on empty canvas space
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setStartPoint({ x, y });
      setEndPoint({ x, y });
      setIsSelecting(true);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!isSelecting || !startPoint) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setEndPoint({ x, y });
    };

    const handleMouseUp = () => {
      if (!isSelecting || !startPoint || !endPoint) {
        setIsSelecting(false);
        setStartPoint(null);
        setEndPoint(null);
        return;
      }

      // Calculate selection bounds
      const minX = Math.min(startPoint.x, endPoint.x);
      const maxX = Math.max(startPoint.x, endPoint.x);
      const minY = Math.min(startPoint.y, endPoint.y);
      const maxY = Math.max(startPoint.y, endPoint.y);

      // Convert screen coordinates to flow coordinates
      const flowMin = screenToFlowPosition({ x: minX, y: minY });
      const flowMax = screenToFlowPosition({ x: maxX, y: maxY });

      // Find nodes within selection bounds
      const nodes = getNodes();
      const selectedNodeIds = nodes
        .filter(node => {
          const nodeCenterX = node.position.x + (node.width || 0) / 2;
          const nodeCenterY = node.position.y + (node.height || 0) / 2;
          return (
            nodeCenterX >= flowMin.x &&
            nodeCenterX <= flowMax.x &&
            nodeCenterY >= flowMin.y &&
            nodeCenterY <= flowMax.y
          );
        })
        .map(node => node.id);

      // Update node selection
      setNodes(nodes =>
        nodes.map(node => ({
          ...node,
          selected: selectedNodeIds.includes(node.id),
        }))
      );

      setIsSelecting(false);
      setStartPoint(null);
      setEndPoint(null);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isEnabled, isSelecting, startPoint, endPoint, getNodes, setNodes, screenToFlowPosition]);

  if (!isSelecting || !startPoint || !endPoint) return null;

  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);
  const left = Math.min(startPoint.x, endPoint.x);
  const top = Math.min(startPoint.y, endPoint.y);

  return (
    <div
      className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none z-50"
      style={{
        left,
        top,
        width,
        height,
      }}
    />
  );
};

export default SelectionRectangle;