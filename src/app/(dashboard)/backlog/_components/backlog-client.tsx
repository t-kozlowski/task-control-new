'use client';

import { useState } from 'react';
import type { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { TaskTable } from './task-table';
import { TaskFormSheet } from './task-form-sheet';

export default function BacklogClient({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const refreshTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsSheetOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsSheetOpen(true);
  };

  const handleExport = () => {
    window.location.href = '/api/tasks/export';
  };

  const onTaskSaved = () => {
    refreshTasks();
    setIsSheetOpen(false);
  };
  
  const onTaskDeleted = () => {
    refreshTasks();
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Project Backlog</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Icons.export className="mr-2" />
            Export
          </Button>
          <Button onClick={handleAddTask}>
            <Icons.plus className="mr-2" />
            Add Task
          </Button>
        </div>
      </div>
      <TaskTable tasks={tasks} onEdit={handleEditTask} onTaskDeleted={onTaskDeleted} />
      <TaskFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        task={editingTask}
        onTaskSaved={onTaskSaved}
      />
    </>
  );
}
