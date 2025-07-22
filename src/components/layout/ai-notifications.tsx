
'use client';

import { useState } from 'react';
import { Icons, BotMessageSquare } from '../icons';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { Task } from '@/types';

interface AiNotificationOutput {
  notification: string;
  type: 'risk' | 'positive' | 'suggestion';
  newTaskSuggestion?: {
    name: string;
    description: string;
  };
}

export function AiNotifications() {
  const [notification, setNotification] = useState<AiNotificationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey } = useSettings();
  const { toast } = useToast();

  const handleFetchNotification = async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null);
    try {
      // W prawdziwej aplikacji pobralibyśmy te dane dynamicznie
      const tasks: Task[] = await (await fetch('/api/tasks')).json();
      const directives: {id: string, text: string}[] = await (await fetch('/api/directives')).json();

      const res = await fetch(`/api/proxy/ai_notification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasks,
          directive: directives.length > 0 ? directives[0].text : ''
        }),
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (e) {
          throw new Error(`Server returned non-JSON error (status: ${res.status})`);
        }
        throw new Error(errorData.error || `An unknown server error occurred (status: ${res.status}).`);
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
  
  const handleCreateTask = async () => {
      if (!notification?.newTaskSuggestion) return;

      try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: `task-${Date.now()}`,
                name: notification.newTaskSuggestion.name,
                description: notification.newTaskSuggestion.description,
                assignees: [], // Initially unassigned
                priority: 'Medium',
                status: 'Backlog',
                parentId: null,
            }),
        });
        if (!response.ok) throw new Error('Nie udało się utworzyć zadania.');
        toast({
            title: 'Zadanie utworzone!',
            description: `Nowe zadanie "${notification.newTaskSuggestion.name}" zostało dodane do backlogu.`,
        });
        setNotification(null); // Hide notification after taking action
      } catch (error) {
           toast({
            title: 'Błąd',
            description: 'Nie można było utworzyć nowego zadania.',
            variant: 'destructive',
        });
      }
  }

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
                     <div className="mt-4 p-4 bg-secondary/50 border border-border rounded-lg">
                        <div className="flex items-center gap-2">
                           <span className={`capitalize text-sm font-semibold ${
                            notification.type === 'risk' ? 'text-yellow-400' :
                            notification.type === 'positive' ? 'text-green-400' :
                            'text-blue-400'
                           }`}>{notification.type === 'risk' ? 'Ryzyko' : notification.type === 'positive' ? 'Pozytywna obserwacja' : 'Sugestia'}</span>
                        </div>
                        <p className="mt-2 text-sm text-foreground/90">{notification.notification}</p>

                        {notification.newTaskSuggestion && (
                            <div className="mt-4 pt-4 border-t border-border/50">
                                <p className="text-sm font-semibold text-primary">Nowa sugestia zadania:</p>
                                <p className="mt-1 text-md font-bold">{notification.newTaskSuggestion.name}</p>
                                <p className="text-xs text-muted-foreground">{notification.newTaskSuggestion.description}</p>
                                <Button size="sm" className="mt-2" onClick={handleCreateTask}>
                                    <Icons.plus className="mr-2 h-4 w-4" /> Utwórz zadanie
                                </Button>
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
