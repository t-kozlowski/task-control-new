import { NextResponse } from 'next/server';
import { getMeetings, saveMeetings } from '@/lib/data-service';
import { Meeting } from '@/types';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    try {
        const meetings = await getMeetings();
        const meeting = meetings.find(m => m.id === id);

        if (!meeting) {
            return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
        }
        return NextResponse.json(meeting);
    } catch (error) {
        return NextResponse.json({ message: 'Error reading meetings data' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const updatedMeeting: Meeting = await request.json();
    let meetings = await getMeetings();
    const meetingIndex = meetings.findIndex(m => m.id === id);

    if (meetingIndex === -1) {
      return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
    }

    // Preserve existing action items if not provided in the payload
    if (!updatedMeeting.actionItems) {
      updatedMeeting.actionItems = meetings[meetingIndex].actionItems || [];
    }

    meetings[meetingIndex] = updatedMeeting;
    await saveMeetings(meetings);
    return NextResponse.json(updatedMeeting);
  } catch (error) {
    console.error('Error updating meeting:', error);
    return NextResponse.json({ message: 'Error updating meeting' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    let meetings = await getMeetings();
    const filteredMeetings = meetings.filter(m => m.id !== id);

    if (meetings.length === filteredMeetings.length) {
      return NextResponse.json({ message: 'Meeting not found' }, { status: 404 });
    }

    await saveMeetings(filteredMeetings);
    return NextResponse.json({ message: 'Meeting deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return NextResponse.json({ message: 'Error deleting meeting' }, { status: 500 });
  }
}
