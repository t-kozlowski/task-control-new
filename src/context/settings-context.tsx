// src/context/settings-context.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

interface SettingsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKey = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        throw new Error('Nie udało się pobrać konfiguracji klucza API.');
      }
      const data = await res.json();
      setApiKey(data.apiKey || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Wystąpił nieznany błąd.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApiKey();
  }, [fetchApiKey]);

  return (
    <SettingsContext.Provider value={{ apiKey, setApiKey, isLoading, error }}>
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
