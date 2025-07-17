
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProjectSummaryOutput } from '@/ai/flows/project-summary';

export function AiSummaryCard() {
  const [summary, setSummary] = useState<ProjectSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/ai/summary');
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'Nie udało się pobrać podsumowania AI. Sprawdź konfigurację klucza API.' }));
          throw new Error(errorData.message || 'Wystąpił nieznany błąd serwera.');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
                <Icons.bot className="text-primary" />
                Podsumowanie "Big Picture" od AI
            </CardTitle>
            <CardDescription>
                Strategiczna analiza postępów, ryzyk i wąskich gardeł w projekcie.
            </CardDescription>
        </CardHeader>
        <CardContent>
             {isLoading && (
                <div className="space-y-4">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                </div>
            )}
            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Błąd</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {summary && !error && (
                <div className="prose prose-sm md:prose-base prose-invert text-foreground max-w-none">
                    {summary.summary.split('\n').map((paragraph, index) => (
                        paragraph.trim() && <p key={index}>{paragraph}</p>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  );
}
