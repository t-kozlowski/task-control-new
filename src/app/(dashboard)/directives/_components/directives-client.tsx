'use client';
import { useState } from 'react';
import { AiDirective } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function DirectivesClient({ initialDirectives }: { initialDirectives: AiDirective[] }) {
  const [directives, setDirectives] = useState<AiDirective[]>(initialDirectives);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/directives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(directives),
      });
      if (!response.ok) throw new Error('Failed to save directives');
      toast({
        title: 'Success',
        description: 'AI directives have been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not save directives.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">AI Directives</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Program AI Behavior</CardTitle>
          <CardDescription>
            Provide global guidelines for the AI. These directives will influence its analysis and recommendations.
            Enter one directive per line.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[200px] font-mono"
            value={directives.map(d => d.text).join('\n')}
            onChange={(e) => {
              const textLines = e.target.value.split('\n');
              const newDirectives = textLines.map((text, index) => ({
                id: directives[index]?.id || `${Date.now()}-${index}`,
                text,
              }));
              setDirectives(newDirectives);
            }}
            placeholder="e.g., Prioritize security compliance (ISO 26262)."
          />
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Directives'}
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
