import { NextResponse } from 'next/server';
import { getMeetings, saveMeetings } from '@/lib/data-service';
import type { Meeting } from '@/types';

export async function GET() {
  try {
    const meetings = await getMeetings();
    // Sort meetings by date ascending
    meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading meetings data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newMeeting: Meeting = await request.json();
        const meetings = await getMeetings();
        
        if (meetings.some(m => m.id === newMeeting.id)) {
            return NextResponse.json({ message: 'Meeting with this ID already exists' }, { status: 409 });
        }

        meetings.push(newMeeting);
        await saveMeetings(meetings);
        return NextResponse.json(newMeeting, { status: 201 });
    } catch (error) {
        console.error('Error saving meeting:', error);
        return NextResponse.json({ message: 'Error saving meeting' }, { status: 500 });
    }
}
