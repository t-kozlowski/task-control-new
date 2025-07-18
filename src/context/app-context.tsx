
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import type { User } from '@/types';
import { usePathname, useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

interface AppContextType {
  loggedInUser: User | null;
  setLoggedInUser: (user: User | null) => void;
  users: User[];
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        const usersRes = await fetch('/api/users');
        const usersData = await usersRes.ok ? await usersRes.json() : [];
        setUsers(usersData);

        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          // Verify user exists in the fetched list
          if (user && usersData.some((u: User) => u.id === user.id)) {
            setLoggedInUser(user);
          } else {
            localStorage.removeItem('loggedInUser');
            if (pathname !== '/login') router.push('/login');
          }
        } else {
          if (pathname !== '/login') router.push('/login');
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (pathname !== '/login') router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
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
  
  const contextValue = useMemo(() => ({
    loggedInUser,
    setLoggedInUser: handleSetLoggedInUser,
    users,
    isLoading,
  }), [loggedInUser, users, isLoading]);

  return (
    <AppContext.Provider value={contextValue}>
      {contextValue.isLoading && pathname !== '/login' ? (
          <div className="flex h-screen w-full items-center justify-center">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
      ) : children }
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
