import { getTasks, getUsers } from '@/lib/data-service';
import BacklogClient from './_components/backlog-client';

export const dynamic = 'force-dynamic';

export default async function BacklogPage() {
  const tasks = await getTasks();
  const users = await getUsers();
  return (
    <div className="flex flex-col gap-6">
      <BacklogClient initialTasks={tasks} users={users} />
    </div>
  );
}
