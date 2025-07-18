import { NextResponse } from 'next/server';
import { getTasks, getDirectives } from '@/lib/data-service';
import { getProjectSummary } from '@/ai/flows/project-summary';
import { genkit } from '@/ai/genkit';

export async function GET(request: Request) {
  return await genkit(request, async () => {
    try {
      const tasks = await getTasks();
      const directives = await getDirectives();

      const summaryData = await getProjectSummary({
        tasks: JSON.stringify(tasks),
        directives: JSON.stringify(directives),
      });

      return NextResponse.json(summaryData);
    } catch (error: any) {
      console.error('AI Summary Error:', error);
      return NextResponse.json(
        { message: error.message || 'Error generating AI summary' }, 
        { status: 500 }
      );
    }
  });
}
