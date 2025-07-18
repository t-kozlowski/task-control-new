
// src/app/api/ai/suggest-description/route.ts
import { NextResponse } from 'next/server';
import { suggestTaskDescription } from '@/ai/flows/suggest-task-description';

export async function POST(request: Request) {
  try {
    const { taskName } = await request.json();

    if (!taskName) {
      return NextResponse.json({ message: 'taskName is required' }, { status: 400 });
    }
    
    const result = await suggestTaskDescription({ taskName });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Description Suggestion Error:', error);
    return NextResponse.json({ message: 'Error suggesting description with AI' }, { status: 500 });
  }
}
