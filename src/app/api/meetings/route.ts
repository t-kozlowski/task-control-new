import { NextResponse } from 'next/server';
import { getMeetings } from '@/lib/data-service';

export async function GET() {
  try {
    const meetings = await getMeetings();
    // Sort meetings by date descending
    meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading meetings data' }, { status: 500 });
  }
}
