'use client';

import { useEffect, useState } from 'react';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';

export function AiNotifications() {
  const { toast } = useToast();
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  useEffect(() => {
    const fetchNotification = async () => {
      // Prevent fetching if a toast is already active or just recently shown
      if (Date.now() - lastNotificationTime < 30000) {
        return;
      }

      try {
        const res = await fetch('/api/ai/notification');
        if (!res.ok) return;
        const newNotification: AiNotificationOutput = await res.json();
        
        setLastNotificationTime(Date.now());

        toast({
          title: (
            <div className="flex items-center gap-2">
              <Icons.bot className="text-primary" />
              <span className="capitalize">{getBadgeText(newNotification.type)}</span>
            </div>
          ),
          description: newNotification.notification,
          variant: newNotification.type === 'risk' ? 'destructive' : 'default',
          duration: 7000, // Show for 7 seconds
        });
      } catch (error) {
        console.error('Failed to fetch AI notification', error);
      }
    };

    const intervalId = setInterval(fetchNotification, 30000); // every 30 seconds
    
    // Fetch one immediately on mount after a short delay
    setTimeout(fetchNotification, 3000);

    return () => clearInterval(intervalId);
  }, [toast, lastNotificationTime]);

  const getBadgeText = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'Ryzyko';
      case 'positive': return 'Pozytywne';
      case 'suggestion': return 'Sugestia';
      default: return type;
    }
  }
  
  // This component no longer renders a visible element, it just triggers toasts.
  return null;
}
