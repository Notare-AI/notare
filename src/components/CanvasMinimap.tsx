import { MiniMap } from '@xyflow/react';
import { Map, Minimize2 } from 'lucide-react';
import React from 'react';

interface CanvasMinimapProps {
  isMinimapOpen: boolean;
  setIsMinimapOpen: (isOpen: boolean) => void;
}

const CanvasMinimap = ({ isMinimapOpen, setIsMinimapOpen }: CanvasMinimapProps) => {
  return (
    <>
      {isMinimapOpen && (
        <MiniMap 
          style={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
          }}
          nodeColor={(node) => {
            if (node.style?.backgroundColor) return node.style.backgroundColor;
            return 'hsl(var(--primary))'; // Changed from accent to primary
          }}
          nodeStrokeColor={'hsl(var(--border))'}
          maskColor={'hsla(var(--background), 0.8)'}
        />
      )}
      <div 
        className="absolute right-4 z-10 transition-all duration-200 ease-in-out"
        style={{ bottom: isMinimapOpen ? '170px' : '1rem' }}
      >
        <button
          onClick={() => setIsMinimapOpen(!isMinimapOpen)}
          title={isMinimapOpen ? 'Hide Minimap' : 'Show Minimap'}
          className="bg-card text-foreground w-8 h-8 flex items-center justify-center rounded-sm border border-border shadow-md hover:bg-accent"
        >
          {isMinimapOpen ? <Minimize2 size={16} /> : <Map size={16} />}
        </button>
      </div>
    </>
  );
};

export default CanvasMinimap;