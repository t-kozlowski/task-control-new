import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is read from the GOOGLE_API_KEY environment variable.
    }),
  ],
  enableTracing: true,
});
