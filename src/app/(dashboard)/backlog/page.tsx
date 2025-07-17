import { getTasks } from '@/lib/data-service';
import BacklogClient from './_components/backlog-client';

export const dynamic = 'force-dynamic';

export default async function BacklogPage() {
  const tasks = await getTasks();
  return (
    <div className="flex flex-col gap-6">
      <BacklogClient initialTasks={tasks} />
    </div>
  );
}
