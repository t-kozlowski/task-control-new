
'use client';

import React from 'react';
import type { Task, User } from '@/types';
import TaskList from './task-list';
import TaskSpotlight from './task-spotlight';
import { KeyStats } from './key-stats';
import { AiNotifications } from '@/components/layout/ai-notifications';
import LiveStats from './live-stats';


export default function DashboardClient({ initialTasks, initialUsers }: { initialTasks: Task[], initialUsers: User[] }) {

  return (
    <div className="flex flex-col gap-6">
      <AiNotifications />
      <KeyStats tasks={initialTasks} users={initialUsers} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <TaskList tasks={initialTasks} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <TaskSpotlight tasks={initialTasks} />
            <LiveStats tasks={initialTasks} />
        </div>
      </div>
    </div>
  );
}
