'use client';
import { useState } from 'react';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { UserFormSheet } from './user-form-sheet';

export default function UsersClient({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const refreshUsers = async () => {
    const res = await fetch('/api/users');
    const data = await res.json();
    setUsers(data);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsSheetOpen(true);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${userName}?`)) return;

    try {
      const response = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Nie udało się usunąć użytkownika.');
      }
      toast({
        title: 'Sukces!',
        description: `Użytkownik ${userName} został usunięty.`,
      });
      await refreshUsers();
    } catch (error) {
      toast({
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.',
        variant: 'destructive',
      });
    }
  };
  
  const onUserSaved = () => {
    refreshUsers();
    setIsSheetOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Zarządzanie Użytkownikami</h1>
        <Button onClick={handleAddUser}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Dodaj Użytkownika
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Członkowie Zespołu</CardTitle>
          <CardDescription>Przeglądaj, dodawaj i zarządzaj użytkownikami w systemie.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border bg-secondary/30 hover:bg-secondary/60 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                    <Icons.edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user.id, user.name)}>
                    <Icons.delete className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <UserFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={editingUser}
        onUserSaved={onUserSaved}
      />
    </>
  );
}
