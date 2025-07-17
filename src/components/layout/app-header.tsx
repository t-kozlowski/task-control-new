'use client';

import { useApp } from '@/context/app-context';
import { Icons } from '../icons';
import { AiNotifications } from './ai-notifications';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react';
import type { Task } from '@/types';
import { SidebarTrigger } from '../ui/sidebar';
import { Button } from '../ui/button';


export function AppHeader() {
  const { loggedInUser, setLoggedInUser } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    };
    fetchTasks();
  }, [])

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const userInitials = loggedInUser?.name.split(' ').map(n => n[0]).join('');
  const userTasks = tasks.filter(t => t.assignee === loggedInUser?.email && t.status !== 'Done');


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <SidebarTrigger className="sm:hidden" />
      
      <div className="flex w-full items-center justify-end gap-2 md:gap-4">
        {/* Potentially add a search bar here in the future */}
        <div className="flex-1" />

        <AiNotifications />
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                {loggedInUser && (
                    <>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{loggedInUser.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{loggedInUser.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Icons.backlog className="mr-2" />
                            <span>Moje zadania ({userTasks.length})</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                 <DropdownMenuItem onClick={loggedInUser ? handleLogout : () => window.location.href = '/login'}>
                    {loggedInUser ? 'Wyloguj' : 'Zaloguj'}
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
