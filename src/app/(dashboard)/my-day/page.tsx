// src/app/(dashboard)/my-day/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { Task, User } from '@/types';
import { useApp } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskFormSheet } from '../backlog/_components/task-form-sheet';
import MyDayClient from './_components/my-day-client';
import { CalendarDays } from 'lucide-react';

export default function MyDayPage() {
    const { users } = useApp();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshTasks = async () => {
        setIsLoading(true);
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
        setIsLoading(false);
    };

    useEffect(() => {
        refreshTasks();
    }, []);

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsSheetOpen(true);
    };
    
    const onTaskSaved = () => {
        refreshTasks();
        setIsSheetOpen(false);
    };
    
    const onTaskDeleted = () => {
        refreshTasks();
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-64 w-full" />
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6">
             <div className="flex items-center gap-3">
                <CalendarDays className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Mój Dzień</h1>
            </div>
            <MyDayClient 
                tasks={tasks}
                users={users}
                onEditTask={handleEditTask}
                onTaskDeleted={onTaskDeleted}
            />
             <TaskFormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                task={editingTask}
                onTaskSaved={onTaskSaved}
                users={users}
                tasks={tasks}
            />
        </div>
    );
}
