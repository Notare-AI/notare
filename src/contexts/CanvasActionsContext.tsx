import { createContext, useContext } from 'react';

interface CanvasActionsContextType {
  downloadNodeBranch: (nodeId: string) => void;
  openNodeInEditor: (nodeId: string, content: string) => void;
}

const CanvasActionsContext = createContext<CanvasActionsContextType | undefined>(undefined);

export const CanvasActionsProvider = CanvasActionsContext.Provider;

export const useCanvasActions = () => {
  const context = useContext(CanvasActionsContext);
  if (context === undefined) {
    throw new Error('useCanvasActions must be used within a CanvasActionsProvider');
  }
  return context;
};