// src/app/(dashboard)/ai-test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ProjectSummaryOutput } from '@/ai/flows/project-summary';
import { TestTube2 } from 'lucide-react';

export default function AiTestPage() {
  const [result, setResult] = useState<ProjectSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/summary');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Wystąpił nieoczekiwany błąd serwera. Sprawdź konsolę po stronie serwera, aby uzyskać więcej informacji.' }));
        throw new Error(errorData.message || 'Nie udało się uzyskać odpowiedzi od AI.');
      }
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-3">
          <TestTube2 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Test Funkcji AI</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Test Połączenia z AI</CardTitle>
          <CardDescription>
            Kliknij przycisk poniżej, aby wywołać przepływ AI `getProjectSummary` i sprawdzić, czy otrzymujemy poprawną odpowiedź od modelu językowego Gemini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={isLoading}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Testowanie...
              </>
            ) : (
              'Uruchom test AI'
            )}
          </Button>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wynik:</h3>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icons.spinner className="h-5 w-5 animate-spin" />
                <span>Oczekiwanie na odpowiedź od AI...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                 <AlertTitle>Test nie powiódł się</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
                <Alert variant="default" className="border-green-500/50 bg-green-500/10">
                    <AlertTitle className="text-green-400">Test zakończony sukcesem!</AlertTitle>
                    <AlertDescription className="prose prose-sm prose-invert text-foreground max-w-none mt-2">
                        <p>{result.summary}</p>
                    </AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && !result && (
                <p className="text-muted-foreground">Wynik testu pojawi się tutaj.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
