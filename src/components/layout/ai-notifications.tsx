'use client';

import { useEffect, useState } from 'react';
import { Icons } from '../icons';
import { useToast } from '@/hooks/use-toast';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Button } from '../ui/button';

export function AiNotifications() {
  const { toast } = useToast();
  const [lastNotificationTime, setLastNotificationTime] = useState(0);

  useEffect(() => {
    const fetchNotification = async () => {
      // Prevent fetching if a toast was recently shown
      if (Date.now() - lastNotificationTime < 60000) { // 1 minute cooldown
        return;
      }
      
      try {
        const res = await fetch('/api/ai/notification');
        if (!res.ok) return;
        const newNotification: AiNotificationOutput = await res.json();
        
        setLastNotificationTime(Date.now());
        
        let description = newNotification.notification;
        let action;

        if (newNotification.newTaskSuggestion) {
            description += ` Nowy pomysł: ${newNotification.newTaskSuggestion.name}`;
            action = (
              <Button variant="secondary" size="sm" onClick={() => alert(`Nowe zadanie: ${newNotification.newTaskSuggestion.name}\n\nOpis: ${newNotification.newTaskSuggestion.description}`)}>
                Pokaż szczegóły
              </Button>
            )
        }

        toast({
          title: (
            <div className="flex items-center gap-2">
              <Icons.bot className="text-primary" />
              <span className="capitalize">{getBadgeText(newNotification.type)}</span>
            </div>
          ),
          description: description,
          variant: newNotification.type === 'risk' ? 'destructive' : 'default',
          duration: 10000,
          action: action,
        });
      } catch (error) {
        console.error('Failed to fetch AI notification', error);
      }
    };

    // Fetch one immediately on mount after a short delay
    const timer = setTimeout(fetchNotification, 5000);

    return () => clearTimeout(timer);
  }, [toast, lastNotificationTime]);

  const getBadgeText = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'Ryzyko';
      case 'positive': return 'Pozytywna';
      case 'suggestion': return 'Sugestia';
      default: return type;
    }
  }
  
  // This component no longer renders a visible element, it just triggers toasts.
  return null;
}
