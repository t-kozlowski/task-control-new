import { NextResponse } from 'next/server';
import { getTasks, getDirectives } from '@/lib/data-service';
import { getProjectSummary } from '@/ai/flows/project-summary';
import { configureGenkit } from '@/ai/genkit';

export async function GET(request: Request) {
  // Use the configureGenkit middleware to handle dynamic API keys
  return await configureGenkit(request, async () => {
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
      // Ensure a proper error response is sent
      const errorMessage = error.cause?.message || error.message || 'Error generating AI summary';
      const status = error.status || 500;
      return NextResponse.json(
        { message: errorMessage }, 
        { status: status }
      );
    }
  });
}
