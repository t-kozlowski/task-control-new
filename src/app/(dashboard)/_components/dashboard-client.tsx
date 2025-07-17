
'use client';

import React from 'react';
import type { Task, User } from '@/types';
import TaskSpotlight from './task-spotlight';
import { KeyStats } from './key-stats';
import { AiSummaryCard } from './ai-summary-card';

export default function DashboardClient({ initialTasks, initialUsers }: { initialTasks: Task[], initialUsers: User[] }) {

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Pulpit Strategiczny</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <div className="lg:col-span-3">
            <AiSummaryCard />
        </div>
        <div className="lg:col-span-3">
            <KeyStats tasks={initialTasks} users={initialUsers} />
        </div>
        <div className="lg:col-span-3">
          <TaskSpotlight tasks={initialTasks} />
        </div>
      </div>
    </div>
  );
}
