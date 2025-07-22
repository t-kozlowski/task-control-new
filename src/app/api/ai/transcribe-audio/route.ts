// src/app/api/ai/transcribe-audio/route.ts
import { NextResponse } from 'next/server';
import { transcribeAndSummarize } from '@/ai/flows/transcribe-audio';

export const dynamic = 'force-dynamic';

// Increase max duration for potentially long audio processing
export const maxDuration = 60; 

export async function POST(request: Request) {
    try {
      const { audioDataUri, attendees } = await request.json();

      if (!audioDataUri || !attendees) {
        return NextResponse.json({ message: 'audioDataUri and attendees are required' }, { status: 400 });
      }
      
      const result = await transcribeAndSummarize({ audioDataUri, attendees });

      return NextResponse.json(result);
    } catch (error: any) {
      console.error('AI Transcription Error:', error);
      return NextResponse.json(
        { message: error.message || 'Error transcribing audio with AI' },
        { status: 500 }
      );
    }
}
