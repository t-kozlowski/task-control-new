'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Icons, ProjectIcon } from '@/components/icons';
import { useApp } from '@/context/app-context';
import { cn } from '@/lib/utils';
import { Film } from 'lucide-react';


const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/cinematic', label: 'Widok Kinowy', icon: Film },
  { href: '/my-tasks', label: 'Moje Zadania', icon: Icons.userCheck },
  { href: '/backlog', label: 'Backlog', icon: Icons.backlog },
  { href: '/meetings', label: 'Spotkania', icon: Icons.meetings },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/users', label: 'Użytkownicy', icon: Icons.users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { loggedInUser } = useApp();

  if (!loggedInUser) {
    return null;
  }
  
  return (
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <TooltipProvider>
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <ProjectIcon className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Project Sentinel</span>
          </Link>
          {menuItems.map(item => (
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
          ))}
        </nav>
        </TooltipProvider>
      </aside>
  );
}
