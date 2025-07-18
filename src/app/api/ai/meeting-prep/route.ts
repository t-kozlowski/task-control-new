// src/app/api/ai/meeting-prep/route.ts
import { NextResponse } from 'next/server';
import { getMeetings, getTasks, getDirectives } from '@/lib/data-service';
import { getMeetingPrep } from '@/ai/flows/meeting-prep';
import type { ActionItem } from '@/types';
import { genkit } from '@/ai/genkit';

export async function POST(request: Request) {
  return await genkit(request, async () => {
    try {
      const { meetingId, attendeeEmails } = await request.json();

      if (!meetingId || !attendeeEmails) {
        return NextResponse.json({ message: 'Meeting ID and attendees are required' }, { status: 400 });
      }

      const allMeetings = await getMeetings();
      const allTasks = await getTasks();
      const directives = await getDirectives();

      // Sort meetings by date to find the previous one correctly
      allMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const currentMeetingIndex = allMeetings.findIndex(m => m.id === meetingId);

      let previousActionItems: ActionItem[] = [];
      if (currentMeetingIndex > 0) {
        previousActionItems = allMeetings[currentMeetingIndex - 1].actionItems || [];
      }
      
      const attendeesTasks = allTasks.filter(task => 
          task.assignees.some(assignee => attendeeEmails.includes(assignee))
      );

      const prepData = await getMeetingPrep({
          previousMeetingActionItems: JSON.stringify(previousActionItems),
          attendeesTasks: JSON.stringify(attendeesTasks),
          projectDirectives: JSON.stringify(directives)
      });

      return NextResponse.json(prepData);
    } catch (error: any) {
      console.error('AI Meeting Prep Error:', error);
      return NextResponse.json(
        { message: error.message || 'Error generating AI meeting prep' }, 
        { status: 500 }
      );
    }
  });
}
