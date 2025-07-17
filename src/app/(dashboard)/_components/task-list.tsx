'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import TaskListItem from './task-list-item';
import React from 'react';

export default function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Backlog</CardTitle>
        <CardDescription>A hierarchical view of all tasks and their progress.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.map(task => (
          <TaskListItem key={task.id} task={task} />
        ))}
        {tasks.length === 0 && (
            <div className="text-center text-muted-foreground p-8">No tasks in the backlog.</div>
        )}
      </CardContent>
    </Card>
  );
}
