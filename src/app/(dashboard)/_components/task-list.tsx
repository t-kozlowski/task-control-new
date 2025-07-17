'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import TaskListItem from './task-list-item';
import React from 'react';
import { Icons } from '@/components/icons';

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const mainTasks = tasks.filter(t => !t.parentId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Główne Zadania Projektu</CardTitle>
        <CardDescription>Hierarchiczny widok wszystkich zadań głównych i ich postępów.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {mainTasks.length > 0 ? (
          mainTasks.map(task => (
            <TaskListItem key={task.id} task={task} allTasks={tasks} />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
            <Icons.checkCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">Wszystko gotowe!</h3>
            <p>Brak zadań na liście. Możesz dodać nowe zadania w zakładce "Lista Zadań".</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
