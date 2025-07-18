
'use client';

import { useState } from 'react';
import { Icons, BotMessageSquare } from '../icons';
import { Button } from '../ui/button';
import { AnimatePresence, motion } from 'framer-motion';

export function AiNotifications() {
  const [notification, setNotification] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchNotification = async () => {
    setIsLoading(true);
    setError(null);
    setNotification(null);
    try {
      // Bezpośrednie wywołanie serwera Flask
      // Upewnij się, że Twój serwer Flask ma włączony CORS!
      const res = await fetch('http://127.0.0.1:5000/generate_summary');
      if (!res.ok) {
        const errorText = await res.text().catch(() => 'Serwer odpowiedział błędem bez szczegółów.');
        throw new Error(`Błąd serwera Flask (${res.status}): ${errorText}`);
      }
      const newNotification = await res.json();
      setNotification(newNotification);
    } catch (err) {
      if (err instanceof TypeError) {
         setError('Błąd połączenia. Upewnij się, że serwer Flask jest uruchomiony i obsługuje CORS.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Wystąpił nieznany błąd.');
      }
      setNotification(null);
    } finally {
      setIsLoading(false);
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
              Poproś AI o przeanalizowanie stanu projektu. Przycisk wywoła backend w Pythonie.
            </p>
            <Button onClick={handleFetchNotification} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Czekam na Pythona...
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
                        <p className="text-sm font-semibold text-primary">Odpowiedź z serwera Python:</p>
                        <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-background/50 p-2 font-mono text-xs">
                          {JSON.stringify(notification, null, 2)}
                        </pre>
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
