
import { getTasks, getUsers } from '@/lib/data-service';
import DashboardClient from './_components/dashboard-client';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const tasks = await getTasks();
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      <DashboardClient initialTasks={tasks} initialUsers={users} />
    </div>
  );
}
