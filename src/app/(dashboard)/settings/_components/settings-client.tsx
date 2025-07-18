// src/app/(dashboard)/settings/_components/settings-client.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/context/settings-context';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Save } from 'lucide-react';

export default function SettingsClient() {
  const { apiKey, setApiKey } = useSettings();
  const [currentApiKey, setCurrentApiKey] = useState(apiKey);
  const { toast } = useToast();

  const handleSave = () => {
    setApiKey(currentApiKey);
    toast({
      title: 'Sukces!',
      description: 'Klucz API został zapisany w ustawieniach przeglądarki.',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5" />
          Klucz API dla Google Gemini
        </CardTitle>
        <CardDescription>
          Wprowadź swój klucz API, aby umożliwić działanie funkcji opartych na sztucznej inteligencji. Klucz będzie bezpiecznie przechowywany w Twojej przeglądarce.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Zapisz klucz
        </Button>
      </CardContent>
    </Card>
  );
}
