'use client';

import { useState, useRef, useMemo, ChangeEvent } from 'react';
import type { Task, User, AiDirective, Priority, Status } from '@/types';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { TaskTable } from './task-table';
import { TaskFormSheet } from './task-form-sheet';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListFilter } from 'lucide-react';

export default function BacklogClient({ initialTasks, users }: { initialTasks: Task[], users: User[] }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: new Set<Status>(),
    priority: new Set<Priority>(),
  });
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data);
  };
  
  const handleFilterChange = (type: 'status' | 'priority', value: string) => {
    setFilters(prev => {
      const newSet = new Set(prev[type]);
      if (newSet.has(value as any)) {
        newSet.delete(value as any);
      } else {
        newSet.add(value as any);
      }
      return { ...prev, [type]: newSet };
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchMatch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) || task.description.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filters.status.size === 0 || filters.status.has(task.status);
      const priorityMatch = filters.priority.size === 0 || filters.priority.has(task.priority);
      return searchMatch && statusMatch && priorityMatch;
    });
  }, [tasks, searchTerm, filters]);

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

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>) => {
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

  const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
  const statuses: Status[] = ['Backlog', 'Todo', 'In Progress', 'Done'];

  return (
    <>
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Lista Zadań</h1>
        <div className="ml-auto flex items-center gap-2">
           <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
            accept="application/json"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filtruj
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtruj po statusie</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statuses.map(status => (
                  <DropdownMenuCheckboxItem key={status} checked={filters.status.has(status)} onCheckedChange={() => handleFilterChange('status', status)}>
                    {status}
                  </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
               <DropdownMenuLabel>Filtruj po priorytecie</DropdownMenuLabel>
              <DropdownMenuSeparator />
               {priorities.map(priority => (
                  <DropdownMenuCheckboxItem key={priority} checked={filters.priority.has(priority)} onCheckedChange={() => handleFilterChange('priority', priority)}>
                    {priority}
                  </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleImportClick}>
            <Icons.import className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Importuj</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleExport}>
            <Icons.export className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Eksportuj</span>
          </Button>
          <Button onClick={handleAddTask} size="sm" className="h-8 gap-1">
            <Icons.plus className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Dodaj Zadanie</span>
          </Button>
        </div>
      </div>
       <div className="relative">
          <Input 
            placeholder="Szukaj zadań..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
          <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      <TaskTable tasks={filteredTasks} onEdit={handleEditTask} onTaskDeleted={onTaskDeleted} users={users} />
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
