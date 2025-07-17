'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import TaskListItem from './task-list-item';
import React from 'react';

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const mainTasks = tasks.filter(t => !t.parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Zadań Projektu</CardTitle>
        <CardDescription>Hierarchiczny widok wszystkich zadań i ich postępów.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainTasks.map(task => (
          <TaskListItem key={task.id} task={task} allTasks={tasks} />
        ))}
        {tasks.length === 0 && (
            <div className="text-center text-muted-foreground p-8">Brak zadań na liście.</div>
        )}
      </CardContent>
    </Card>
  );
}
