
'use client';

import React from 'react';
import type { Task, User } from '@/types';
import TaskList from './task-list';

export default function DashboardClient({ initialTasks, initialUsers }: { initialTasks: Task[], initialUsers: User[] }) {

  return (
    <div className="flex flex-col gap-6">
       <div className="grid gap-6">
          <TaskList tasks={initialTasks} />
       </div>
    </div>
  );
}
