import { createContext, useContext } from 'react';

interface FocusEditorContextType {
  openFocusEditor: (nodeId: string, content: string) => void;
}

const FocusEditorContext = createContext<FocusEditorContextType | undefined>(undefined);

export const FocusEditorProvider = FocusEditorContext.Provider;

export const useFocusEditor = () => {
  const context = useContext(FocusEditorContext);
  if (context === undefined) {
    throw new Error('useFocusEditor must be used within a FocusEditorProvider');
  }
  return context;
};