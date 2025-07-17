
'use client';

import React from 'react';
import type { Task, User } from '@/types';
import TaskSpotlight from './task-spotlight';
import { KeyStats } from './key-stats';
import { AiSummaryCard } from './ai-summary-card';
import ProjectStats from './project-stats';
import LiveStats from './live-stats';
import TaskList from './task-list';

export default function DashboardClient({ initialTasks, initialUsers }: { initialTasks: Task[], initialUsers: User[] }) {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pulpit Strategiczny</h1>
      </div>

       <div className="grid gap-6">
          <AiSummaryCard />
          <KeyStats tasks={initialTasks} users={initialUsers} />
          <ProjectStats tasks={initialTasks} />
          <LiveStats tasks={initialTasks} users={initialUsers} />
          <TaskSpotlight tasks={initialTasks} />
          <TaskList tasks={initialTasks} />
       </div>
    </div>
  );
}
