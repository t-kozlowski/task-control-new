'use client';

import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import { BotMessageSquare, Icons } from '@/components/icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { AppHeader } from './app-header';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: Icons.dashboard },
  { href: '/backlog', label: 'Backlog', icon: Icons.backlog },
  { href: '/directives', label: 'AI Directives', icon: Icons.directives },
];

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-2">
            <BotMessageSquare className="size-8 text-primary" />
            <h1 className="text-xl font-semibold text-primary">Project Sentinel</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map(item => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href} legacyBehavior passHref>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="text-xs text-muted-foreground p-4">
            &copy; {new Date().getFullYear()} Project Sentinel
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 animate-fade-in">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
