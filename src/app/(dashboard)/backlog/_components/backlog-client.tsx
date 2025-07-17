'use client';

import { useState, useRef } from 'react';
import type { Task, User, AiDirective } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { TaskTable } from './task-table';
import { TaskFormSheet } from './task-form-sheet';
import { useToast } from '@/hooks/use-toast';

export default function BacklogClient({ initialTasks, users }: { initialTasks: Task[], users: User[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result;
        if (typeof content !== 'string') {
          throw new Error('Nie można odczytać pliku.');
        }
        const importedTasks = JSON.parse(content);
        
        // Basic validation
        if (!Array.isArray(importedTasks) || !importedTasks.every(t => t.id && t.name)) {
            throw new Error('Nieprawidłowy format pliku JSON.');
        }

        const response = await fetch('/api/tasks/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(importedTasks),
        });

        if (!response.ok) {
          throw new Error('Błąd podczas importowania zadań.');
        }
        
        toast({
          title: 'Sukces',
          description: 'Zadania zostały pomyślnie zaimportowane.',
        });
        await refreshTasks();
      } catch (error) {
        toast({
          title: 'Błąd importu',
          description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.',
          variant: 'destructive',
        });
      } finally {
        // Reset file input
        if(event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
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
        <h1 className="text-2xl font-bold tracking-tight">Lista Zadań</h1>
        <div className="flex gap-2">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept="application/json"
          />
          <Button variant="outline" onClick={handleImportClick}>
            <Icons.import className="mr-2" />
            Importuj
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Icons.export className="mr-2" />
            Eksportuj
          </Button>
          <Button onClick={handleAddTask}>
            <Icons.plus className="mr-2" />
            Dodaj Zadanie
          </Button>
        </div>
      </div>
      <TaskTable tasks={tasks} onEdit={handleEditTask} onTaskDeleted={onTaskDeleted} users={users} />
      <TaskFormSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        task={editingTask}
        onTaskSaved={onTaskSaved}
        users={users}
        tasks={tasks}
      />
    </>
  );
}
