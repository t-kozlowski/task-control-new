'use server';
/**
 * @fileOverview A flow for transcribing audio and then processing it.
 * It first transcribes the audio, then analyzes the transcript to identify speakers,
 * pull out highlights, and generate an initial summary.
 *
 * - transcribeAndSummarize - The main function for the flow.
 * - TranscribeInput - The input type for the function.
 * - TranscribeOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema for the entire flow
export const TranscribeInputSchema = z.object({
  audioDataUri: z.string().describe("The audio recording as a data URI."),
  attendees: z.array(z.string()).describe("A list of attendee names to help identify speakers."),
});
export type TranscribeInput = z.infer<typeof TranscribeInputSchema>;

// Output Schema for the processed transcript
export const TranscribeOutputSchema = z.object({
  rawTranscript: z.string().describe("The raw, unedited transcript from the speech-to-text model."),
  speakers: z.array(z.object({
    name: z.string().describe("The identified speaker's name, or 'Unknown'."),
    lines: z.array(z.string()).describe("The lines spoken by this person."),
  })).describe("The transcript broken down by identified speakers."),
  highlights: z.array(z.string()).describe("Key highlight points or action items mentioned in the conversation."),
  initialSummary: z.string().describe("A brief, initial summary of the entire conversation."),
});
export type TranscribeOutput = z.infer<typeof TranscribeOutputSchema>;


export async function transcribeAndSummarize(input: TranscribeInput): Promise<TranscribeOutput> {
  return transcribeAndSummarizeFlow(input);
}

const processTranscriptPrompt = ai.definePrompt({
    name: 'processTranscriptPrompt',
    model: 'gemini-1.5-flash-latest',
    input: { schema: z.object({ transcript: z.string(), attendees: z.array(z.string()) }) },
    output: { schema: Omit<typeof TranscribeOutputSchema, 'rawTranscript'> },
    prompt: `Jesteś zaawansowanym analitykiem rozmów. Twoim zadaniem jest przetworzenie surowej transkrypcji spotkania na ustrukturyzowaną notatkę.

Uczestnicy spotkania: {{{json attendees}}}

Surowa transkrypcja:
---
{{{transcript}}}
---

Twoje zadania:
1.  **Podziel na mówców (speakers):** Przeanalizuj transkrypcję i przypisz każdą wypowiedź do jednego z uczestników. Jeśli nie jesteś pewien, użyj "Nieznany". Pogrupuj wszystkie wypowiedzi jednej osoby razem.
2.  **Wyodrębnij kluczowe punkty (highlights):** Zidentyfikuj i wypisz najważniejsze decyzje, punkty akcji, kluczowe pytania lub wnioski.
3.  **Stwórz wstępne podsumowanie (initialSummary):** Napisz zwięzły, 2-3 zdaniowy akapit podsumowujący główne tematy i wynik rozmowy.

Odpowiedź musi być w języku polskim i ściśle trzymać się wymaganego formatu wyjściowego.`,
});


const transcribeAndSummarizeFlow = ai.defineFlow(
  {
    name: 'transcribeAndSummarizeFlow',
    inputSchema: TranscribeInputSchema,
    outputSchema: TranscribeOutputSchema,
  },
  async ({ audioDataUri, attendees }) => {
    // Step 1: Transcribe audio to text
    const { text: rawTranscript } = await ai.generate({
        model: 'gemini-1.5-flash-latest', // Using a powerful model that can handle audio
        prompt: [{ media: { url: audioDataUri } }, { text: "Dokonaj transkrypcji tego nagrania audio na tekst." }],
    });

    if (!rawTranscript) {
        throw new Error("Transkrypcja nie powiodła się, model nie zwrócił tekstu.");
    }
    
    // Step 2: Process the raw transcript to get structured data
    const { output: processedData } = await processTranscriptPrompt({
        transcript: rawTranscript,
        attendees: attendees,
    });

    if (!processedData) {
        throw new Error("Przetwarzanie transkrypcji nie powiodło się.");
    }

    return {
        rawTranscript: rawTranscript,
        ...processedData,
    };
  }
);
