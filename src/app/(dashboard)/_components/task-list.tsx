'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import TaskListItem from './task-list-item';
import React, { useMemo, useState } from 'react';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Archive } from 'lucide-react';

export default function TaskList({ tasks }: { tasks: Task[] }) {
  const [showArchived, setShowArchived] = useState(false);

  const { activeTasks, archivedTasks } = useMemo(() => {
    // Active tasks are main tasks that are not 'Done'
    const active = tasks.filter(t => !t.parentId && t.status !== 'Done');
    // Archived tasks are all tasks (main and sub) that are 'Done'
    const archived = tasks.filter(t => t.status === 'Done');
    
    return { activeTasks: active, archivedTasks: archived };
  }, [tasks]);

  const displayedTasks = showArchived ? archivedTasks : activeTasks;

  if (!tasks || tasks.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Główne Zadania Projektu</CardTitle>
          <CardDescription>Hierarchiczny widok wszystkich zadań głównych i ich postępów.</CardDescription>
        </div>
        <Button variant="outline" onClick={() => setShowArchived(!showArchived)}>
           <Archive className="mr-2 h-4 w-4" />
          {showArchived ? `Pokaż Aktywne (${activeTasks.length})` : `Pokaż Archiwum (${archivedTasks.length})`}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayedTasks.length > 0 ? (
          displayedTasks.map(task => (
            <TaskListItem key={task.id} task={task} allTasks={tasks} />
          ))
        ) : (
          <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
            <Icons.checkCircle className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">{showArchived ? 'Archiwum jest puste' : 'Wszystko gotowe!'}</h3>
            <p>{showArchived ? 'Brak ukończonych zadań.' : 'Brak aktywnych zadań na liście.'}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
