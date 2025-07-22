// src/ai/flows/transcribe-audio.ts
'use server';
/**
 * @fileOverview An AI flow to transcribe audio from a meeting and generate a structured summary.
 *
 * - transcribeAndSummarize - The main function to trigger the flow.
 * - TranscribeInput - The input schema for the flow.
 * - TranscribeOutput - The output schema for the flow.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const TranscribeInputSchema = z.object({
  audioDataUri: z.string().describe("A chunk of audio as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  attendees: z.number().describe('Number of attendees in the meeting'),
});
export type TranscribeInput = z.infer<typeof TranscribeInputSchema>;

export const TranscribeOutputSchema = z.object({
  rawTranscript: z.string().describe('The raw, unedited transcript from the audio.'),
  processedTranscript: z.string().describe('The processed and cleaned-up transcript, structured as a meeting summary.'),
});
export type TranscribeOutput = z.infer<typeof TranscribeOutputSchema>;

export async function transcribeAndSummarize(input: TranscribeInput): Promise<TranscribeOutput> {
  return transcribeFlow(input);
}

const transcribeFlow = ai.defineFlow(
  {
    name: 'transcribeFlow',
    inputSchema: TranscribeInputSchema,
    outputSchema: TranscribeOutputSchema,
  },
  async ({ audioDataUri, attendees }) => {
    // Step 1: Transcribe the audio to get the raw text
    const { text: rawTranscript } = await ai.generate({
      model: 'gemini-1.5-flash-latest',
      prompt: [
        { text: `Proszę, dokonaj transkrypcji poniższego nagrania audio. W spotkaniu bierze udział ${attendees} osób. Spróbuj zidentyfikować różnych mówców i oznacz ich jako "Mówca 1", "Mówca 2", itd.` },
        { media: { url: audioDataUri } },
      ],
      config: {
        // Higher temperature might be better for creative interpretation of speech
        temperature: 0.3, 
      }
    });

    if (!rawTranscript) {
      throw new Error('Transkrypcja nie powiodła się. Model nie zwrócił tekstu.');
    }
    
    // Step 2: Process the raw transcript to create a clean summary
    const summarizationPrompt = ai.definePrompt({
        name: 'summarizeTranscriptPrompt',
        input: { schema: z.object({ transcript: z.string() }) },
        output: { schema: z.object({ summary: z.string() }) },
        prompt: `Jesteś asystentem AI specjalizującym się w tworzeniu profesjonalnych notatek ze spotkań. Otrzymałeś surową transkrypcję. Twoim zadaniem jest przekształcenie jej w zwięzłe, dobrze zorganizowane i profesjonalne podsumowanie spotkania w języku polskim.

        Surowa transkrypcja:
        {{{transcript}}}

        Wytyczne:
        1.  **Popraw Błędy:** Skoryguj wszelkie błędy gramatyczne, literówki i nieścisłości w transkrypcji.
        2.  **Struktura:** Zorganizuj podsumowanie w logiczne sekcje (np. "Kluczowe decyzje", "Punkty akcji", "Główne tematy dyskusji").
        3.  **Język:** Użyj formalnego i profesjonalnego języka. Unikaj slangu i nieformalnych zwrotów.
        4.  **Zwięzłość:** Skup się na najważniejszych informacjach. Usuń zbędne dygresje.
        5.  **Klarowność:** Upewnij się, że podsumowanie jest łatwe do zrozumienia.
        6.  **Formatowanie:** Użyj punktorów i pogrubień, aby poprawić czytelność.`
    });

    const { output } = await summarizationPrompt({ transcript: rawTranscript });
    const processedTranscript = output?.summary || 'Nie udało się wygenerować podsumowania.';

    return {
      rawTranscript,
      processedTranscript,
    };
  }
);
