
import { getTasks, getUsers } from '@/lib/data-service';
import DashboardClient from './_components/dashboard-client';
import NoticeBoard from './_components/notice-board';
import LiveStats from './_components/live-stats';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const tasks = await getTasks();
  const users = await getUsers();

  return (
    <div className="flex flex-col gap-6">
      <NoticeBoard tasks={tasks} />
      <DashboardClient initialTasks={tasks} initialUsers={users} />
      <LiveStats tasks={tasks} />
    </div>
  );
}
