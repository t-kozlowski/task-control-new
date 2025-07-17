'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface AppContextType {
  isZenMode: boolean;
  toggleZenMode: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isZenMode, setIsZenMode] = useState(false);

  const toggleZenMode = () => {
    setIsZenMode(prev => !prev);
  };

  return (
    <AppContext.Provider value={{ isZenMode, toggleZenMode }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
