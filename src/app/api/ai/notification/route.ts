import { NextResponse } from 'next/server';
import { getTasks, getDirectives } from '@/lib/data-service';
import { generateNotification } from '@/ai/flows/ai-notifications';

export async function GET() {
  try {
    const tasks = await getTasks();
    const directives = await getDirectives();

    const projectSummary = `Current Tasks: ${tasks.length} active. Priorities range from Low to Critical. Statuses include Backlog, Todo, In Progress, and Done.`;
    const directiveText = directives.map(d => d.text).join(' ');

    const notification = await generateNotification({
      projectSummary,
      directive: directiveText,
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('AI Notification Error:', error);
    return NextResponse.json({ message: 'Error generating AI notification' }, { status: 500 });
  }
}
