// src/ai/flows/ai-notifications.ts
'use server';
/**
 * @fileOverview A flow for generating intelligent AI notifications about project status.
 * It now also suggests brand new tasks to innovate on the project.
 *
 * - generateNotification - A function that generates an AI notification.
 * - AiNotificationInput - The input type for the generateNotification function.
 * - AiNotificationOutput - The return type for the generateNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNotificationInputSchema = z.object({
  tasks: z.string().describe('A JSON string of all current tasks in the project.'),
  directive: z.string().optional().describe('A high-level directive to consider.'),
});
export type AiNotificationInput = z.infer<typeof AiNotificationInputSchema>;

const AiNotificationOutputSchema = z.object({
  notification: z.string().describe('The AI-generated notification message, focusing on status, risks, or suggestions for existing tasks.'),
  type: z.enum(['risk', 'positive', 'suggestion']).describe('The type of notification.'),
  newTaskSuggestion: z.object({
      name: z.string().describe("The name of a brand new, innovative task that isn't on the current list."),
      description: z.string().describe("A brief description of why this new task is a good idea and what it involves."),
  }).optional().describe("A suggestion for a completely new task to add to the project, based on current progress and goals."),
});
export type AiNotificationOutput = z.infer<typeof AiNotificationOutputSchema>;

export async function generateNotification(input: AiNotificationInput): Promise<AiNotificationOutput> {
  return aiNotificationFlow(input);
}

const aiNotificationPrompt = ai.definePrompt({
  name: 'aiNotificationPrompt',
  model: 'openai/gpt-4o',
  input: {schema: AiNotificationInputSchema},
  output: {schema: AiNotificationOutputSchema},
  prompt: `Jesteś strategicznym asystentem AI dla panelu zarządzania projektami. Twoim zadaniem jest dostarczanie wnikliwych spostrzeżeń.

  Przeanalizuj bieżącą listę zadań i podaną dyrektywę (jeśli istnieje).

  **Twoje zadania (wykonaj oba):**

  1.  **Wygeneruj zwięzłe powiadomienie (1-2 zdania) w języku polskim:**
      - Skategoryzuj je jako 'ryzyko' (jeśli widzisz problem), 'pozytywna' obserwacja (jeśli coś idzie dobrze) lub 'sugestia' (jeśli masz pomysł na optymalizację istniejących zadań).
      - Jeśli istnieje dyrektywa, weź ją pod uwagę. Na przykład, jeśli dyrektywą jest "minimalizuj dług techniczny", skup się na tym aspekcie.

  2.  **Zaproponuj zupełnie NOWE zadanie (opcjonalnie, ale bardzo pożądane):**
      - **Tylko jeśli podano konkretną dyrektywę**, wymyśl jedno innowacyjne zadanie inspirowane tą dyrektywą, **którego jeszcze nie ma na liście**.
      - Może to być refaktoryzacja, nowa funkcja, zadanie badawcze lub cokolwiek, co Twoim zdaniem przyniesie wartość projektowi i jest zgodne z duchem dyrektywy.
      - Wypełnij pole \`newTaskSuggestion\` z nazwą i krótkim uzasadnieniem. Jeśli nie masz dobrego pomysłu lub nie podano dyrektywy, pomiń to pole.

  **Dane wejściowe:**
  - Lista zadań: {{{tasks}}}
  - Dyrektywa: {{{directive}}}
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
