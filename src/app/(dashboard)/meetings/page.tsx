// src/app/(dashboard)/meetings/page.tsx
import { getMeetings, getTasks } from '@/lib/data-service';
import MeetingsClient from './_components/meetings-client';

export const dynamic = 'force-dynamic';

export default async function MeetingsPage() {
  const meetings = await getMeetings();
  const tasks = await getTasks();
  
  return <MeetingsClient initialMeetings={meetings} initialTasks={tasks} />;
}
