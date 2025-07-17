
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Task } from '@/types';
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, differenceInDays, addDays, isBefore, startOfDay } from 'date-fns';

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
  const { burndownData, kpis } = useMemo(() => {
    // We only consider main tasks for the burndown chart
    const relevantTasks = tasks.filter(t => !t.parentId && t.dueDate);
    if (relevantTasks.length === 0) {
      return { burndownData: [], kpis: { spi: 'N/A', prediction: 'Brak danych' } };
    }
    
    const taskCount = relevantTasks.length;
    // Ensure all due dates are valid Date objects before comparison
    const dates = relevantTasks.map(t => new Date(t.dueDate!));
    const startDate = startOfDay(new Date()); // Start from today
    const endDate = new Date(Math.max(...dates.map(d => d.getTime())));

    // Handle case where all tasks are due in the past or today
    const totalDays = differenceInDays(endDate, startDate) > 0 ? differenceInDays(endDate, startDate) : 1;
    
    const idealData: { day: string; ideal: number; actual: number | null }[] = [];
    const tasksPerDay = taskCount / totalDays;
    
    const tasksDoneByToday = relevantTasks.filter(t => 
        t.status === 'Done' && t.date && isBefore(startOfDay(new Date(t.date)), addDays(startDate, 1))
    ).length;

    for (let i = 0; i <= totalDays; i++) {
        const currentDate = addDays(startDate, i);
        const idealRemaining = taskCount - (tasksPerDay * i);

        const tasksDoneOnDate = relevantTasks.filter(t => 
            t.status === 'Done' && t.date && isBefore(startOfDay(new Date(t.date)), currentDate)
        ).length;

        idealData.push({
            day: format(currentDate, 'MMM dd'),
            ideal: Math.max(0, parseFloat(idealRemaining.toFixed(2))),
            actual: i === 0 ? taskCount : (taskCount - tasksDoneOnDate),
        });
    }

    const tasksCompleted = relevantTasks.filter(t => t.status === 'Done').length;
    const daysElapsed = differenceInDays(new Date(), startDate) > 0 ? differenceInDays(new Date(), startDate) : 1;
    const plannedWork = tasksPerDay * daysElapsed;
    
    // Schedule Performance Index (SPI)
    let spi: number | string = 1;
    if (plannedWork > 0) {
        const earnedValue = tasksCompleted; // Simplified EV: 1 task = 1 unit of value
        spi = isNaN(earnedValue / plannedWork) ? 'N/A' : parseFloat((earnedValue / plannedWork).toFixed(2));
    }

    let prediction: string = "N/A";
    const workRate = tasksCompleted / daysElapsed; // tasks per day
    if (workRate > 0) {
        const remainingTasks = taskCount - tasksCompleted;
        if (remainingTasks > 0) {
            const remainingDays = remainingTasks / workRate;
            prediction = format(addDays(new Date(), remainingDays), 'dd MMM yyyy');
        } else {
            prediction = "Zakończono";
        }
    }


    return { 
        burndownData: idealData, 
        kpis: { 
            spi: isNaN(spi as number) ? 'N/A' : spi,
            prediction: tasksCompleted === taskCount ? 'Zakończono' : prediction,
         } 
    };
  }, [tasks]);

  const chartConfig = {
    ideal: { label: 'Idealna ścieżka', color: 'hsl(var(--muted-foreground)/0.5)' },
    actual: { label: 'Rzeczywisty postęp', color: 'hsl(var(--primary))' },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Prędkość vs. Cel</CardTitle>
        <CardDescription>Realistyczne porównanie postępu z idealną ścieżką do celu na podstawie terminów zadań.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 5']} label={{ value: "Pozostałe zadania", angle: -90, position: 'insideLeft', offset: 10 }} />
              <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
              <defs>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area dataKey="ideal" type="monotone" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} name="Idealnie" />
              <Area dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} fill="url(#fillActual)" fillOpacity={0.4} dot={false} name="Rzeczywiście" />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
