// src/ai/flows/ai-notifications.ts
'use server';
/**
 * @fileOverview A flow for generating intelligent AI notifications about project status.
 *
 * - generateNotification - A function that generates an AI notification.
 * - AiNotificationInput - The input type for the generateNotification function.
 * - AiNotificationOutput - The return type for the generateNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiNotificationInputSchema = z.object({
  projectSummary: z.string().describe('A summary of the current project status.'),
  directive: z.string().optional().describe('A directive to consider when generating the notification.'),
});
export type AiNotificationInput = z.infer<typeof AiNotificationInputSchema>;

const AiNotificationOutputSchema = z.object({
  notification: z.string().describe('The AI-generated notification message.'),
  type: z.enum(['risk', 'positive', 'suggestion']).describe('The type of notification.'),
});
export type AiNotificationOutput = z.infer<typeof AiNotificationOutputSchema>;

export async function generateNotification(input: AiNotificationInput): Promise<AiNotificationOutput> {
  return aiNotificationFlow(input);
}

const aiNotificationPrompt = ai.definePrompt({
  name: 'aiNotificationPrompt',
  input: {schema: AiNotificationInputSchema},
  output: {schema: AiNotificationOutputSchema},
  prompt: `You are an AI assistant that generates notifications for a project management dashboard. 

  Based on the current project summary and any provided directives, create a concise and informative notification. 
  The notification should be categorized as either a 'risk', 'positive' observation, or a 'suggestion' for optimization.

  Project Summary: {{{projectSummary}}}
  Directive (if any): {{{directive}}}

  Consider the directive, if present, when generating the notification. For example, if the directive is 'Focus on minimizing technical debt,' prioritize suggestions that reduce technical debt.
  If there's a risk, make sure to explain it.
  The notification should be no more than 2 sentences.
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
