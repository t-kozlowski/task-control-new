// src/app/(dashboard)/settings/_components/settings-client.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Save } from 'lucide-react';
import { useSettings } from '@/context/settings-context';
import { Icons } from '@/components/icons';

export default function SettingsClient() {
  const { apiKey, setApiKey, isLoading, error } = useSettings();
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setCurrentApiKey(apiKey);
  }, [apiKey]);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: currentApiKey }),
      });

      if (!response.ok) {
        throw new Error('Nie udało się zapisać klucza API.');
      }
      
      setApiKey(currentApiKey); // Update context state

      toast({
        title: 'Sukces!',
        description: 'Klucz API został zapisany. Zmiany będą aktywne natychmiast.',
      });
    } catch (e) {
      toast({
        title: 'Błąd',
        description: e instanceof Error ? e.message : 'Wystąpił nieznany błąd.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Klucz API dla Google Gemini
          </CardTitle>
          <CardDescription>
            Ładowanie ustawień...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <Icons.spinner className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Klucz API dla Google Gemini
        </CardTitle>
        <CardDescription>
          Wprowadź swój klucz API, aby umożliwić działanie funkcji opartych na sztucznej inteligencji. Klucz będzie zapisany w pliku `.env` na serwerze.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-destructive text-sm">{error}</p>}
        <div className="space-y-2">
          <Label htmlFor="api-key">Twój klucz API</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Wklej tutaj swój klucz API..."
            value={currentApiKey}
            onChange={(e) => setCurrentApiKey(e.target.value)}
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Zapisz klucz
        </Button>
      </CardContent>
    </Card>
  );
}
