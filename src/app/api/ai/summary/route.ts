import { NextResponse } from 'next/server';
import { getProjectSummary } from '@/ai/flows/project-summary';
import { getTasks, getDirectives } from '@/lib/data-service';

export async function GET() {
  try {
    const tasks = await getTasks();
    const directives = await getDirectives();

    const summary = await getProjectSummary({
      tasks: JSON.stringify(tasks),
      aiDirectives: JSON.stringify(directives.map(d => d.text)),
    });

    return NextResponse.json(summary);
  } catch (error) {
    console.error('AI Summary Error:', error);
    return NextResponse.json({ message: 'Error generating AI summary' }, { status: 500 });
  }
}
