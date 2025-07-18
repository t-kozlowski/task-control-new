// src/app/api/ai/suggest-burndown/route.ts
import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/data-service';
import { suggestBurndownValues } from '@/ai/flows/suggest-burndown-values';
import { configureGenkit } from '@/ai/genkit';

export async function POST(request: Request) {
  return await configureGenkit(request, async () => {
    try {
      const tasks = await getTasks();
      
      const result = await suggestBurndownValues({ 
        allTasks: JSON.stringify(tasks),
      });

      return NextResponse.json(result);
    } catch (error) {
      console.error('AI Burndown Suggestion Error:', error);
      return NextResponse.json({ message: 'Error suggesting burndown values with AI' }, { status: 500 });
    }
  });
}
