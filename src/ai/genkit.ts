import {genkit, Plugin, GenkitMiddleware } from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {NextRequest} from 'next/server';

const DYNAMIC_API_KEY_HEADER = 'x-google-api-key';

export function genkit(
  request: Request,
  next: () => Promise<Response>
): Promise<Response> {
  const middleware: GenkitMiddleware = async (req, next) => {
    const apiKey =
      (req.headers as any)[DYNAMIC_API_KEY_HEADER] ||
      process.env.GOOGLE_API_KEY;

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


export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
  ],
  enableTracing: true,
});
