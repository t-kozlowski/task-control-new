// src/ai/flows/project-summary.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a summary of the project's progress, risks, and bottlenecks,
 *  along with strategic recommendations. It takes project tasks and AI directives as input and returns an AI-generated summary.
 *
 * - getProjectSummary - A function that triggers the project summary generation flow.
 * - ProjectSummaryInput - The input type for the getProjectSummary function.
 * - ProjectSummaryOutput - The return type for the getProjectSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const ProjectSummaryInputSchema = z.object({
  tasks: z.string().describe('A JSON string representing the list of tasks in the project, including their status, priority, and other relevant details.'),
  aiDirectives: z.string().describe('A JSON string containing AI directives to guide the summary generation.'),
});
export type ProjectSummaryInput = z.infer<typeof ProjectSummaryInputSchema>;

// Define the output schema
const ProjectSummaryOutputSchema = z.object({
  summary: z.string().describe('A strategic summary of the project, including progress, risks, bottlenecks, and recommendations.'),
});
export type ProjectSummaryOutput = z.infer<typeof ProjectSummaryOutputSchema>;

// Exported function to trigger the flow
export async function getProjectSummary(input: ProjectSummaryInput): Promise<ProjectSummaryOutput> {
  return projectSummaryFlow(input);
}

// Define the prompt
const projectSummaryPrompt = ai.definePrompt({
  name: 'projectSummaryPrompt',
  model: 'googleai/gemini-1.5-flash-preview-0514',
  input: {schema: ProjectSummaryInputSchema},
  output: {schema: ProjectSummaryOutputSchema},
  prompt: `Jesteś menedżerem projektu AI, którego zadaniem jest podsumowanie statusu projektu.

  Na podstawie dostarczonej listy zadań i dyrektyw AI, wygeneruj strategiczne podsumowanie w języku polskim, które zawiera:

  - Ogólny postęp projektu
  - Kluczowe ryzyka i potencjalne wąskie gardła
  - Praktyczne rekomendacje

  Lista Zadań: {{{tasks}}}
  Dyrektywy AI: {{{aiDirectives}}}

  Podsumowanie:
  `,
});

// Define the flow
const projectSummaryFlow = ai.defineFlow(
  {
    name: 'projectSummaryFlow',
    inputSchema: ProjectSummaryInputSchema,
    outputSchema: ProjectSummaryOutputSchema,
  },
  async input => {
    const {output} = await projectSummaryPrompt(input);
    return output!;
  }
);
