'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function AiNotifications() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AiNotificationOutput[]>([]);
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  useEffect(() => {
    const fetchNotification = async () => {
      try {
        const res = await fetch('/api/ai/notification');
        if (!res.ok) return;
        const newNotification: AiNotificationOutput = await res.json();
        
        setNotifications(prev => [newNotification, ...prev].slice(0, 5));

        toast({
          title: (
            <div className="flex items-center gap-2">
              <Icons.bot className="text-primary" />
              <span className="capitalize">{newNotification.type === 'risk' ? 'Ryzyko' : newNotification.type === 'positive' ? 'Pozytywne' : 'Sugestia'}</span>
            </div>
          ),
          description: newNotification.notification,
          variant: newNotification.type === 'risk' ? 'destructive' : 'default',
        });
      } catch (error) {
        console.error('Failed to fetch AI notification', error);
      }
    };

    const intervalId = setInterval(fetchNotification, 30000); // every 30 seconds
    
    // Fetch one immediately on mount
    fetchNotification();

    return () => clearInterval(intervalId);
  }, [toast]);

  const getBadgeVariant = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'destructive';
      case 'positive': return 'default'; // 'default' will use primary color
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


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icons.bell />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </span>
          )}
          <span className="sr-only">Pokaż powiadomienia</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <Card className="border-none shadow-none">
          <CardHeader>
            <CardTitle>Powiadomienia AI</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {notifications.length > 0 ? (
              notifications.map((n, i) => (
                <div key={i} className="flex gap-3">
                  <Icons.bot className="flex-shrink-0 mt-1 text-primary" />
                  <div>
                    <Badge variant={getBadgeVariant(n.type)} className={getBadgeColor(n.type)}>{getBadgeText(n.type)}</Badge>
                    <p className="text-sm text-muted-foreground mt-1">{n.notification}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center">Brak nowych powiadomień.</p>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
