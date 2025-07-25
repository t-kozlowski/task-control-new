// src/app/(dashboard)/ai-test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import type { ProjectSummaryOutput } from '@/ai/flows/project-summary';
import { AlertTriangle, Lightbulb, CheckCircle, FlaskConical, File } from 'lucide-react';
import { useSettings } from '@/context/settings-context';

export default function AiTestPage() {
  const [result, setResult] = useState<ProjectSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey, isLoading: isLoadingSettings } = useSettings();

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/summary');
      
      const responseBody = await response.text();
      
      if (!response.ok) {
        let errorData;
        try {
          // Try to parse the error response as JSON
          errorData = JSON.parse(responseBody);
        } catch (e) {
            // If it's not JSON, it's an unexpected server error (e.g., HTML error page)
            throw new Error(`Server returned non-JSON error (status: ${response.status}): ${responseBody.substring(0, 100)}...`);
        }
        throw new Error(errorData.message || `An unknown server error occurred (status: ${response.status}).`);
      }
      
      const data: ProjectSummaryOutput = JSON.parse(responseBody);
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
          <FlaskConical className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Test Funkcji AI</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Test Głównego Przepływu Analitycznego</CardTitle>
          <CardDescription>
            Kliknij przycisk poniżej, aby wywołać przepływ AI `getProjectSummary` i sprawdzić, czy otrzymujemy poprawną, ustrukturyzowaną odpowiedź od modelu Gemini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTest} disabled={isLoading || isLoadingSettings || !apiKey}>
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Testowanie...
              </>
            ) : (
              'Uruchom test AI'
            )}
          </Button>
           {(isLoadingSettings || !apiKey) && (
            <Alert variant="destructive" className="mt-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>
                {isLoadingSettings ? "Sprawdzanie klucza API..." : "Brak klucza API"}
              </AlertTitle>
              <AlertDescription>
                 {isLoadingSettings 
                    ? "Proszę czekać, weryfikujemy konfigurację."
                    : <>Wprowadź swój klucz API w <a href="/settings" className="underline font-bold">ustawieniach</a>, aby włączyć funkcje AI.</>
                 }
              </AlertDescription>
            </Alert>
           )}

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
                <AlertDescription>
                  <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-destructive/20 p-2 font-mono text-xs">
                    {error}
                  </pre>
                </AlertDescription>
              </Alert>
            )}

            {result && (
                <Alert variant="default" className="border-green-500/50 bg-green-500/10 text-foreground">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertTitle className="text-green-400">Test zakończony sukcesem!</AlertTitle>
                    <AlertDescription className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><File className="h-4 w-4" />Podsumowanie</h4>
                            <p className="text-sm pl-6">{result.summary}</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="h-4 w-4" />Zidentyfikowane Ryzyka</h4>
                            <ul className="list-disc pl-11 space-y-1 text-sm">
                                {result.risks.map((risk, i) => <li key={i}>{risk}</li>)}
                            </ul>
                        </div>
                         <div className="space-y-2">
                            <h4 className="font-semibold flex items-center gap-2"><Lightbulb className="h-4 w-4" />Rekomendacje</h4>
                            <ul className="list-disc pl-11 space-y-1 text-sm">
                                {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                            </ul>
                        </div>
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
