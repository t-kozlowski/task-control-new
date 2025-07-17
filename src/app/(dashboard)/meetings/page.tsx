import { getMeetings } from '@/lib/data-service';
import MeetingsClient from './_components/meetings-client';

export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const meetings = await getMeetings();
  // Ensure meetings are sorted by date descending for consistent previous meeting logic
  const sortedMeetings = meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flex flex-col gap-6">
      <MeetingsClient initialMeetings={sortedMeetings} />
    </div>
  );
}
