'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProjectSummaryOutput } from '@/ai/flows/project-summary';

interface AiSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AiSummaryDialog({ open, onOpenChange }: AiSummaryDialogProps) {
  const [summary, setSummary] = useState<ProjectSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      const fetchSummary = async () => {
        setIsLoading(true);
        setError(null);
        setSummary(null);
        try {
          const response = await fetch('/api/ai/summary');
          if (!response.ok) {
            throw new Error('Nie udało się pobrać podsumowania AI');
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
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Icons.bot className="text-primary" />
            Podsumowanie "Big Picture" od AI
          </DialogTitle>
          <DialogDescription>
            Strategiczna analiza postępów, ryzyk i wąskich gardeł w projekcie.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
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
          {summary && (
            <div className="prose prose-invert text-foreground">
                {summary.summary.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
