'use client';

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export function AiNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AiNotificationOutput[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch('/api/ai/notification');
        if (!res.ok) return;
        const newNotification: AiNotificationOutput = await res.json();
        
        // Add a timestamp to the notification
        const notificationWithTimestamp = { ...newNotification, timestamp: new Date() };

        setNotifications(prev => [notificationWithTimestamp, ...prev]);
        setHasUnread(true);

        toast({
          title: (
            <div className="flex items-center gap-2">
              <Icons.bot className="text-primary" />
              <span className="capitalize">{getBadgeText(newNotification.type)}</span>
            </div>
          ),
          description: newNotification.notification,
          variant: newNotification.type === 'risk' ? 'destructive' : 'default',
        });
      } catch (error) {
        console.error('Failed to fetch AI notification', error);
      }
    };

    const intervalId = setInterval(fetchNotification, 20000); // every 20 seconds
    
    // Fetch one immediately on mount
    fetchNotification();

    return () => clearInterval(intervalId);
  }, [toast]);

  const getBadgeVariant = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'destructive';
      case 'positive': return 'default';
      case 'suggestion': return 'secondary';
      default: return 'outline';
    }
  }
  
  const getBadgeColor = (type: AiNotificationOutput['type']) => {
    if (type === 'positive') return 'bg-accent text-accent-foreground';
    return '';
  }

  const getBadgeText = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'Ryzyko';
      case 'positive': return 'Pozytywne';
      case 'suggestion': return 'Sugestia';
      default: return type;
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setHasUnread(false);
    }
  };

  return (
    <Popover onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icons.bell />
          {hasUnread && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Pokaż powiadomienia</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Centrum Powiadomień AI</CardTitle>
            <CardDescription>Ostatnie alerty i sugestie od asystenta AI.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-96">
                <div className="flex flex-col gap-4 pr-4">
                  {notifications.length > 0 ? (
                    notifications.map((n, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <Icons.bot className="flex-shrink-0 mt-1 text-primary" />
                        <div className="flex-1">
                          <div className='flex justify-between items-center'>
                             <Badge variant={getBadgeVariant(n.type)} className={getBadgeColor(n.type)}>{getBadgeText(n.type)}</Badge>
                             {n.timestamp && <span className="text-xs text-muted-foreground">{n.timestamp.toLocaleTimeString()}</span>}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">{n.notification}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                     <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4 h-full justify-center">
                        <Icons.bell className="h-12 w-12" />
                        <h3 className="text-lg font-semibold">Brak nowych powiadomień</h3>
                        <p>Gdy AI będzie miało coś do powiedzenia, zobaczysz to tutaj.</p>
                      </div>
                  )}
                </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
