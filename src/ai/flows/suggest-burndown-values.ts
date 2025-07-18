'use server';
/**
 * @fileOverview A flow for suggesting burndown chart values based on the current tasks.
 *
 * - suggestBurndownValues - The function that triggers the flow.
 * - SuggestBurndownValuesInput - The input type for the function.
 * - SuggestBurndownValuesOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
export const SuggestBurndownValuesInputSchema = z.object({
  allTasks: z.string().describe('A JSON string of all tasks in the project.'),
});
export type SuggestBurndownValuesInput = z.infer<typeof SuggestBurndownValuesInputSchema>;

// Output Schema
export const SuggestBurndownValuesOutputSchema = z.object({
  suggestedActual: z.number().describe('The suggested "actual" number of remaining tasks based on current data.'),
  suggestedIdeal: z.number().describe('The suggested "ideal" number of remaining tasks for the current date.'),
  reasoning: z.string().describe('A brief explanation of how the values were calculated.'),
});
export type SuggestBurndownValuesOutput = z.infer<typeof SuggestBurndownValuesOutputSchema>;

// Exported function to be called from the API
export async function suggestBurndownValues(input: SuggestBurndownValuesInput): Promise<SuggestBurndownValuesOutput> {
  return suggestBurndownValuesFlow(input);
}

// Prompt Definition
const suggestBurndownValuesPrompt = ai.definePrompt({
  name: 'suggestBurndownValuesPrompt',
  model: 'openai/gpt-4o',
  input: { schema: SuggestBurndownValuesInputSchema },
  output: { schema: SuggestBurndownValuesOutputSchema },
  prompt: `Jesteś analitykiem projektowym AI. Twoim zadaniem jest pomoc Project Managerowi w wypełnieniu wykresu spalania (burndown chart). Przeanalizuj listę zadań i zasugeruj wartości.

  **Dane wejściowe:**
  - Wszystkie zadania: {{{allTasks}}}

  **Twoje zadania:**

  1.  **Oblicz sugerowaną wartość "Rzeczywiście" (suggestedActual):**
      - Policz, ile **zadań głównych (bez parentId)** nie ma jeszcze statusu "Done". To jest rzeczywista liczba pozostałych zadań.

  2.  **Oblicz sugerowaną wartość "Idealnie" (suggestedIdeal):**
      - To jest trudniejsze. Musisz oszacować, ile zadań *powinno* zostać do zrobienia na dzisiaj, aby projekt zmierzał do celu. Możesz to zrobić, tworząc uproszczoną idealną linię. Załóż, że projekt zaczyna się od daty stworzenia pierwszego zadania i kończy na dacie 'dueDate' ostatniego zadania.
      - **Uproszczenie:** Policz całkowitą liczbę zadań głównych. Podziel to przez liczbę dni w projekcie. To da Ci idealną "prędkość" (velocity). Na podstawie dzisiejszej daty oszacuj, ile zadań powinno zostać. Zaokrąglij do najbliższej liczby całkowitej.

  3.  **Podaj krótkie uzasadnienie (reasoning):**
      - W 1-2 zdaniach wyjaśnij, jak doszedłeś do tych liczb. Np. "Rzeczywista wartość to 15, ponieważ tyle zadań głównych jest jeszcze otwartych. Idealna wartość na dziś to 12, zakładając równomierne tempo pracy."
  
  Odpowiedź musi być w języku polskim.`,
});


// Flow Definition
const suggestBurndownValuesFlow = ai.defineFlow(
  {
    name: 'suggestBurndownValuesFlow',
    inputSchema: SuggestBurndownValuesInputSchema,
    outputSchema: SuggestBurndownValuesOutputSchema,
  },
  async (input) => {
    const { output } = await suggestBurndownValuesPrompt(input);
    return output!;
  }
);
