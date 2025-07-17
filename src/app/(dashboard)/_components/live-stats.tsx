
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { Task, User } from '@/types';
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, LabelList } from 'recharts';
import { AnimatePresence, motion } from 'framer-motion';

interface LiveStatsProps {
  tasks: Task[];
  users: User[];
}

const initialStatusData: { name: string; zadania: number; fill: string }[] = [
    { name: 'Do zrobienia', zadania: 0, fill: 'hsl(var(--muted-foreground)/0.5)' },
    { name: 'W toku', zadania: 0, fill: 'hsl(40 85% 60%)' },
    { name: 'Ukończone', zadania: 0, fill: 'hsl(140 60% 50%)' },
];

export default function LiveStats({ tasks }: LiveStatsProps) {
  const TOTAL_POINTS = 20; // Represents days in a sprint, for example

  const { initialVelocityData, totalTasks, initialStatuses } = useMemo(() => {
    const totalTasks = tasks.filter(t => !t.parentId).length;
    const idealData = Array.from({ length: TOTAL_POINTS + 1 }, (_, i) => ({
      day: i,
      ideal: Math.round(totalTasks - (totalTasks / TOTAL_POINTS) * i),
      actual: null,
    }));

     const initialStatuses = [...initialStatusData];
     initialStatuses[0].zadania = tasks.filter(t => t.status === 'Todo' || t.status === 'Backlog').length;
     initialStatuses[1].zadania = tasks.filter(t => t.status === 'In Progress').length;
     initialStatuses[2].zadania = tasks.filter(t => t.status === 'Done').length;

    return { initialVelocityData: idealData, totalTasks, initialStatuses };
  }, [tasks]);

  const [velocityData, setVelocityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState(initialStatuses);
  const [kpis, setKpis] = useState({ prediction: 'obliczanie...', deviation: 0 });

  // Animate the line chart drawing
  useEffect(() => {
    let currentPoint = 0;
    const interval = setInterval(() => {
        if (currentPoint <= TOTAL_POINTS) {
            setVelocityData(prev => {
                const newData = [...initialVelocityData];
                // Simulate actual progress with some randomness
                const lastActual = prev.length > 0 && prev[prev.length - 1].actual !== null ? prev[prev.length - 1].actual : totalTasks;
                const randomChange = Math.random() * (totalTasks / TOTAL_POINTS) * 1.5;
                const newActual = Math.max(0, lastActual - randomChange);
                
                // Update the current point
                newData[currentPoint] = { ...newData[currentPoint], actual: Math.round(newActual) };
                
                // Fill previous points if needed
                for(let i = 0; i < currentPoint; i++) {
                    if (newData[i].actual === null) {
                       const prevActual = i > 0 ? newData[i-1].actual : totalTasks;
                       newData[i].actual = prevActual;
                    }
                }

                // Calculate KPIs
                const idealProgress = (totalTasks / TOTAL_POINTS) * currentPoint;
                const actualProgress = totalTasks - newActual;
                const deviation = Math.round(((actualProgress - idealProgress) / idealProgress) * 100);
                
                const velocity = (totalTasks - newActual) / (currentPoint + 1);
                const remainingTasks = newActual;
                const predictedDays = velocity > 0 ? remainingTasks / velocity : Infinity;
                
                setKpis({
                    prediction: isFinite(predictedDays) ? `${Math.ceil(currentPoint + predictedDays)} dni` : 'N/A',
                    deviation: isNaN(deviation) ? 0 : deviation,
                });

                return newData;
            });
            currentPoint++;
        } else {
            clearInterval(interval);
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [initialVelocityData, totalTasks]);


  // Animate the bar chart updates
  useEffect(() => {
    const interval = setInterval(() => {
        setStatusData(prev => {
            const newStatuses = [...prev.map(s => ({...s}))];
            // Simulate task moving from Todo to In Progress
            if (newStatuses[0].zadania > 0 && Math.random() > 0.3) {
                newStatuses[0].zadania--;
                newStatuses[1].zadania++;
            }
            // Simulate task moving from In Progress to Done
            if (newStatuses[1].zadania > 0 && Math.random() > 0.5) {
                newStatuses[1].zadania--;
                newStatuses[2].zadania++;
            }
            return newStatuses;
        });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    ideal: { label: 'Idealna ścieżka', color: 'hsl(var(--muted-foreground)/0.5)' },
    actual: { label: 'Rzeczywisty postęp', color: 'hsl(var(--primary))' },
  };
  
  const KpiCard = ({ title, value, unit, isPositive }: { title: string; value: string | number; unit: string, isPositive?: boolean }) => (
    <div className="rounded-lg bg-secondary/50 p-3 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`text-2xl font-bold ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-foreground'}`}>
        {value}<span className="text-lg font-normal ml-1">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Prędkość vs. Cel</CardTitle>
          <CardDescription>Porównanie rzeczywistego postępu z idealną ścieżką ukończenia projektu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <KpiCard title="Przewidywane ukończenie" value={kpis.prediction} unit="" />
                <KpiCard title="Odchylenie od celu" value={kpis.deviation > 0 ? `+${kpis.deviation}` : kpis.deviation} unit="%" isPositive={kpis.deviation > 0} />
            </div>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <AreaChart accessibilityLayer data={velocityData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} name="Dzień" />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 5']} />
              <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
               <defs>
                <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area dataKey="ideal" type="monotone" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} />
              <Area dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} fill="url(#fillActual)" fillOpacity={0.4} dot={false} isAnimationActive={false}/>
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Puls Projektu</CardTitle>
           <CardDescription>Rozkład zadań w kluczowych statusach w czasie rzeczywistym.</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
           <ResponsiveContainer width="100%" height="100%">
               <BarChart data={statusData} layout="vertical" margin={{ top: 20, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid horizontal={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} width={80} />
                    <ChartTooltip cursor={{fill: 'hsl(var(--accent))'}} content={<ChartTooltipContent hideLabel hideIndicator />} />
                    <Bar dataKey="zadania" radius={[0, 4, 4, 0]} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out">
                         <LabelList 
                            dataKey="zadania" 
                            position="right"
                            offset={8}
                            className="fill-foreground font-semibold"
                            formatter={(value: number) => (value > 0 ? value : '')}
                         />
                    </Bar>
               </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
