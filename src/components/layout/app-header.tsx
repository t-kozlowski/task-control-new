'use client';

import { useApp } from '@/context/app-context';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from 'react';
import { Task } from '@/types';


const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/my-tasks', label: 'Moje Zadania', icon: Icons.userCheck },
  { href: '/backlog', label: 'Backlog', icon: Icons.backlog },
  { href: '/meetings', label: 'Spotkania', icon: Icons.meetings },
  { href: '/project-manager', label: 'Project Manager', icon: Icons.projectManager, requiredEmail: 'tomek@example.com' },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/users', label: 'Użytkownicy', icon: Icons.users, requiredEmail: 'tomek@example.com' },
];


export function AppHeader() {
  const pathname = usePathname();
  const { loggedInUser, setLoggedInUser } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);

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
                {loggedInUser && (
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                           <Button variant="ghost" className="flex items-center gap-2 justify-start p-0 h-auto">
                              <Avatar className="h-10 w-10">
                                  <AvatarFallback>{userInitials}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col items-start">
                                <p className="text-sm font-medium leading-none">{loggedInUser.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{loggedInUser.email}</p>
                              </div>
                           </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-56 mt-2">
                           <DropdownMenuItem onClick={handleLogout}>
                              <Icons.logout className="mr-2" />
                              Wyloguj
                           </DropdownMenuItem>
                      </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {menuItems.map(item => {
                   if (item.requiredEmail && loggedInUser?.email !== item.requiredEmail) {
                    return null;
                  }
                  return (
                   <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 px-2.5 ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
    </header>
  );
}
