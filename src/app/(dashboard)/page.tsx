
import { getTasks, getUsers, getVision, getBurndownData } from '@/lib/data-service';
import DashboardClient from './_components/dashboard-client';
import NoticeBoard from './_components/notice-board';
import ProjectStats from './_components/project-stats';
import { KeyStats } from './_components/key-stats';
import { AiNotifications } from '@/components/layout/ai-notifications';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const tasks = await getTasks();
  const users = await getUsers();
  const vision = await getVision();
  const burndownData = await getBurndownData();

  return (
    <div className="flex flex-col gap-6">
      <AiNotifications />
      <NoticeBoard tasks={tasks} initialVision={vision.text} />
      <KeyStats tasks={tasks} users={users} />
      <ProjectStats tasks={tasks} />
      <DashboardClient initialTasks={tasks} initialUsers={users} initialBurndownData={burndownData} />
    </div>
  );
}
