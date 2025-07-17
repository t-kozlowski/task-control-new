// src/app/(dashboard)/cinematic/_components/live-stats.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import type { Task, User } from '@/types';
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LabelList } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

interface LiveStatsProps {
  tasks: Task[];
  users: User[];
}

// Generate a color palette for users
const USER_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff82a9'
];

export default function LiveStats({ tasks, users }: LiveStatsProps) {

  const tasksOverTimeData = useMemo(() => {
    const mainTasks = tasks.filter(t => !t.parentId && t.status === 'Done' && t.date);
    const countsByMonth: Record<string, number> = {};

    mainTasks.forEach(task => {
        if(task.date) {
            const month = format(startOfMonth(parseISO(task.date)), 'MMM yyyy', { locale: pl });
            countsByMonth[month] = (countsByMonth[month] || 0) + 1;
        }
    });

    const sortedMonths = Object.keys(countsByMonth).sort((a, b) => {
        const dateA = new Date(a.split(' ')[1], pl.localize!.month(pl.localize!.match.months.source.indexOf(a.split(' ')[0])));
        const dateB = new Date(b.split(' ')[1], pl.localize!.month(pl.localize!.match.months.source.indexOf(b.split(' ')[0])));
        return dateA.getTime() - dateB.getTime();
    });

    return sortedMonths.map(month => ({
        month,
        tasks: countsByMonth[month],
    }));

  }, [tasks]);

  const tasksPerUserData = useMemo(() => {
    const counts = tasks.reduce((acc, task) => {
      const user = users.find(u => u.email === task.assignee);
      const userName = user?.name || task.assignee;
      acc[userName] = (acc[userName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value], index) => ({
        name,
        value,
        fill: USER_COLORS[index % USER_COLORS.length]
    }));
  }, [tasks, users]);

  const lineChartConfig = {
    tasks: {
      label: 'Ukończone zadania',
      color: 'hsl(var(--primary))',
    },
  };
  
  const pieChartConfig = {
    tasks: {
      label: "Zadania",
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Postęp zadań w czasie</CardTitle>
          <CardDescription>Liczba ukończonych zadań głównych w poszczególnych miesiącach.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
            <LineChart data={tasksOverTimeData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line dataKey="tasks" type="monotone" stroke="var(--color-tasks)" strokeWidth={2} dot={true} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Obciążenie zespołu</CardTitle>
           <CardDescription>Rozkład wszystkich zadań na poszczególnych członków zespołu.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[250px]">
             <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={tasksPerUserData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} cornerRadius={5}>
                {tasksPerUserData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
                 <LabelList
                    dataKey="value"
                    position="outside"
                    offset={15}
                    className="fill-foreground font-semibold"
                    formatter={(value: number) => value}
                />
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </>
  );
}
