'use client';

import { useApp } from '@/context/app-context';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';
import { cn } from '@/lib/utils';

export function ZenModeToggle() {
  const { isZenMode, toggleZenMode } = useApp();

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 transition-opacity duration-300',
        isZenMode ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleZenMode}
        title="Wyjdź z trybu pełnoekranowego"
        className="bg-background/80 backdrop-blur-sm"
      >
        <Icons.zenOff />
        <span className="sr-only">Wyjdź z trybu pełnoekranowego</span>
      </Button>
    </div>
  );
}
