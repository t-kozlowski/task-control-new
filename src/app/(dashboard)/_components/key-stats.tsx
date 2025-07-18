
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, User } from '@/types';
import { Users, ListChecks, Activity, Package, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

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

    const mainTasks = tasks.filter(t => !t.parentId);
    const completedMainTasks = mainTasks.filter(t => t.status === 'Done').length;
    const totalMainTasks = mainTasks.length;
    const overallProgress = totalMainTasks > 0 ? Math.round((completedMainTasks / totalMainTasks) * 100) : 0;
    
    const activeTasks = tasks.filter(t => t.status !== 'Done' && !t.parentId).length;
    const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
    const teamSize = users.length;
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Całkowity Postęp Projektu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                        <Label className="text-muted-foreground">Postęp zadań głównych</Label>
                        <span className="font-bold text-xl">{overallProgress}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3" />
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard title="Zadania Główne" value={totalMainTasks} icon={Package} />
                    <StatCard title="Ukończone" value={completedMainTasks} icon={CheckCircle} />
                    <StatCard title="Aktywne" value={activeTasks} icon={ListChecks} />
                    <StatCard title="Wielkość Zespołu" value={teamSize} icon={Users} />
                </div>
            </CardContent>
        </Card>
    );
}
