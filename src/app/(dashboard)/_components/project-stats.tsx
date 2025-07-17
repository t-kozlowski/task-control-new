'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Status, Priority, Task } from '@/types';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const STATUS_COLORS: Record<Status, string> = {
  'Backlog': 'hsl(215 25% 65%)',
  'Todo': 'hsl(200 80% 60%)',
  'In Progress': 'hsl(40 85% 60%)',
  'Done': 'hsl(140 60% 50%)',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': 'hsl(210 30% 60%)',
  'Medium': 'hsl(45 80% 60%)',
  'High': 'hsl(10 80% 60%)',
  'Critical': 'hsl(0 85% 55%)',
};

const statusTranslations: Record<Status, string> = {
  'Backlog': 'Backlog',
  'Todo': 'Do zrobienia',
  'In Progress': 'W toku',
  'Done': 'Ukończone',
};

const priorityTranslations: Record<Priority, string> = {
  'Critical': 'Krytyczny',
  'High': 'Wysoki',
  'Medium': 'Średni',
  'Low': 'Niski',
};


export default function ProjectStats({ tasks }: { tasks: Task[] }) {

  const statusData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);
    return Object.entries(counts).map(([name, value]) => ({
        name: statusTranslations[name as Status] || name,
        value, 
        fill: STATUS_COLORS[name as Status] 
    }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    
    const priorityOrder: Priority[] = ['Critical', 'High', 'Medium', 'Low'];
    
    return priorityOrder
      .filter(p => counts[p] > 0)
      .map(p => ({
          name: priorityTranslations[p] || p,
          value: counts[p],
          fill: PRIORITY_COLORS[p]
      }));
  }, [tasks]);

  const chartConfig = {
    tasks: {
      label: 'Zadania',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Zadania według statusu</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[300px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} cornerRadius={5}>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
                <LabelList
                    dataKey="value"
                    position="outside"
                    offset={20}
                    className="fill-foreground font-semibold text-lg"
                    formatter={(value: number) => value}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Zadania według priorytetu</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 40 }}>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
              <ChartTooltip cursor={{ fill: 'hsl(var(--secondary))' }} content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={5}>
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  offset={10} 
                  className="fill-foreground font-semibold" 
                />
                 {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
