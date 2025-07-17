'use client';

import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useApp } from '@/context/app-context';
import { Icons } from '../icons';
import { AiNotifications } from './ai-notifications';

export function AppHeader() {
  const { isZenMode, toggleZenMode } = useApp();

  return (
    <header className={`sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm transition-all duration-300 md:px-6 ${isZenMode ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'}`}>
      <SidebarTrigger className="md:hidden" />
      <div className="flex w-full items-center justify-end gap-4">
        <Button variant="ghost" size="icon" onClick={toggleZenMode}>
          {isZenMode ? <Icons.zenOff /> : <Icons.zenOn />}
          <span className="sr-only">Toggle Zen Mode</span>
        </Button>
        <AiNotifications />
      </div>
    </header>
  );
}
