'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Status, Priority, Task } from '@/types';
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';

const STATUS_COLORS: Record<Status, string> = {
  'Backlog': 'hsl(var(--muted-foreground) / 0.5)',
  'Todo': 'hsl(var(--primary) / 0.4)',
  'In Progress': 'hsl(var(--primary))',
  'Done': 'hsl(var(--accent))',
};

// New, more sophisticated and theme-aligned color palette for priorities
const PRIORITY_COLORS: Record<Priority, string> = {
  'Low': 'hsl(210 40% 50%)',    // Calmer Blue
  'Medium': 'hsl(38 92% 50%)',  // Amber/Gold
  'High': 'hsl(0 84% 60%)',     // Stronger Red
  'Critical': 'hsl(0 90% 40%)',   // Deeper, more intense Red
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
