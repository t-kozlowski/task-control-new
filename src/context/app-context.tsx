'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { User } from '@/types';
import { usePathname, useRouter } from 'next/navigation';

interface AppContextType {
  isZenMode: boolean;
  toggleZenMode: () => void;
  loggedInUser: User | null;
  setLoggedInUser: (user: User | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isZenMode, setIsZenMode] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('loggedInUser');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      } else if (pathname !== '/login') {
        router.push('/login');
      }
    } catch (error) {
       if (pathname !== '/login') {
        router.push('/login');
      }
    }
  }, [pathname, router]);

  const handleSetLoggedInUser = (user: User | null) => {
    setLoggedInUser(user);
    if (user) {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      router.push('/');
    } else {
      localStorage.removeItem('loggedInUser');
      router.push('/login');
    }
  };

  const toggleZenMode = () => {
    setIsZenMode(prev => !prev);
  };

  const contextValue = {
    isZenMode,
    toggleZenMode,
    loggedInUser,
    setLoggedInUser: handleSetLoggedInUser,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp musi być używane wewnątrz AppProvider');
  }
  return context;
};
