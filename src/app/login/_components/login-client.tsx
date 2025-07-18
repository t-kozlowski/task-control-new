
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import type { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ProjectIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';


export default function LoginClient() {
  const { users, isLoading, setLoggedInUser } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    if (!email || !password) {
      setError('Proszę wpisać email i hasło.');
      return;
    }
    const user = users.find(u => u.email === email);
    if (user && user.password === password) {
      setLoggedInUser(user);
    } else {
      setError('Nieprawidłowy email lub hasło.');
    }
  };
  
  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
             <Card className="w-full max-w-sm mx-auto">
                <CardHeader className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <ProjectIcon className="size-8 text-primary" />
                        <h1 className="text-2xl font-semibold text-foreground">Project Sentinel</h1>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm mx-auto">
        <CardHeader className="text-center">
           <div className="flex items-center gap-2 justify-center mb-4">
            <ProjectIcon className="size-8 text-primary" />
            <h1 className="text-2xl font-semibold text-foreground">Project Sentinel</h1>
          </div>
          <CardTitle className="text-2xl">Zaloguj się</CardTitle>
          <CardDescription>Wpisz swoje dane, aby kontynuować.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
