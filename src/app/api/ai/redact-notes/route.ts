// src/app/api/ai/redact-notes/route.ts
import { NextResponse } from 'next/server';
import { redactNotes } from '@/ai/flows/redact-notes';
import { configureGenkit } from '@/ai/genkit';


export async function POST(request: Request) {
  return await configureGenkit(request, async () => {
    try {
      const { notes } = await request.json();

      if (!notes) {
        return NextResponse.json({ message: 'Notes are required' }, { status: 400 });
      }
      
      const result = await redactNotes({ notes });

      return NextResponse.json(result);
    } catch (error) {
      console.error('AI Note Redaction Error:', error);
      return NextResponse.json({ message: 'Error redacting notes with AI' }, { status: 500 });
    }
  });
}
