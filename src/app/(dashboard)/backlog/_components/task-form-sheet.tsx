'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Task, Priority, Status, User } from '@/types';
import { useEffect } from 'react';
import { useApp } from '@/context/app-context';

const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nazwa zadania jest wymagana'),
  description: z.string().min(1, 'Opis jest wymagany'),
  assignee: z.string().email('Nieprawidłowy adres email').min(1, 'Przypisana osoba jest wymagana'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  status: z.enum(['Todo', 'In Progress', 'Done', 'Backlog']),
  parentId: z.string().nullable().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskSaved: () => void;
  users: User[];
  tasks: Task[];
}

export function TaskFormSheet({ open, onOpenChange, task, onTaskSaved, users, tasks }: TaskFormSheetProps) {
  const { loggedInUser } = useApp();
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (open) {
      if (task) {
        reset(task);
      } else {
        reset({
          id: `TASK-${Date.now()}`,
          name: '',
          description: '',
          assignee: loggedInUser?.email || '',
          priority: 'Medium',
          status: 'Todo',
          parentId: null,
        });
      }
    }
  }, [task, open, reset, loggedInUser]);

  const onSubmit = async (data: TaskFormData) => {
    const method = task ? 'PUT' : 'POST';
    const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
    // Ensure subTasks from original object is preserved if editing
    const payload = { ...task, ...data };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Nie udało się zapisać zadania');
      onTaskSaved();
    } catch (error) {
      console.error(error);
      // You might want to show a toast message here
    }
  };

  const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
  const statuses: Status[] = ['Backlog', 'Todo', 'In Progress', 'Done'];
  const parentTasks = tasks.filter(t => !t.parentId && t.id !== task?.id);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{task ? 'Edytuj Zadanie' : 'Dodaj Nowe Zadanie'}</SheetTitle>
            <SheetDescription>
              {task ? 'Zaktualizuj szczegóły istniejącego zadania.' : 'Wypełnij szczegóły nowego zadania.'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-6 px-1 space-y-4">
            <div>
              <Label htmlFor="parentId">Zadanie Główne (opcjonalne)</Label>
              <Controller
                name="parentId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(value) => field.onChange(value === 'none' ? null : value)} value={field.value || 'none'}>
                    <SelectTrigger><SelectValue placeholder="Wybierz zadanie nadrzędne" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak (to jest zadanie główne)</SelectItem>
                      {parentTasks.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
             <div>
              <Label htmlFor="name">Nazwa Zadania</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Opis</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="assignee">Przypisany</Label>
              <Controller
                name="assignee"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Wybierz osobę" /></SelectTrigger>
                    <SelectContent>
                      {users.map(u => <SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
               {errors.assignee && <p className="text-destructive text-sm mt-1">{errors.assignee.message}</p>}
            </div>
            <div>
              <Label htmlFor="priority">Priorytet</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Anuluj</Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz Zadanie'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
