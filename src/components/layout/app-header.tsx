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
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Link from 'next/link';
import { BotMessageSquare } from '../icons';
import { usePathname } from 'next/navigation';


const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/my-tasks', label: 'Moje Zadania', icon: Icons.userCheck },
  { href: '/backlog', label: 'Backlog', icon: Icons.backlog },
  { href: '/meetings', label: 'Spotkania', icon: Icons.meetings },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/cinematic', label: 'Widok Kinowy', icon: Icons.movie },
];


export function AppHeader() {
  const { loggedInUser, setLoggedInUser } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    if (loggedInUser) {
        const fetchTasks = async () => {
          const res = await fetch('/api/tasks');
          if (res.ok) {
            const data = await res.json();
            setTasks(data);
          }
        };
        fetchTasks();
    }
  }, [loggedInUser])

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  const userInitials = loggedInUser?.name.split(' ').map(n => n[0]).join('');
  const userTasks = tasks.filter(t => t.assignee === loggedInUser?.email && t.status !== 'Done');


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <Icons.menu />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="#"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <BotMessageSquare className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">LSP Innovationhub</span>
                </Link>
                {menuItems.map(item => (
                   <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
      
      <div className="flex w-full items-center justify-end gap-2 md:gap-4">
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
                        <DropdownMenuItem asChild>
                            <Link href="/my-tasks">
                                <Icons.backlog className="mr-2" />
                                <span>Moje zadania ({userTasks.length})</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}
                 <DropdownMenuItem onClick={loggedInUser ? handleLogout : () => window.location.href = '/login'}>
                    <Icons.logout className="mr-2" />
                    {loggedInUser ? 'Wyloguj' : 'Zaloguj'}
                 </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
