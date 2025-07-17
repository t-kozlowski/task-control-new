// src/app/api/ai/meeting-prep/route.ts
import { NextResponse } from 'next/server';
import { getTasks, getMeetings } from '@/lib/data-service';
import { prepareForMeeting } from '@/ai/flows/meeting-prep';
import type { Meeting } from '@/types';

export async function POST(request: Request) {
  try {
    const { meetingId } = await request.json();
    
    const tasks = await getTasks();
    const meetings = await getMeetings();
    
    const currentMeetingIndex = meetings.findIndex(m => m.id === meetingId);
    let previousMeeting: Meeting | undefined = undefined;

    if (currentMeetingIndex > 0) {
      previousMeeting = meetings[currentMeetingIndex - 1];
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
