// src/app/(dashboard)/my-day/_components/my-day-client.tsx
'use client'

import { useMemo } from 'react';
import type { Task, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TaskTable } from '../../backlog/_components/task-table';
import { Icons } from '@/components/icons';
import { useApp } from '@/context/app-context';
import { isToday, parseISO } from 'date-fns';

interface MyDayClientProps {
    tasks: Task[];
    users: User[];
    onEditTask: (task: Task) => void;
    onTaskDeleted: () => void;
}

export default function MyDayClient({ tasks, users, onEditTask, onTaskDeleted }: MyDayClientProps) {
    const { loggedInUser } = useApp();

    const todaysTasks = useMemo(() => {
        if (!loggedInUser) return [];
        return tasks.filter(task => 
            task.assignees.includes(loggedInUser.email) &&
            task.dueDate &&
            isToday(parseISO(task.dueDate))
        );
    }, [tasks, loggedInUser]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Zadania na Dziś</CardTitle>
                <CardDescription>
                    Oto Twoja lista zadań (głównych i podzadań), których termin upływa dzisiaj. Skup się na nich, aby utrzymać tempo projektu.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {todaysTasks.length > 0 ? (
                    <TaskTable tasks={todaysTasks} onEdit={onEditTask} onTaskDeleted={onTaskDeleted} users={users} />
                ) : (
                    <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                        <Icons.calendarCheck className="h-12 w-12 text-green-500" />
                        <h3 className="text-lg font-semibold">Brak zadań na dziś!</h3>
                        <p>Nie masz żadnych zadań z dzisiejszym terminem wykonania. Może warto zajrzeć do backlogu?</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
