
'use client';

import React from 'react';
import type { Task, User, BurndownDataPoint } from '@/types';
import TaskList from './task-list';
import TaskSpotlight from './task-spotlight';
import LiveStats from './live-stats';

export default function DashboardClient({ 
  initialTasks, 
  initialUsers,
  initialBurndownData
}: { 
  initialTasks: Task[], 
  initialUsers: User[],
  initialBurndownData: BurndownDataPoint[]
}) {

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 flex flex-col gap-6">
            <TaskList tasks={initialTasks} />
        </div>
        <div className="lg:col-span-1 flex flex-col gap-6">
            <TaskSpotlight tasks={initialTasks} />
            <LiveStats initialData={initialBurndownData} />
        </div>
      </div>
    </>
  );
}
