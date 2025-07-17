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
  input: {schema: ProjectSummaryInputSchema},
  output: {schema: ProjectSummaryOutputSchema},
  prompt: `You are an AI project manager tasked with summarizing the status of a project.

  Based on the provided task list and AI directives, generate a strategic summary that includes:

  - Overall project progress
  - Key risks and potential bottlenecks
  - Actionable recommendations

  Task List: {{{tasks}}}
  AI Directives: {{{aiDirectives}}}

  Summary:
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
