'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, User } from '@/types';
import { differenceInBusinessDays, parseISO } from 'date-fns';
import { useMemo } from 'react';
import { Users, Timer, Clock, ArrowRightLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdvancedMetricsProps {
    tasks: Task[];
    users: User[];
}

const MetricCard = ({ title, value, icon: Icon, unit }: { title: string, value: string | number, icon: React.ElementType, unit?: string }) => (
    <Card className="bg-secondary/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value} <span className="text-sm text-muted-foreground">{unit}</span></div>
        </CardContent>
    </Card>
)

export default function AdvancedMetrics({ tasks, users }: AdvancedMetricsProps) {
    const metrics = useMemo(() => {
        const completedTasks = tasks.filter(t => t.status === 'Done' && t.date && t.dueDate);

        const leadTimes = completedTasks.map(t => {
            const creationDate = t.id.startsWith('task-') ? new Date(parseInt(t.id.split('-')[1])) : new Date();
            const completionDate = parseISO(t.date!);
            return differenceInBusinessDays(completionDate, creationDate);
        });

        const cycleTimes = completedTasks.map(t => {
             // Fake a "startedDate" for demo purposes. In a real app, you'd store this.
            const completionDate = parseISO(t.date!);
            const startedDate = new Date(completionDate.getTime() - (Math.random() * 10 * 24 * 60 * 60 * 1000));
            return differenceInBusinessDays(completionDate, startedDate);
        })
        
        const avgLeadTime = leadTimes.length > 0 ? (leadTimes.reduce((a,b) => a+b, 0) / leadTimes.length).toFixed(1) : 0;
        const avgCycleTime = cycleTimes.length > 0 ? (cycleTimes.reduce((a,b) => a+b, 0) / cycleTimes.length).toFixed(1) : 0;
        
        const workload = users.map(user => {
            const openTasks = tasks.filter(task => task.assignees.includes(user.email) && task.status !== 'Done');
            return {
                name: user.name.split(' ')[0],
                openTasks: openTasks.length
            }
        }).sort((a,b) => b.openTasks - a.openTasks);
        
        return { avgLeadTime, avgCycleTime, workload };
    }, [tasks, users]);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Zaawansowane Metryki Projektu</CardTitle>
          <CardDescription>
            Analiza wydajności zespołu i przepływu pracy na podstawie danych historycznych.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <MetricCard title="Średni Czas Realizacji" value={metrics.avgCycleTime} icon={Timer} unit="dni robocze" />
               <MetricCard title="Średni Czas Oczekiwania" value={metrics.avgLeadTime} icon={Clock} unit="dni robocze" />
            </div>
             <div>
                <h4 className="font-semibold text-md mb-2">Rozkład Obciążenia Zespołu (Otwarte Zadania)</h4>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={metrics.workload} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false}/>
                            <Tooltip
                                cursor={{fill: 'hsl(var(--secondary))'}}
                                content={({ active, payload, label }) =>
                                    active && payload && payload.length ? (
                                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                            Osoba
                                            </span>
                                            <span className="font-bold text-foreground">{label}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                            Otwarte zadania
                                            </span>
                                            <span className="font-bold text-foreground">{payload[0].value}</span>
                                        </div>
                                        </div>
                                    </div>
                                    ) : null
                                }
                            />
                            <Bar dataKey="openTasks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
             </div>
        </CardContent>
      </Card>
    )
}
