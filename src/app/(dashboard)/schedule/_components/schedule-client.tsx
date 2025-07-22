// src/app/(dashboard)/schedule/_components/schedule-client.tsx
'use client';
import { useMemo } from 'react';
import type { Task } from '@/types';
import { Calendar } from "@/components/ui/calendar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityIcons } from '@/components/icons';
import { parseISO } from 'date-fns';

export default function ScheduleClient({ tasks }: { tasks: Task[] }) {

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    if (!tasks) return map;
    tasks.forEach(task => {
      if (task.dueDate && !task.parentId) { // Only main tasks
        const dateKey = task.dueDate.split('T')[0];
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey)!.push(task);
      }
    });
    return map;
  }, [tasks]);

  const modifiers = useMemo(() => {
    const taskDates: Date[] = [];
    tasksByDate.forEach((_, dateStr) => {
        // Correctly parse ISO string to Date object, accounting for timezone offsets
        taskDates.push(parseISO(dateStr));
    });
    return {
        hasTask: taskDates,
    };
  }, [tasksByDate]);

  const modifiersStyles = {
    hasTask: { 
        fontWeight: 'bold',
        position: 'relative' as const 
    },
  };

  const CustomDay = ({ date }: { date: Date }) => {
    const dateKey = date.toISOString().split('T')[0];
    const dailyTasks = tasksByDate.get(dateKey) || [];

    if (dailyTasks.length > 0) {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full h-full flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                            {date.getDate()}
                             <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="p-1 space-y-2">
                            <h4 className="font-bold">Zadania na {date.toLocaleDateString('pl-PL')}:</h4>
                            {dailyTasks.map(task => (
                                <div key={task.id} className="flex items-center gap-2 text-xs">
                                    {React.createElement(PriorityIcons[task.priority], { className: "size-3" })}
                                    <span>{task.name}</span>
                                </div>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    return <>{date.getDate()}</>;
  };


  return (
    <Calendar
        mode="single"
        className="rounded-md border p-4 w-full"
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        components={{
            DayContent: ({ date, activeModifiers }) => <CustomDay date={date!} />
        }}
    />
  );
}
