// src/app/(dashboard)/schedule/_components/schedule-client.tsx
'use client';
import React, { useMemo } from 'react';
import type { Task, User } from '@/types';
import { useApp } from '@/context/app-context';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityIcons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { parseISO, differenceInDays, startOfMonth, endOfMonth, addDays, format, isWeekend } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

const DAY_WIDTH = 32; // width of a day cell in pixels

function GanttChart({ tasks }: { tasks: Task[] }) {
    const { users } = useApp();

    const mainTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(task => !task.parentId && task.createdAt && task.dueDate);
    }, [tasks]);

    const { startDate, endDate, totalDays, months } = useMemo(() => {
        if (mainTasks.length === 0) {
            const now = new Date();
            return {
                startDate: startOfMonth(now),
                endDate: endOfMonth(now),
                totalDays: 30,
                months: [{ name: format(now, 'MMMM yyyy'), days: 30, startDay: 0 }]
            };
        }

        const allDates = mainTasks.flatMap(t => [parseISO(t.createdAt!), parseISO(t.dueDate!)]);
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

        const startDate = startOfMonth(minDate);
        const endDate = endOfMonth(maxDate);
        const totalDays = differenceInDays(endDate, startDate) + 1;

        const months = [];
        let currentMonthStart = startDate;
        while (currentMonthStart <= endDate) {
            const currentMonthEnd = endOfMonth(currentMonthStart);
            const monthName = format(currentMonthStart, 'MMMM yyyy');
            const daysInMonth = differenceInDays(
                currentMonthEnd > endDate ? endDate : currentMonthEnd,
                currentMonthStart
            ) + 1;
            months.push({
                name: monthName,
                days: daysInMonth,
                startDay: differenceInDays(currentMonthStart, startDate),
            });
            currentMonthStart = addDays(currentMonthEnd, 1);
        }

        return { startDate, endDate, totalDays, months };
    }, [mainTasks]);

    const getAssigneeInfo = (email: string) => users.find(u => u.email === email);
    
    return (
        <div className="border rounded-lg bg-card text-card-foreground overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card">
                <div className="flex" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
                    {months.map((month, index) => (
                        <div key={index} className="flex-shrink-0 text-center font-semibold border-b border-r"
                             style={{ width: `${month.days * DAY_WIDTH}px` }}>
                            {month.name}
                        </div>
                    ))}
                </div>
                <div className="flex" style={{ width: `${totalDays * DAY_WIDTH}px` }}>
                    {Array.from({ length: totalDays }).map((_, i) => {
                         const day = addDays(startDate, i);
                         const isWE = isWeekend(day);
                        return (
                        <div key={i} className={cn("flex-shrink-0 text-center text-xs border-r text-muted-foreground", isWE && "bg-secondary/30")}
                             style={{ width: `${DAY_WIDTH}px` }}>
                            {format(day, 'd')}
                        </div>
                    )})}
                </div>
            </div>

            {/* Task Rows */}
            <div className="relative" style={{ width: `${totalDays * DAY_WIDTH}px`, height: `${mainTasks.length * 40}px` }}>
                {mainTasks.map((task, index) => {
                    const taskStart = parseISO(task.createdAt!);
                    const taskEnd = parseISO(task.dueDate!);

                    const offset = differenceInDays(taskStart, startDate);
                    const duration = differenceInDays(taskEnd, taskStart) + 1;

                    const left = Math.max(0, offset * DAY_WIDTH);
                    const width = Math.max(DAY_WIDTH, duration * DAY_WIDTH);
                    
                    const isCompleted = task.status === 'Done';
                    const isAheadOfSchedule = isCompleted && task.date && parseISO(task.date) < taskEnd;
                    
                    let barClasses = 'bg-primary/20 border border-primary text-primary-foreground';
                    if (isCompleted) {
                        barClasses = 'bg-green-500/80 border border-green-400 text-white';
                    }

                    return (
                        <TooltipProvider key={task.id} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div
                                        className="absolute h-8 rounded-lg flex items-center px-2 overflow-hidden group cursor-pointer"
                                        style={{ top: `${index * 40 + 4}px`, left: `${left}px`, width: `${width}px` }}>
                                        <div className={cn("absolute inset-0 transition-colors", barClasses)} />
                                        
                                        {!isCompleted && (
                                            <div 
                                                className="absolute inset-0" 
                                                style={{ 
                                                    backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 5px, hsl(var(--primary)/0.5) 5px, hsl(var(--primary)/0.5) 10px)`,
                                                    animation: 'move 20s linear infinite'
                                                }}
                                            />
                                        )}

                                        <div className="relative z-10 flex items-center gap-2 w-full">
                                            {React.createElement(PriorityIcons[task.priority], { className: "size-4 flex-shrink-0" })}
                                            <p className="truncate text-sm font-medium">{task.name}</p>
                                            {isAheadOfSchedule && <Star className="size-4 ml-auto text-yellow-300 fill-current" />}
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <div className="p-1 max-w-xs">
                                        <p className="font-bold">{task.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(taskStart, 'dd/MM/yy')} - {format(taskEnd, 'dd/MM/yy')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline">{task.priority}</Badge>
                                            <Badge variant={isCompleted ? 'default' : 'secondary'}>{task.status}</Badge>
                                        </div>
                                         <div className="mt-2 text-xs">
                                            <p className="font-semibold">Przypisani:</p>
                                            {task.assignees.map(email => (
                                                <p key={email}>{getAssigneeInfo(email)?.name || email}</p>
                                            ))}
                                        </div>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    );
                })}
                 {/* Weekend overlays */}
                 {Array.from({ length: totalDays }).map((_, i) => {
                    const day = addDays(startDate, i);
                    if (isWeekend(day)) {
                        return (
                            <div key={`weekend-${i}`}
                                 className="absolute top-0 bottom-0 bg-secondary/30 -z-1"
                                 style={{ left: `${i * DAY_WIDTH}px`, width: `${DAY_WIDTH}px` }}
                            />
                        )
                    }
                    return null;
                })}
            </div>
            <style jsx>{`
                @keyframes move {
                    0% { background-position: 0 0; }
                    100% { background-position: -28px 28px; }
                }
            `}</style>
        </div>
    );
}

export default GanttChart;
