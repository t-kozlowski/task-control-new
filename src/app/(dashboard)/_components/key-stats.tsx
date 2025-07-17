
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, User } from '@/types';
import { Users, ListChecks, Activity } from 'lucide-react';

interface KeyStatsProps {
    tasks: Task[];
    users: User[];
}

const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

export function KeyStats({ tasks, users }: KeyStatsProps) {

    const activeTasks = tasks.filter(t => t.status !== 'Done' && !t.parentId).length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const teamSize = users.length;
    
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <StatCard title="Aktywne Zadania Główne" value={activeTasks} icon={ListChecks} />
           <StatCard title="Zadania w Toku" value={inProgressTasks} icon={Activity} />
           <StatCard title="Wielkość Zespołu" value={teamSize} icon={Users} />
        </div>
    );
}
