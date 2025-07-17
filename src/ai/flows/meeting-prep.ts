// src/ai/flows/meeting-prep.ts
'use server';
/**
 * @fileOverview A flow for preparing for a meeting with the CEO.
 * It generates talking points, questions, and follows up on past action items.
 *
 * - prepareForMeeting - A function that generates the meeting preparation materials.
 * - MeetingPrepInput - The input type for the prepareForMeeting function.
 * - MeetingPrepOutput - The return type for the prepareForMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const MeetingPrepInputSchema = z.object({
  tasks: z.string().describe('A JSON string representing the list of current tasks.'),
  previousMeeting: z.string().optional().describe('A JSON string of the previous meeting\'s data, including action items.'),
});
export type MeetingPrepInput = z.infer<typeof MeetingPrepInputSchema>;

// Define the output schema for a single action item
const ActionItemUpdateSchema = z.object({
    description: z.string().describe('The original description of the action item from the previous meeting.'),
    status: z.string().describe('The current status of this action item, inferred from the provided task list.'),
    recommendation: z.string().describe('A brief recommendation on what to say about this item (e.g., "Confirm completion", "Explain delay", "Request resources").'),
});

const MeetingPrepOutputSchema = z.object({
    talkingPoints: z.array(z.object({
        topic: z.string().describe('A key topic to discuss, based on important, critical, or blocked tasks.'),
        reasoning: z.string().describe('A brief explanation of why this topic is important to discuss now.'),
    })).describe('A list of strategic talking points for the meeting.'),
    
    questionsToAsk: z.array(z.string()).describe('A list of insightful questions to ask the CEO to gain clarity, unblock issues, or align on strategy.'),

    actionItemUpdates: z.array(ActionItemUpdateSchema).describe('An update on each action item from the previous meeting.'),
});
export type MeetingPrepOutput = z.infer<typeof MeetingPrepOutputSchema>;

// Exported function to trigger the flow
export async function prepareForMeeting(input: MeetingPrepInput): Promise<MeetingPrepOutput> {
  return meetingPrepFlow(input);
}

// Define the prompt
const meetingPrepPrompt = ai.definePrompt({
  name: 'meetingPrepPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: {schema: MeetingPrepInputSchema},
  output: {schema: MeetingPrepOutputSchema},
  prompt: `Jesteś strategicznym asystentem AI, który pomaga menedżerowi projektu przygotować się na spotkanie z prezesem.

  Twoim zadaniem jest przeanalizowanie bieżącej listy zadań oraz, jeśli jest dostępna, notatek z poprzedniego spotkania. Na tej podstawie wygeneruj materiały przygotowawcze w języku polskim.

  **Kontekst:**
  - **Aktualne zadania:** {{{tasks}}}
  {{#if previousMeeting}}
  - **Poprzednie spotkanie (w tym punkty akcji):** {{{previousMeeting}}}
  {{/if}}

  **Twoje zadania:**

  1.  **Punkty do omówienia (Talking Points):** Zidentyfikuj 3-4 najważniejsze tematy do dyskusji. Skup się na zadaniach o statusie 'Critical' lub 'High', zadaniach, które są blokerami, lub kluczowych osiągnięciach. Dla każdego punktu podaj krótkie uzasadnienie, dlaczego jest on ważny.
  
  2.  **Pytania do prezesa (Questions to Ask):** Sformułuj 2-3 strategiczne pytania, które pomogą usunąć przeszkody, uzyskać zgodę na dalsze działania lub wyjaśnić priorytety. Unikaj pytań czysto technicznych.

  3.  **Aktualizacja statusu punktów akcji (Action Item Updates):** Jeśli dostępne są dane z poprzedniego spotkania, przeanalizuj listę zadań, aby określić obecny status każdego punktu akcji. Dla każdego z nich podaj krótką rekomendację, co należy zakomunikować (np. "Potwierdzić ukończenie", "Wyjaśnić opóźnienie i podać nowy termin", "Poprosić o zasoby"). Jeśli statusu nie da się jednoznacznie określić, oznacz go jako "Do weryfikacji".

  Wygeneruj odpowiedź ściśle według schematu wyjściowego.
  `,
});

// Define the flow
const meetingPrepFlow = ai.defineFlow(
  {
    name: 'meetingPrepFlow',
    inputSchema: MeetingPrepInputSchema,
    outputSchema: MeetingPrepOutputSchema,
  },
  async input => {
    const {output} = await meetingPrepPrompt(input);
    return output!;
  }
);
