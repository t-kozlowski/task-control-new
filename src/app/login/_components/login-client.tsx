'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/app-context';
import { User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BotMessageSquare } from '@/components/icons';

export default function LoginClient({ users }: { users: User[] }) {
  const { setLoggedInUser } = useApp();
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (!selectedUser) {
      setError('Proszę wybrać użytkownika.');
      return;
    }
    const user = users.find(u => u.id === selectedUser);
    if (user) {
      setLoggedInUser(user);
      router.push('/');
    } else {
      setError('Nie znaleziono użytkownika.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-secondary">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
           <div className="flex items-center gap-2 justify-center mb-4">
            <BotMessageSquare className="size-8 text-primary" />
            <h1 className="text-2xl font-semibold text-primary">LSP Innovationhub Todo App</h1>
          </div>
          <CardTitle className="text-2xl">Logowanie</CardTitle>
          <CardDescription>Wybierz konto, aby kontynuować.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="user-select">Konto użytkownika</Label>
              <Select onValueChange={setSelectedUser} value={selectedUser}>
                <SelectTrigger id="user-select">
                  <SelectValue placeholder="Wybierz użytkownika..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button onClick={handleLogin} className="w-full">
              Zaloguj się
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
