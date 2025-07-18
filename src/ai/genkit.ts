import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is the main genkit instance used by all flows.
// It is configured with a static API key from environment variables.
export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  enableTracing: true,
});

// The middleware has been removed for a simpler, more robust implementation.
// API routes will now directly use the above `ai` instance.
