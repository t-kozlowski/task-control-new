'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/app-context';
import { Icons, BotMessageSquare } from '../icons';
import { AiNotifications } from './ai-notifications';
import { User } from '@/types';

const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/backlog', label: 'Lista Zadań', icon: Icons.backlog },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/cinematic', label: 'Widok Kinowy', icon: Icons.movie },
];

export function AppHeader({ users }: { users: User[] }) {
  const { isZenMode, toggleZenMode, loggedInUser, setLoggedInUser } = useApp();
  const pathname = usePathname();

  const handleLogout = () => {
    setLoggedInUser(null);
  };

  if (pathname === '/login') {
    return null; 
  }

  return (
    <header className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm transition-all duration-300 md:px-6 ${isZenMode ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
      <Link href="/" className="flex items-center gap-2 font-semibold mr-4">
        <BotMessageSquare className="h-6 w-6 text-primary" />
        <span className="text-lg">LSP Innovationhub</span>
      </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        {menuItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors hover:text-foreground ${pathname === item.href ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex w-full items-center justify-end gap-4">
        {loggedInUser ? (
          <span className="text-sm text-muted-foreground">Witaj, {loggedInUser.name}</span>
        ) : (
           <span className="text-sm text-muted-foreground">Zaloguj się</span>
        )}
        <Button variant="ghost" size="icon" onClick={toggleZenMode} title="Tryb Pełnoekranowy">
          {isZenMode ? <Icons.zenOff /> : <Icons.zenOn />}
          <span className="sr-only">Tryb Pełnoekranowy</span>
        </Button>
        <AiNotifications />
        <Button variant="outline" size="sm" onClick={loggedInUser ? handleLogout : () => window.location.href = '/login'}>
          {loggedInUser ? 'Wyloguj' : 'Zaloguj'}
        </Button>
      </div>
    </header>
  );
}
