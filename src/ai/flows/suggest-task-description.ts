'use server';
/**
 * @fileOverview A flow for suggesting a detailed task description based on a task name.
 *
 * - suggestTaskDescription - The function that triggers the flow.
 * - SuggestTaskDescriptionInput - The input type for the function.
 * - SuggestTaskDescriptionOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
export const SuggestTaskDescriptionInputSchema = z.object({
  taskName: z.string().describe('The name or title of the task.'),
});
export type SuggestTaskDescriptionInput = z.infer<typeof SuggestTaskDescriptionInputSchema>;

// Output Schema
export const SuggestTaskDescriptionOutputSchema = z.object({
  suggestedDescription: z.string().describe('The AI-generated, detailed, and actionable task description.'),
});
export type SuggestTaskDescriptionOutput = z.infer<typeof SuggestTaskDescriptionOutputSchema>;

// Exported function to be called from the API
export async function suggestTaskDescription(input: SuggestTaskDescriptionInput): Promise<SuggestTaskDescriptionOutput> {
  return suggestTaskDescriptionFlow(input);
}

// Prompt Definition
const suggestTaskDescriptionPrompt = ai.definePrompt({
  name: 'suggestTaskDescriptionPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: { schema: SuggestTaskDescriptionInputSchema },
  output: { schema: SuggestTaskDescriptionOutputSchema },
  prompt: `Jesteś ekspertem w zarządzaniu projektami, specjalizującym się w tworzeniu jasnych i zwięzłych opisów zadań. Twoim celem jest przekształcenie zwięzłej nazwy zadania w szczegółowy, profesjonalny i gotowy do wykonania opis w języku polskim.

  Nazwa zadania:
  {{{taskName}}}

  Wytyczne:
  1.  **Klarowność:** Opis musi być jednoznaczny i łatwy do zrozumienia.
  2.  **Konkretność:** Unikaj ogólników. W miarę możliwości wskaż, co jest celem zadania i jakie mogą być jego kluczowe elementy.
  3.  **Actionability:** Sformułuj opis tak, aby osoba wykonująca zadanie wiedziała, od czego zacząć.
  4.  **Profesjonalizm:** Użyj formalnego, biznesowego języka.

  Przykład:
  - Nazwa zadania: "Implementacja logowania przez Google"
  - Sugerowany opis: "Zintegrowanie systemu uwierzytelniania aplikacji z Google OAuth 2.0. Zadanie obejmuje stworzenie odpowiednich przycisków na stronie logowania, obsługę callbacku od Google, pobranie danych użytkownika (email, imię, avatar) oraz stworzenie lub zaktualizowanie konta użytkownika w naszej bazie danych."

  Wygeneruj tylko i wyłącznie pole "suggestedDescription".`,
});


// Flow Definition
const suggestTaskDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestTaskDescriptionFlow',
    inputSchema: SuggestTaskDescriptionInputSchema,
    outputSchema: SuggestTaskDescriptionOutputSchema,
  },
  async (input) => {
    const { output } = await suggestTaskDescriptionPrompt(input);
    return output!;
  }
);
