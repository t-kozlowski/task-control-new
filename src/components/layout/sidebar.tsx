'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from '@/components/icons';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { Task } from '@/types';


const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/my-tasks', label: 'Moje Zadania', icon: Icons.myTasks },
  { href: '/my-day', label: 'Mój Dzień', icon: Icons.myDay },
  { href: '/backlog', label: 'Backlog', icon: Icons.backlog },
  { href: '/schedule', label: 'Harmonogram', icon: Icons.schedule },
  { href: '/meetings', label: 'Spotkania', icon: Icons.meetings },
  { href: '/project-manager', label: 'Project Manager', icon: Icons.projectManager, requiredEmail: 'tkozlowski@lspgroup.pl' },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/users', label: 'Użytkownicy', icon: Icons.users, requiredEmail: 'tkozlowski@lspgroup.pl' },
];

const settingsMenuItem = { href: '/settings', label: 'Konfiguracja', icon: Icons.settings };

export function AppSidebar() {
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
  const userTasks = loggedInUser ? tasks.filter(t => t.assignees.includes(loggedInUser.email) && t.status !== 'Done') : [];

  if (!loggedInUser) {
    return null;
  }
  
  return (
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="overflow-hidden rounded-full h-8 w-8">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                 </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="right" className="w-56">
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

          {menuItems.map(item => {
            if (item.requiredEmail && loggedInUser?.email !== item.requiredEmail) {
              return null;
            }
            return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname === item.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )})}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
             <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={settingsMenuItem.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8',
                    pathname === settingsMenuItem.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <settingsMenuItem.icon className="h-5 w-5" />
                  <span className="sr-only">{settingsMenuItem.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{settingsMenuItem.label}</TooltipContent>
            </Tooltip>
        </nav>
        </TooltipProvider>
      </aside>
  );
}
