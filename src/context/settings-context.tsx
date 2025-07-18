// src/context/settings-context.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSetApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey: handleSetApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
