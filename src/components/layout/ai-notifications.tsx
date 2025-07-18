
'use client';

import { useState } from 'react';
import { Icons, BotMessageSquare } from '../icons';
import type { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings } from '@/context/settings-context';

export function AiNotifications() {
  const [notification, setNotification] = useState<AiNotificationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useSettings();

  const handleFetchNotification = async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null);
    try {
      const res = await fetch('/api/ai/notification');
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Nie udało się pobrać analizy AI.');
      }
      const newNotification: AiNotificationOutput = await res.json();
      setNotification(newNotification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.');
      setNotification(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getBadgeText = (type: AiNotificationOutput['type']) => {
    switch (type) {
      case 'risk': return 'Analiza Ryzyka';
      case 'positive': return 'Pozytywna Obserwacja';
      case 'suggestion': return 'Sugestia Optymalizacji';
      default: return type;
    }
  };
  
  const hasContent = notification || error;

  return (
    <div className="relative w-full bg-card/60 dark:bg-black/20 backdrop-blur-lg border border-primary/20 rounded-xl p-6 shadow-2xl shadow-primary/10">
      <div className="flex items-start gap-4">
        <BotMessageSquare className="h-8 w-8 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground/90">Strategiczny Asystent AI</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Poproś AI o przeanalizowanie stanu projektu, zidentyfikowanie ryzyk i zasugerowanie nowych, innowacyjnych zadań.
            </p>
            <Button onClick={handleFetchNotification} disabled={isLoading || !apiKey}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Analizuję...
                </>
              ) : (
                <>
                  <Icons.bot className="mr-2 h-4 w-4" />
                  Zapytaj AI
                </>
              )}
            </Button>
            {!apiKey && <p className="text-xs text-muted-foreground mt-2">Wprowadź klucz API w <a href="/settings" className="underline">ustawieniach</a>, aby włączyć tę funkcję.</p>}

            <AnimatePresence>
              {hasContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                  {notification && (
                    <div className="mt-4">
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
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-destructive/20 border border-destructive/50 rounded-lg">
                        <p className="text-sm font-semibold text-destructive-foreground">Wystąpił błąd</p>
                        <p className="text-sm text-destructive-foreground/80 mt-1">{error}</p>
                    </div>
                  )}
                  </motion.div>
              )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
