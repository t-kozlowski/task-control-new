
// src/app/(dashboard)/schedule/_components/schedule-client.tsx
'use client';
import { useMemo } from 'react';
import type { Task } from '@/types';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityIcons } from '@/components/icons';
import { parseISO } from 'date-fns';
import { DayContent, DayContentProps } from 'react-day-picker';

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

  const modifiers = {
    hasTask: Array.from(tasksByDate.keys()).map(dateStr => parseISO(dateStr)),
  };

  const modifiersStyles = {
    hasTask: {
      fontWeight: 'bold',
      border: '2px solid hsl(var(--primary) / 0.5)',
      borderRadius: 'var(--radius)',
    }
  };
  
  const CustomDayContent = (props: DayContentProps) => {
    const dateKey = props.date.toISOString().split('T')[0];
    const dailyTasks = tasksByDate.get(dateKey) || [];
    
    if (dailyTasks.length > 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative h-full w-full flex items-center justify-center">
                    <DayContent {...props} />
                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 justify-center text-xs">{dailyTasks.length}</Badge>
                </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="p-1 space-y-2">
                <h4 className="font-bold">Zadania na {props.date.toLocaleDateString('pl-PL')}:</h4>
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
    
    return <DayContent {...props} />;
  }

  return (
    <Calendar
        mode="single"
        className="rounded-md border p-4"
        classNames={{
            months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
            month: 'space-y-4 w-full',
            table: 'w-full border-collapse space-y-1',
            head_row: 'flex justify-around mb-2',
            head_cell: 'w-full text-muted-foreground rounded-md font-normal text-sm',
            row: 'flex w-full mt-2 justify-around',
            cell: 'h-24 w-full text-center text-sm p-0 relative focus-within:relative focus-within:z-20 rounded-md',
            day: 'h-full w-full p-1 font-normal aria-selected:opacity-100',
        }}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        components={{ DayContent: CustomDayContent }}
    />
  );
}
