
// src/app/(dashboard)/api-test/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, FlaskConical, AlertTriangle } from 'lucide-react';

export default function ApiTestPage() {
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Wywołujemy nowy endpoint, który będzie proxy do serwera Pythona
      const response = await fetch('/api/python-proxy');
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`Server returned non-JSON error (status: ${response.status})`);
        }
        throw new Error(errorData.message || `An unknown server error occurred (status: ${response.status}).`);
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
          <FlaskConical className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Test Komunikacji z Backendem Pythona</h1>
        </div>
      <Card>
        <CardHeader>
          <CardTitle>Test Połączenia z Pythonem przez Proxy</CardTitle>
          <CardDescription>
            Kliknij przycisk, aby wysłać zapytanie do endpointu `/api/python-proxy`, który następnie przekaże je do Twojego backendu w Pythonie. Adres backendu jest skonfigurowany w pliku `.env`.
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
              'Uruchom test z backendem Pythona'
            )}
          </Button>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Wynik:</h3>
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icons.spinner className="h-5 w-5 animate-spin" />
                <span>Oczekiwanie na odpowiedź od serwera...</span>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                 <AlertTriangle className="h-4 w-4" />
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
                        <h4 className="font-semibold">Odpowiedź z backendu Pythona:</h4>
                        <pre className="mt-2 w-full whitespace-pre-wrap rounded-md bg-secondary/50 p-4 font-mono text-xs">
                           {JSON.stringify(result, null, 2)}
                        </pre>
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
