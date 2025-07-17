
'use client';

import { useEffect, useState } from 'react';
import { Icons, BotMessageSquare } from '../icons';
import { useToast } from '@/hooks/use-toast';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

export function AiNotifications() {
  const [notification, setNotification] = useState<AiNotificationOutput | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchAndShowNotification = async () => {
      try {
        const res = await fetch('/api/ai/notification');
        if (!res.ok) return;
        const newNotification: AiNotificationOutput = await res.json();
        setNotification(newNotification);
        setIsVisible(true);

        // Hide after 15 seconds
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
        }, 15000); 

        return () => clearTimeout(hideTimer);

      } catch (error) {
        console.error('Failed to fetch AI notification', error);
      }
    };
    
    // Fetch immediately on mount, then set an interval for subsequent fetches.
    fetchAndShowNotification();
    const interval = setInterval(fetchAndShowNotification, 60000); // Fetch every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const getBadgeText = (type: AiNotificationOutput['type']) => {
    switch(type) {
      case 'risk': return 'Analiza Ryzyka';
      case 'positive': return 'Pozytywna Obserwacja';
      case 'suggestion': return 'Sugestia Optymalizacji';
      default: return type;
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && notification && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="relative w-full bg-card/60 dark:bg-black/20 backdrop-blur-lg border border-primary/20 rounded-xl p-6 shadow-2xl shadow-primary/10"
        >
          <div className="flex items-start gap-4">
            <BotMessageSquare className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <span 
                className={`inline-block mb-2 px-3 py-1 text-xs font-semibold rounded-full ${
                    notification.type === 'risk' ? 'bg-red-500/20 text-red-300' 
                    : notification.type === 'positive' ? 'bg-green-500/20 text-green-300' 
                    : 'bg-blue-500/20 text-blue-300'}`}
              >
                  {getBadgeText(notification.type)}
              </span>
              <p className="text-lg text-foreground/90">{notification.notification}</p>
              
              {notification.newTaskSuggestion && (
                <div className="mt-4 p-4 bg-secondary/50 border border-border rounded-lg">
                    <p className="text-sm font-semibold text-primary">Nowy pomysł na zadanie:</p>
                    <p className="text-md font-bold">{notification.newTaskSuggestion.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">{notification.newTaskSuggestion.description}</p>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="absolute top-4 right-4">
                <Icons.delete className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
