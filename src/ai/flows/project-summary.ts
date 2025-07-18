'use server';
/**
 * @fileOverview A flow for generating a high-level strategic summary of the project.
 * It analyzes tasks and directives to provide insights on status, risks, and next steps.
 *
 * - getProjectSummary - A function that generates the project summary.
 * - ProjectSummaryInput - The input type for the getProjectSummary function.
 * - ProjectSummaryOutput - The return type for the getProjectSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProjectSummaryInputSchema = z.object({
  tasks: z.string().describe('A JSON string of all current tasks in the project.'),
  directives: z.string().describe('A JSON string of all high-level directives for the project.'),
});
export type ProjectSummaryInput = z.infer<typeof ProjectSummaryInputSchema>;

const ProjectSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, high-level summary of the project\'s current status, key achievements, and overall progress.'),
  risks: z.array(z.string()).describe('A list of potential risks or bottlenecks identified from the task list and directives.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations or next steps to keep the project on track.'),
});
export type ProjectSummaryOutput = z.infer<typeof ProjectSummaryOutputSchema>;

export async function getProjectSummary(input: ProjectSummaryInput): Promise<ProjectSummaryOutput> {
  return projectSummaryFlow(input);
}

const projectSummaryPrompt = ai.definePrompt({
  name: 'projectSummaryPrompt',
  model: 'gemini-1.5-flash-latest',
  input: { schema: ProjectSummaryInputSchema },
  output: { schema: ProjectSummaryOutputSchema },
  prompt: `Jesteś głównym analitykiem strategicznym AI w projekcie. Twoim zadaniem jest dostarczenie zwięzłego, ale wnikliwego podsumowania dla zarządu.

  Przeanalizuj poniższą listę zadań oraz dyrektywy strategiczne.

  **Dane wejściowe:**
  - Zadania: {{{tasks}}}
  - Dyrektywy: {{{directives}}}

  **Twoje zadania:**

  1.  **Wygeneruj Podsumowanie (summary):** Stwórz 2-3 zdaniowe podsumowanie ogólnego stanu projektu. Skup się na postępach w kluczowych obszarach (np. Frontend, Backend).
  2.  **Zidentyfikuj Ryzyka (risks):** Wskaż 2-3 najważniejsze ryzyka. Mogą to być zadania krytyczne, które są opóźnione, nagromadzenie zadań w jednym statusie, lub konflikty z dyrektywami.
  3.  **Zaproponuj Rekomendacje (recommendations):** Podaj 2-3 konkretne, możliwe do wdrożenia rekomendacje, które pomogą zminimalizować ryzyka i przyspieszyć projekt.

  Odpowiedź musi być w języku polskim i ściśle trzymać się schematu wyjściowego.
  `,
});


const projectSummaryFlow = ai.defineFlow(
  {
    name: 'projectSummaryFlow',
    inputSchema: ProjectSummaryInputSchema,
    outputSchema: ProjectSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await projectSummaryPrompt(input);
    return output!;
  }
);
