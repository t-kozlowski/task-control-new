
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, CheckCircle, Package, ListChecks } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Task } from '@/types';

const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number }) => (
    <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary/80" />
        <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
        </div>
    </div>
);

export default function NoticeBoard({ tasks, initialVision }: { tasks: Task[], initialVision: string }) {
    const [vision, setVision] = useState(initialVision);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      // Vision is now passed as a prop, but we keep this effect in case we want to make it live-updating later.
      setVision(initialVision);
    }, [initialVision]);

    const mainTasks = tasks.filter(t => !t.parentId);
    const completedMainTasks = mainTasks.filter(t => t.status === 'Done').length;
    const totalMainTasks = mainTasks.length;
    const remainingMainTasks = totalMainTasks - completedMainTasks;

    return (
        <Card className="w-full bg-gradient-to-br from-card to-secondary/30 border-primary/20 shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                    <Target className="h-6 w-6 text-primary" />
                    <span>Tablica Ogłoszeń i Wizja Projektu</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="md:col-span-2">
                    <h3 className="font-semibold text-lg mb-2 text-primary">Główna Wizja</h3>
                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                    ) : (
                        <p className="text-muted-foreground italic">"{vision || 'Główna wizja projektu nie została jeszcze zdefiniowana.'}"</p>
                    )}
                </div>
                <div className="md:col-span-1 space-y-4 border-l-0 md:border-l md:pl-6 border-dashed border-primary/30">
                     <h3 className="font-semibold text-lg mb-2 text-primary">Kluczowe Metryki</h3>
                    <StatItem icon={Package} label="Zadań Głównych" value={totalMainTasks} />
                    <StatItem icon={CheckCircle} label="Ukończonych" value={completedMainTasks} />
                    <StatItem icon={ListChecks} label="Pozostałych" value={remainingMainTasks} />
                </div>
            </CardContent>
        </Card>
    );
}
