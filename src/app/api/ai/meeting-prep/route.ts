// src/app/api/ai/meeting-prep/route.ts
import { NextResponse } from 'next/server';
import { getTasks, getMeetings } from '@/lib/data-service';
import { prepareForMeeting } from '@/ai/flows/meeting-prep';
import type { Meeting } from '@/types';

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();
    
    if (!meetingId) {
      return NextResponse.json({ message: 'Brak ID spotkania' }, { status: 400 });
    }

    const tasks = await getTasks();
    const meetings = (await getMeetings()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const currentMeetingIndex = meetings.findIndex(m => m.id === meetingId);
    let previousMeeting: Meeting | undefined = undefined;

    if (currentMeetingIndex > 0) {
      previousMeeting = meetings[currentMeetingIndex - 1];
    } else {
      // Find the meeting chronologically before the current one, even if the array is not perfectly sorted.
      const currentMeeting = meetings[currentMeetingIndex];
      if (currentMeeting) {
         previousMeeting = meetings
            .filter(m => new Date(m.date) < new Date(currentMeeting.date))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      }
    }

    const prepData = await prepareForMeeting({
      tasks: JSON.stringify(tasks),
      previousMeeting: previousMeeting ? JSON.stringify(previousMeeting) : undefined,
    });

    return NextResponse.json(prepData);
  } catch (error) {
    console.error('AI Meeting Prep Error:', error);
    return NextResponse.json({ message: 'Error generating AI meeting prep' }, { status: 500 });
  }
}
