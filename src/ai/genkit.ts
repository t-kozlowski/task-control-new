import {genkit, GenkitMiddleware} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {NextRequest} from 'next/server';

const DYNAMIC_API_KEY_HEADER = 'x-google-api-key';

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

// This is a middleware function for API routes.
// It dynamically creates a temporary genkit instance for each request,
// using the API key provided in the request headers.
export function configureGenkit(
  request: Request,
  next: () => Promise<Response>
): Promise<Response> {
  const middleware: GenkitMiddleware = async (req, next) => {
    const apiKey =
      (req.headers as any)[DYNAMIC_API_KEY_HEADER] ||
      process.env.GOOGLE_API_KEY;

    // We create a temporary instance here to handle the dynamic API key.
    return await genkit({
      plugins: [
        googleAI({
          apiKey,
        }),
      ],
      enableTracing: true,
    }).run(next);
  };
  return middleware(request as NextRequest, next as any);
}
