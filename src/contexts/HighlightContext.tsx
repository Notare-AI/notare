import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface HighlightContextType {
  highlightedText: string[] | null;
  setHighlightedText: (text: string[] | null) => void;
  isPdfSidebarOpen: boolean;
  setIsPdfSidebarOpen: (isOpen: boolean) => void;
  targetPage: number | null;
  setTargetPage: (page: number | null) => void;
}

const HighlightContext = createContext<HighlightContextType | undefined>(undefined);

export const HighlightProvider = ({ children }: { children: ReactNode }) => {
  const [highlightedText, setHighlightedText] = useState<string[] | null>(null);
  const [isPdfSidebarOpen, setIsPdfSidebarOpen] = useState(false);
  const [targetPage, setTargetPage] = useState<number | null>(null);

  const value = useMemo(() => ({
    highlightedText,
    setHighlightedText,
    isPdfSidebarOpen,
    setIsPdfSidebarOpen,
    targetPage,
    setTargetPage
  }), [highlightedText, isPdfSidebarOpen, targetPage]);

  return (
    <HighlightContext.Provider value={value}>
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