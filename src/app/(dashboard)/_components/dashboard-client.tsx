
'use client';

import React from 'react';
import type { Task, User } from '@/types';
import TaskList from './task-list';
import TaskSpotlight from './task-spotlight';

export default function DashboardClient({ initialTasks, initialUsers }: { initialTasks: Task[], initialUsers: User[] }) {

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <TaskList tasks={initialTasks} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <TaskSpotlight tasks={initialTasks} />
        </div>
      </div>
    </>
  );
}
