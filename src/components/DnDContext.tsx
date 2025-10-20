import React, { createContext, useContext, useState } from 'react';

interface DnDContextType {
  type: string | null;
  setType: (type: string | null) => void;
}

const DnDContext = createContext<DnDContextType | null>(null);

export const DnDProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [type, setType] = useState<string | null>(null);

  return (
    <DnDContext.Provider value={{ type, setType }}>
      {children}
    </DnDContext.Provider>
  );
};

export const useDnD = (): [string | null, (type: string | null) => void] => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return [context.type, context.setType];
};