'use client'

import { useEffect, useState } from 'react';
import { Task } from '@/types';
import { useApp } from '@/context/app-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskTable } from '../backlog/_components/task-table';
import { TaskFormSheet } from '../backlog/_components/task-form-sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

export default function MyTasksPage() {
    const { loggedInUser, users } = useApp();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);

    const refreshTasks = async () => {
        setIsLoadingTasks(true);
        const res = await fetch('/api/tasks');
        const data = await res.json();
        setTasks(data);
        setIsLoadingTasks(false);
    };

    useEffect(() => {
        refreshTasks();
    }, []);
    
    const myTasks = tasks.filter(task => task.assignees.includes(loggedInUser?.email || ''));

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

    if (isLoadingTasks) {
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
            <Card>
                <CardHeader>
                    <CardTitle>Moje Zadania</CardTitle>
                    <CardDescription>Wszystkie zadania przypisane do Ciebie.</CardDescription>
                </CardHeader>
                <CardContent>
                    {myTasks.length > 0 ? (
                        <TaskTable tasks={myTasks} onEdit={handleEditTask} onTaskDeleted={onTaskDeleted} users={users} />
                    ) : (
                        <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                            <Icons.checkCircle className="h-12 w-12 text-green-500" />
                            <h3 className="text-lg font-semibold">Brak przypisanych zadań!</h3>
                            <p>Ciesz się wolnym czasem lub poszukaj nowych wyzwań w backlogu.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
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
