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
import { Task, Priority, Status } from '@/types';
import { useEffect } from 'react';

const taskSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Task name is required'),
  description: z.string().min(1, 'Description is required'),
  assignee: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['Critical', 'High', 'Medium', 'Low']),
  status: z.enum(['Todo', 'In Progress', 'Done', 'Backlog']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onTaskSaved: () => void;
}

export function TaskFormSheet({ open, onOpenChange, task, onTaskSaved }: TaskFormSheetProps) {
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task) {
      reset(task);
    } else {
      reset({
        id: `TASK-${Date.now()}`,
        name: '',
        description: '',
        assignee: '',
        priority: 'Medium',
        status: 'Todo',
      });
    }
  }, [task, open, reset]);

  const onSubmit = async (data: TaskFormData) => {
    const method = task ? 'PUT' : 'POST';
    const url = task ? `/api/tasks/${task.id}` : '/api/tasks';
    const payload = { ...data, subTasks: task?.subTasks || [] };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save task');
      onTaskSaved();
    } catch (error) {
      console.error(error);
    }
  };

  const priorities: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
  const statuses: Status[] = ['Backlog', 'Todo', 'In Progress', 'Done'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{task ? 'Edit Task' : 'Add New Task'}</SheetTitle>
            <SheetDescription>
              {task ? 'Update the details of the existing task.' : 'Fill in the details for the new task.'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-6 px-1 space-y-4">
            <div>
              <Label htmlFor="name">Task Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} />
              {errors.description && <p className="text-destructive text-sm mt-1">{errors.description.message}</p>}
            </div>
            <div>
              <Label htmlFor="assignee">Assignee</Label>
              <Input id="assignee" {...register('assignee')} />
              {errors.assignee && <p className="text-destructive text-sm mt-1">{errors.assignee.message}</p>}
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
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
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Task'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
