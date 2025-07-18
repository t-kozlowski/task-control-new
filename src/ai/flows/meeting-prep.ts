'use server';
/**
 * @fileOverview An AI flow to generate talking points and questions for an upcoming meeting.
 *
 * - getMeetingPrep - The main function to trigger the flow.
 * - MeetingPrepInput - The input schema for the flow.
 * - MeetingPrepOutput - The output schema for the flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const MeetingPrepInputSchema = z.object({
  previousMeetingActionItems: z.string().describe('A JSON string of action items from the *previous* meeting, including their status.'),
  attendeesTasks: z.string().describe("A JSON string of all *current* tasks assigned to the upcoming meeting's attendees."),
  projectDirectives: z.string().describe('A JSON string of high-level project directives to consider.'),
});
export type MeetingPrepInput = z.infer<typeof MeetingPrepInputSchema>;

export const MeetingPrepOutputSchema = z.object({
    overallSentiment: z.enum(['positive', 'neutral', 'negative']).describe('The overall sentiment of the project progress based on the provided data.'),
    sentimentReasoning: z.string().describe('A brief, one-sentence reasoning for the chosen sentiment.'),
    discussionPoints: z.array(z.string()).describe('A list of key topics to discuss, focusing on open action items and blocked tasks.'),
    questionsToAsk: z.array(z.string()).describe('A list of specific, insightful questions to ask attendees about their tasks or challenges.'),
    talkingPoints: z.array(z.string()).describe('A list of positive points or achievements to mention, to boost morale.'),
});
export type MeetingPrepOutput = z.infer<typeof MeetingPrepOutputSchema>;


export async function getMeetingPrep(input: MeetingPrepInput): Promise<MeetingPrepOutput> {
  return meetingPrepFlow(input);
}

const meetingPrepPrompt = ai.definePrompt({
  name: 'meetingPrepPrompt',
  model: 'gpt-4o',
  input: { schema: MeetingPrepInputSchema },
  output: { schema: MeetingPrepOutputSchema },
  prompt: `Jesteś asystentem AI, który pomaga menedżerowi projektu przygotować się do spotkania zespołu. Twoim zadaniem jest analiza danych i wygenerowanie strategicznych punktów do rozmowy. Odpowiedzi muszą być w języku polskim.

  **Dane wejściowe:**
  - Punkty akcji z poprzedniego spotkania: {{{previousMeetingActionItems}}}
  - Aktualne zadania uczestników spotkania: {{{attendeesTasks}}}
  - Dyrektywy projektu: {{{projectDirectives}}}

  **Twoje zadania:**

  1.  **Oceń Sentyment (overallSentiment & sentimentReasoning):**
      - Przeanalizuj statusy punktów akcji i zadań.
      - Jeśli większość jest ukończona lub w toku bez opóźnień, sentyment jest 'positive'.
      - Jeśli jest równowaga między postępem a problemami, sentyment jest 'neutral'.
      - Jeśli wiele kluczowych elementów jest zablokowanych lub nie rozpoczętych, sentyment jest 'negative'.
      - Uzasadnij krótko swoją ocenę.

  2.  **Wygeneruj Proponowaną Agendę (discussionPoints):**
      - Skup się na **nieukończonych** punktach akcji z poprzedniego spotkania.
      - Zidentyfikuj zadania, które wydają się być zablokowane lub mają status 'Todo' lub 'Backlog' przez długi czas.
      - Sformułuj 2-3 kluczowe tematy do omówienia.

  3.  **Zaproponuj Pytania (questionsToAsk):**
      - Na podstawie agendy, stwórz 2-3 wnikliwe pytania, które pomogą zrozumieć przyczyny problemów i znaleźć rozwiązania.
      - Np. "Co blokuje zadanie X?", "Jak możemy pomóc w punkcie akcji Y?".

  4.  **Znajdź Pozytywy (talkingPoints):**
      - Zidentyfikuj ukończone punkty akcji i zadania.
      - Wskaż 1-2 konkretne osiągnięcia, za które można pochwalić zespół. To ważne dla morale.

  Zachowaj zwięzłość i profesjonalizm. Twoje podpowiedzi muszą być konkretne i oparte na dostarczonych danych.`,
});


const meetingPrepFlow = ai.defineFlow(
  {
    name: 'meetingPrepFlow',
    inputSchema: MeetingPrepInputSchema,
    outputSchema: MeetingPrepOutputSchema,
  },
  async (input) => {
    const { output } = await meetingPrepPrompt(input);
    return output!;
  }
);
