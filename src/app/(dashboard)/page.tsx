
import { getTasks, getUsers, getVision, getBurndownData } from '@/lib/data-service';
import DashboardClient from './_components/dashboard-client';
import NoticeBoard from './_components/notice-board';
import LiveStats from './_components/live-stats';
import ProjectStats from './_components/project-stats';
import { KeyStats } from './_components/key-stats';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const tasks = await getTasks();
  const users = await getUsers();
  const vision = await getVision();
  const burndownData = await getBurndownData();

  return (
    <div className="flex flex-col gap-6">
      <NoticeBoard tasks={tasks} initialVision={vision.text} />
      <KeyStats tasks={tasks} users={users} />
      <ProjectStats tasks={tasks} />
      <DashboardClient initialTasks={tasks} initialUsers={users} />
      <LiveStats initialData={burndownData} />
    </div>
  );
}
