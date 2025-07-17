'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Status, Priority, Task } from '@/types';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const STATUS_COLORS: Record<Status, string> = {
  'Backlog': 'hsl(var(--muted-foreground))',
  'Todo': 'hsl(var(--primary) / 0.5)',
  'In Progress': 'hsl(var(--primary))',
  'Done': 'hsl(var(--accent))',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': '#3b82f6',
  'Medium': '#f59e0b',
  'High': '#ef4444',
  'Critical': '#dc2626',
};

export default function ProjectStats({ tasks }: { tasks: Task[] }) {

  const statusData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<Status, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: STATUS_COLORS[name as Status] }));
  }, [tasks]);

  const priorityData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value, fill: PRIORITY_COLORS[name as Priority] }));
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
          <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
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
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={priorityData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tickMargin={10} width={80} />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <Bar dataKey="value" radius={5}>
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
