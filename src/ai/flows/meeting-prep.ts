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
    overallSentiment: z.enum(['positive', 'neutral', 'negative']).describe('The overall sentiment of the project progress based on tasks and past action items.'),
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
  prompt: `Jesteś wyjątkowo wnikliwym asystentem AI, pomagającym menedżerowi projektu przygotować się na kluczowe spotkanie z zarządem. 

  Twoim zadaniem jest przeprowadzenie kompleksowej analizy dostarczonych danych i wygenerowanie strategicznych materiałów w języku polskim.

  **Dostępne dane:**
  - **Aktualna lista zadań projektowych:** {{{tasks}}}
  {{#if previousMeeting}}
  - **Dane z poprzedniego spotkania (w tym punkty akcji do weryfikacji):** {{{previousMeeting}}}
  {{/if}}

  **Twoje zadania analityczne:**

  1.  **Ocena Ogólnego Sentymentu (Overall Sentiment):**
      - Przeanalizuj postępy, opóźnienia, statusy zadań krytycznych i realizację poprzednich punktów akcji.
      - Na tej podstawie określ ogólny sentyment projektu jako 'positive' (wszystko idzie gładko), 'neutral' (mieszane wyniki, drobne problemy) lub 'negative' (poważne ryzyka, opóźnienia).

  2.  **Punkty do Omówienia (Talking Points):**
      - Zidentyfikuj 2-4 najważniejsze tematy do dyskusji. Powinny one wynikać z Twojej oceny sentymentu.
      - Jeśli sentyment jest negatywny, skup się na blokerach i zadaniach krytycznych.
      - Jeśli pozytywny, wskaż kluczowe sukcesy i zakończone kamienie milowe.
      - Dla każdego punktu podaj zwięzłe uzasadnienie, dlaczego jest on kluczowy do omówienia *teraz*.

  3.  **Pytania do Zarządu (Questions to Ask):**
      - Sformułuj 2-3 strategiczne pytania. Unikaj pytań technicznych.
      - Pytania powinny być proaktywne: dążyć do usunięcia przeszkód, pozyskania zasobów, wyjaśnienia priorytetów lub uzyskania zgody na dalsze kroki.

  4.  **Aktualizacja Punktów Akcji (Action Item Updates):**
      - **Tylko jeśli dostępne są dane z poprzedniego spotkania**, przeanalizuj listę zadań, aby określić status każdego punktu akcji.
      - Dla każdego punktu sformułuj krótką, jasną rekomendację co do komunikacji (np. "Potwierdzić ukończenie i pokazać wynik", "Wyjaśnić opóźnienie i zaproponować nowy plan", "Zgłosić brak postępów i poprosić o wsparcie").
      - Jeśli statusu nie da się jednoznacznie określić na podstawie zadań, oznacz go jako "Do weryfikacji" i zarekomenduj pytanie o status.

  Wygeneruj odpowiedź ściśle według schematu wyjściowego. Bądź zwięzły, profesjonalny i strategiczny.
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
