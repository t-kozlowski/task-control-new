
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { Task, User } from '@/types';
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, Label, ResponsiveContainer } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

interface LiveStatsProps {
  tasks: Task[];
  users: User[];
}

const USER_COLORS = [
  'hsl(204 80% 60%)', 'hsl(145 65% 55%)', 'hsl(45 85% 60%)',
  'hsl(280 75% 65%)', 'hsl(340 85% 70%)', 'hsl(170 70% 50%)',
  'hsl(25 85% 60%)', 'hsl(0 75% 65%)',
];


export default function LiveStats({ tasks, users }: LiveStatsProps) {

  const initialTasksOverTimeData = useMemo(() => {
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
        zadania: countsByMonth[month],
    }));

  }, [tasks]);

  const [tasksOverTimeData, setTasksOverTimeData] = useState<any[]>([]);
  
  useEffect(() => {
      // Animate the line chart drawing
      let currentPoint = 0;
      const interval = setInterval(() => {
          if(currentPoint < initialTasksOverTimeData.length) {
              setTasksOverTimeData(prev => [...prev, initialTasksOverTimeData[currentPoint]]);
              currentPoint++;
          } else {
              clearInterval(interval);
          }
      }, 200);
      return () => clearInterval(interval);
  }, [initialTasksOverTimeData]);


  const initialTasksPerUserData = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach(user => {
      counts[user.name] = 0; // Initialize all users with 0
    });
    tasks.forEach(task => {
        task.assignees.forEach(assigneeEmail => {
            const user = users.find(u => u.email === assigneeEmail);
            const userName = user?.name || assigneeEmail;
            counts[userName] = (counts[userName] || 0) + 1;
        });
    });

    return Object.entries(counts).map(([name, value], index) => ({
        name,
        value,
        fill: USER_COLORS[index % USER_COLORS.length]
    }));
  }, [tasks, users]);

  const [tasksPerUserData, setTasksPerUserData] = useState(initialTasksPerUserData);
  
  // Simulate real-time updates for the pie chart
  useEffect(() => {
      const interval = setInterval(() => {
          setTasksPerUserData(prevData => {
              if (prevData.length < 2) return prevData;

              // Clone to avoid direct mutation
              const newData = prevData.map(item => ({...item}));
              
              // Find two random, different users to transfer a task
              let fromIndex = Math.floor(Math.random() * newData.length);
              let toIndex = Math.floor(Math.random() * newData.length);
              while (fromIndex === toIndex || newData[fromIndex].value === 0) {
                  fromIndex = Math.floor(Math.random() * newData.length);
                  toIndex = Math.floor(Math.random() * newData.length);
              }

              // Simulate transferring one task
              newData[fromIndex].value -= 1;
              newData[toIndex].value += 1;
              
              return newData;
          });
      }, 3000); // Update every 3 seconds

      return () => clearInterval(interval);
  }, []);

  const totalTasks = useMemo(() => tasks.length, [tasks]);

  const lineChartConfig = {
    zadania: {
      label: 'Ukończone zadania',
      color: 'hsl(var(--primary))',
    },
  };
  
  const pieChartConfig = {
    tasks: {
      label: "Zadania",
    }
  }

  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Wydajność Zespołu</CardTitle>
          <CardDescription>Liczba ukończonych zadań głównych w poszczególnych miesiącach.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={lineChartConfig} className="h-[250px] w-full">
            <AreaChart accessibilityLayer data={tasksOverTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 2']}/>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <defs>
                <linearGradient id="fillZadania" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-zadania)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-zadania)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area dataKey="zadania" type="natural" fill="url(#fillZadania)" stroke="var(--color-zadania)" stackId="a" isAnimationActive={false} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Obciążenie Zespołu</CardTitle>
           <CardDescription>Rozkład wszystkich zadań na poszczególnych członków zespołu.</CardDescription>
        </CardHeader>
        <CardContent>
           <ChartContainer config={pieChartConfig} className="mx-auto aspect-square h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                <Pie data={tasksPerUserData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} cornerRadius={5} isAnimationActive={true} animationDuration={800}>
                  {tasksPerUserData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                  ))}
                  <Label
                      content={({ viewBox }) => {
                          if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle" >
                                      <tspan x={viewBox.cx} y={viewBox.cy} className="text-3xl font-bold fill-foreground" >
                                          {totalTasks.toLocaleString()}
                                      </tspan>
                                      <tspan x={viewBox.cx} y={viewBox.cy + 20} className="text-sm fill-muted-foreground" >
                                          Zadań
                                      </tspan>
                                  </text>
                              );
                          }
                      }}
                   />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
