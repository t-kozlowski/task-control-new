'use client';

import { useApp } from '@/context/app-context';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Icons } from '@/components/icons';

const ALLOWED_EMAIL = 'tomek@example.com';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { loggedInUser, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!loggedInUser || loggedInUser.email !== ALLOWED_EMAIL)) {
      router.push('/'); // Redirect to dashboard if not authorized
    }
  }, [loggedInUser, isLoading, router]);

  if (isLoading || !loggedInUser || loggedInUser.email !== ALLOWED_EMAIL) {
    return (
      <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
