
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Task } from '@/types';
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { format, differenceInDays, addDays, isBefore, startOfDay, parseISO } from 'date-fns';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarIcon, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useApp } from '@/context/app-context';


interface LiveStatsProps {
  tasks: Task[];
}

const KpiCard = ({ title, value, unit, isPositive, description }: { title: string; value: string | number; unit: string, isPositive?: boolean, description?: string }) => (
    <div className="rounded-lg bg-secondary/50 p-4 text-center">
      <p className="text-sm text-muted-foreground" title={description}>{title}</p>
      <p className={`text-3xl font-bold ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-foreground'}`}>
        {value}<span className="text-lg font-normal ml-1">{unit}</span>
      </p>
    </div>
);

export default function LiveStats({ tasks }: LiveStatsProps) {
  const [projectDeadline, setProjectDeadline] = useState<Date | undefined>();
  const { toast } = useToast();
  const { loggedInUser } = useApp();

  useEffect(() => {
    const storedDeadline = localStorage.getItem('projectDeadline');
    if (storedDeadline) {
      setProjectDeadline(parseISO(storedDeadline));
    }
  }, []);

  const handleSaveDeadline = () => {
    if (projectDeadline) {
        localStorage.setItem('projectDeadline', projectDeadline.toISOString());
        toast({
            title: 'Zapisano!',
            description: 'Nowy termin końcowy projektu został zapisany.'
        })
    }
  };

  const { burndownData, kpis, hasData, deadlineLine } = useMemo(() => {
    const relevantTasks = tasks.filter(t => !t.parentId && t.dueDate);
    
    if (relevantTasks.length === 0) {
      return { burndownData: [], kpis: { spi: 'N/A', prediction: 'Brak danych' }, hasData: false, deadlineLine: null };
    }
    
    const taskCount = relevantTasks.length;
    const dueDates = relevantTasks.map(t => parseISO(t.dueDate!));
    
    const startDates = relevantTasks.map(t => t.date ? startOfDay(parseISO(t.date)) : new Date());
    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const startDate = startOfDay(minDate);
    const endDate = new Date(Math.max(...dueDates.map(d => d.getTime())));

    const totalDays = Math.max(1, differenceInDays(endDate, startDate));
    
    const idealData: { day: string; ideal: number; actual: number | null }[] = [];
    const tasksPerDay = taskCount / totalDays;
    
    for (let i = 0; i <= totalDays; i++) {
        const currentDate = addDays(startDate, i);
        const idealRemaining = taskCount - (tasksPerDay * i);

        const tasksDoneOnDate = relevantTasks.filter(t => 
            t.status === 'Done' && t.date && isBefore(startOfDay(parseISO(t.date)), addDays(currentDate, 1))
        ).length;

        idealData.push({
            day: format(currentDate, 'MMM dd'),
            ideal: Math.max(0, parseFloat(idealRemaining.toFixed(2))),
            actual: taskCount - tasksDoneOnDate,
        });
    }

    const tasksCompleted = relevantTasks.filter(t => t.status === 'Done').length;
    const daysElapsed = Math.max(1, differenceInDays(new Date(), startDate));
    const plannedWork = tasksPerDay * daysElapsed;
    
    let spi: number | string = 1;
    if (plannedWork > 0) {
        const earnedValue = tasksCompleted;
        spi = isNaN(earnedValue / plannedWork) ? 'N/A' : parseFloat((earnedValue / plannedWork).toFixed(2));
    }

    let prediction: string = "N/A";
    const workRate = tasksCompleted / Math.max(1, differenceInDays(new Date(), startDate));
    if (workRate > 0) {
        const remainingTasks = taskCount - tasksCompleted;
        if (remainingTasks > 0) {
            const remainingDays = remainingTasks / workRate;
            prediction = format(addDays(new Date(), remainingDays), 'dd MMM yyyy');
        } else {
            prediction = "Zakończono";
        }
    }

    let deadlineReferenceLine = null;
    if (projectDeadline) {
      const deadlineDate = projectDeadline;
      if (isBefore(deadlineDate, endDate) && isBefore(startDate, deadlineDate)) {
        deadlineReferenceLine = { x: format(deadlineDate, 'MMM dd'), stroke: 'hsl(var(--destructive))', label: 'Deadline' };
      }
    }

    return { 
        burndownData: idealData, 
        kpis: { 
            spi: isNaN(spi as number) ? 'N/A' : spi,
            prediction: tasksCompleted === taskCount ? 'Zakończono' : prediction,
         },
        hasData: true,
        deadlineLine: deadlineReferenceLine,
    };
  }, [tasks, projectDeadline]);

  const chartConfig = {
    ideal: { label: 'Idealna ścieżka', color: 'hsl(var(--muted-foreground)/0.5)' },
    actual: { label: 'Rzeczywisty postęp', color: 'hsl(var(--primary))' },
  };

  const isProjectManager = loggedInUser?.email === 'tomek@example.com';

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle>Prędkość vs. Cel</CardTitle>
                <CardDescription>Realistyczne porównanie postępu z idealną ścieżką do celu na podstawie terminów zadań.</CardDescription>
            </div>
            {isProjectManager && (
            <div className="space-y-2">
                <Label htmlFor="deadline">Globalny Termin Końcowy Projektu</Label>
                <div className="flex gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="deadline"
                        variant={"outline"}
                        className={cn("w-[240px] justify-start text-left font-normal", !projectDeadline && "text-muted-foreground")}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {projectDeadline ? format(projectDeadline, "PPP") : <span>Wybierz datę</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={projectDeadline}
                        onSelect={setProjectDeadline}
                        initialFocus
                    />
                    </PopoverContent>
                </Popover>
                <Button onClick={handleSaveDeadline}><Save className="h-4 w-4 mr-2" /> Zapisz</Button>
                </div>
            </div>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
          {hasData ? (
            <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <KpiCard 
                        title="Wskaźnik Realizacji Celu (SPI)"
                        value={kpis.spi} 
                        unit="" 
                        isPositive={typeof kpis.spi === 'number' ? kpis.spi >= 1 : undefined}
                        description="SPI >= 1 oznacza, że jesteś przed harmonogramem. SPI < 1 oznacza opóźnienie."
                    />
                    <KpiCard 
                        title="Przewidywane Ukończenie" 
                        value={kpis.prediction}
                        unit=""
                    />
                </div>
                <div className="h-[350px] w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={burndownData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} name="Dzień" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 2']} label={{ value: "Pozostałe zadania", angle: -90, position: 'insideLeft', offset: 10 }} />
                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                    <defs>
                        <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <Area dataKey="ideal" type="monotone" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} name="Idealnie" />
                    <Area dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} fill="url(#fillActual)" fillOpacity={0.4} dot={false} name="Rzeczywiście" />
                    {deadlineLine && <ReferenceLine {...deadlineLine} strokeDasharray="3 3" />}
                    </AreaChart>
                </ChartContainer>
                </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                <Icons.folderOpen className="h-12 w-12" />
                <h3 className="text-lg font-semibold">Brak danych do wygenerowania wykresu</h3>
                <p>Ustaw terminy (`dueDate`) dla zadań głównych, aby zobaczyć analizę.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
