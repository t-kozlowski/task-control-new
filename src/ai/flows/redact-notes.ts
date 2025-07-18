'use server';
/**
 * @fileOverview A flow for redacting meeting notes.
 * It takes raw, informal notes and transforms them into a professional meeting summary.
 *
 * - redactNotes - The function that triggers the flow.
 * - RedactNotesInput - The input type for the redactNotes function.
 * - RedactNotesOutput - The return type for the redactNotes function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
export const RedactNotesInputSchema = z.object({
  notes: z.string().describe('The raw, informal notes from the meeting.'),
});
export type RedactNotesInput = z.infer<typeof RedactNotesInputSchema>;

// Output Schema
export const RedactNotesOutputSchema = z.object({
  redactedSummary: z.string().describe('The professionally formatted and redacted meeting summary.'),
});
export type RedactNotesOutput = z.infer<typeof RedactNotesOutputSchema>;

// Exported function to be called from the API
export async function redactNotes(input: RedactNotesInput): Promise<RedactNotesOutput> {
  return redactNotesFlow(input);
}

// Prompt Definition
const redactNotesPrompt = ai.definePrompt({
  name: 'redactNotesPrompt',
  model: 'openai/gpt-4.1-mini',
  input: { schema: RedactNotesInputSchema },
  output: { schema: RedactNotesOutputSchema },
  prompt: `Jesteś asystentem AI specjalizującym się w tworzeniu profesjonalnych notatek ze spotkań. Twoim zadaniem jest przekształcenie surowych, nieformalnych notatek w zwięzłe, dobrze zorganizowane i profesjonalne podsumowanie spotkania w języku polskim.

  Oryginalne notatki:
  {{{notes}}}

  Wytyczne:
  1.  **Struktura:** Zorganizuj podsumowanie w logiczne sekcje (np. "Kluczowe decyzje", "Punkty akcji", "Główne tematy dyskusji").
  2.  **Język:** Użyj formalnego i profesjonalnego języka. Unikaj slangu, skrótów myślowych i nieformalnych zwrotów.
  3.  **Zwięzłość:** Skup się na najważniejszych informacjach. Usuń zbędne dygresje i powtórzenia.
  4.  **Klarowność:** Upewnij się, że podsumowanie jest łatwe do zrozumienia dla osób, które nie były na spotkaniu.
  5.  **Formatowanie:** Użyj punktorów lub list numerowanych, aby poprawić czytelność.

  Wygeneruj tylko i wyłącznie pole "redactedSummary".`,
});


// Flow Definition
const redactNotesFlow = ai.defineFlow(
  {
    name: 'redactNotesFlow',
    inputSchema: RedactNotesInputSchema,
    outputSchema: RedactNotesOutputSchema,
  },
  async (input) => {
    const { output } = await redactNotesPrompt(input);
    return output!;
  }
);
