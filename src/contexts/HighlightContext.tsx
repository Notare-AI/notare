import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HighlightContextType {
  highlightedText: string[] | null;
  setHighlightedText: (text: string[] | null) => void;
  isPdfSidebarOpen: boolean;
  setIsPdfSidebarOpen: (isOpen: boolean) => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider = ({ children }: { children: ReactNode }) => {
  const [highlightedText, setHighlightedText] = useState<string[] | null>(null);
  const [isPdfSidebarOpen, setIsPdfSidebarOpen] = useState(false);

  return (
    <HighlightContext.Provider value={{ highlightedText, setHighlightedText, isPdfSidebarOpen, setIsPdfSidebarOpen }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => {
  const context = useContext(HighlightContext);
  if (context === undefined) {
    throw new Error('useHighlight must be used within a HighlightProvider');
  }
  return context;
};