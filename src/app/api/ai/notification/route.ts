import { NextResponse } from 'next/server';
import { getTasks, getDirectives } from '@/lib/data-service';
import { generateNotification } from '@/ai/flows/ai-notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
      const tasks = await getTasks();
      const directives = await getDirectives();

      // Select one random directive to focus on, if directives exist
      let randomDirective = '';
      if (directives.length > 0) {
        const randomIndex = Math.floor(Math.random() * directives.length);
        randomDirective = directives[randomIndex].text;
      }

      const notification = await generateNotification({
        tasks: JSON.stringify(tasks),
        directive: randomDirective,
      });

      return NextResponse.json(notification);
    } catch (error: any) {
      console.error('AI Notification Error:', error);
      return NextResponse.json(
        { message: error.message || 'Error generating AI notification' }, 
        { status: 500 }
      );
    }
}
