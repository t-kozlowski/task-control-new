'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Icons, BotMessageSquare } from '@/components/icons';
import { AppHeader } from './app-header';
import { useApp } from '@/context/app-context';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/', label: 'Pulpit', icon: Icons.dashboard },
  { href: '/backlog', label: 'Lista Zadań', icon: Icons.backlog },
  { href: '/meetings', label: 'Spotkania', icon: Icons.meetings },
  { href: '/directives', label: 'Dyrektywy AI', icon: Icons.directives },
  { href: '/cinematic', label: 'Widok Kinowy', icon: Icons.movie },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { loggedInUser, setLoggedInUser } = useApp();

  if (!loggedInUser) {
    return <>{children}</>;
  }
  
  const handleLogout = () => {
    setLoggedInUser(null);
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <BotMessageSquare className="size-6 text-primary" />
                <span className="group-data-[collapsible=icon]:hidden">LSP</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2 sidebar-scrollable">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    className="justify-start"
                  >
                    <item.icon className="size-5" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2">
            <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
                <Icons.logout className="size-5" />
                <span className="group-data-[collapsible=icon]:hidden">Wyloguj</span>
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col">
            <AppHeader />
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-fade-in">
                {children}
            </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
