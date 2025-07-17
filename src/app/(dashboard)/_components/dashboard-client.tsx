'use client';

import React, { useState } from 'react';
import type { Task, User } from '@/types';
import ProjectStats from './project-stats';
import TaskList from './task-list';
import TaskSpotlight from './task-spotlight';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import AiSummaryDialog from './ai-summary-dialog';
import LiveStats from './live-stats';
import { useApp } from '@/context/app-context';

export default function DashboardClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const { users } = useApp();


  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pulpit</h1>
        <Button onClick={() => setIsSummaryDialogOpen(true)}>
          <Icons.bot className="mr-2" />
          Podsumowanie AI "Big Picture"
        </Button>
      </div>

      <ProjectStats tasks={tasks} />
      <LiveStats tasks={tasks} users={users} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TaskList tasks={tasks} />
        </div>
        <div>
          <TaskSpotlight tasks={tasks} />
        </div>
      </div>
      <AiSummaryDialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen} />
    </>
  );
}
