// src/ai/flows/ai-notifications.ts
'use server';
/**
 * @fileOverview A flow for generating intelligent AI notifications about project status.
 *
 * - generateNotification - A function that generates an AI notification.
 * - AiNotificationInput - The input type for the generateNotification function.
 * - AiNotificationOutput - The return type for the generateNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNotificationInputSchema = z.object({
  projectSummary: z.string().describe('A summary of the current project status.'),
  directive: z.string().optional().describe('A directive to consider when generating the notification.'),
});
export type AiNotificationInput = z.infer<typeof AiNotificationInputSchema>;

const AiNotificationOutputSchema = z.object({
  notification: z.string().describe('The AI-generated notification message.'),
  type: z.enum(['risk', 'positive', 'suggestion']).describe('The type of notification.'),
});
export type AiNotificationOutput = z.infer<typeof AiNotificationOutputSchema>;

export async function generateNotification(input: AiNotificationInput): Promise<AiNotificationOutput> {
  return aiNotificationFlow(input);
}

const aiNotificationPrompt = ai.definePrompt({
  name: 'aiNotificationPrompt',
  input: {schema: AiNotificationInputSchema},
  output: {schema: AiNotificationOutputSchema},
  prompt: `Jesteś asystentem AI, który generuje powiadomienia dla panelu zarządzania projektami. 

  Na podstawie bieżącego podsumowania projektu i wszelkich dostarczonych dyrektyw, stwórz zwięzłe i pouczające powiadomienie w języku polskim. 
  Powiadomienie powinno być skategoryzowane jako 'ryzyko', 'pozytywna' obserwacja lub 'sugestia' optymalizacji.

  Podsumowanie Projektu: {{{projectSummary}}}
  Dyrektywa (jeśli istnieje): {{{directive}}}

  Weź pod uwagę dyrektywę, jeśli jest obecna, podczas generowania powiadomienia. Na przykład, jeśli dyrektywą jest 'Skup się na minimalizacji długu technicznego', priorytetyzuj sugestie, które redukują dług techniczny.
  Jeśli istnieje ryzyko, upewnij się, że je wyjaśnisz.
  Powiadomienie powinno składać się z maksymalnie 2 zdań.
  `,
});

const aiNotificationFlow = ai.defineFlow(
  {
    name: 'aiNotificationFlow',
    inputSchema: AiNotificationInputSchema,
    outputSchema: AiNotificationOutputSchema,
  },
  async input => {
    const {output} = await aiNotificationPrompt(input);
    return output!;
  }
);
