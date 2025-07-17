
'use client';
import React from 'react';
import type { Task, User, Priority } from '@/types';
import { Progress } from '@/components/ui/progress';
import { PriorityIcons } from '@/components/icons';
import { calculateWeightedProgress, getProgressGradient } from '@/lib/task-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useApp } from '@/context/app-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('') || '?';

const priorityGlowColors: Record<Priority, string> = {
    'Critical': 'shadow-[0_0_20px_theme(colors.red.500/0.7)]',
    'High': 'shadow-[0_0_20px_theme(colors.orange.500/0.6)]',
    'Medium': 'shadow-[0_0_15px_theme(colors.amber.500/0.5)]',
    'Low': 'shadow-[0_0_15px_theme(colors.sky.500/0.4)]',
};


export function TaskSpotlightItem({ task, allTasks = [] }: { task: Task, allTasks?: Task[] }) {
  const { users } = useApp();

  const assignedUsers = task.assignees.map(email => users.find(u => u.email === email)).filter(Boolean) as User[];

  const progress = calculateWeightedProgress(task, allTasks);
  const progressGradient = getProgressGradient(progress);

  return (
    <div className={cn(
        "relative rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm p-5 overflow-hidden transition-all duration-300 group",
        "hover:border-white/20 hover:scale-[1.02]"
    )}>
        <div className={cn(
            "absolute inset-0 transition-all duration-500 opacity-50 group-hover:opacity-80 animate-pulse",
             priorityGlowColors[task.priority]
        )} />
        
        <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {React.createElement(PriorityIcons[task.priority], { className: "size-6 text-primary" })}
                    <h3 className="font-semibold text-xl text-shadow-lg shadow-black/50">{task.name}</h3>
                </div>
            </div>
            
            <p className="text-sm text-muted-foreground/80 mb-4 flex-grow">{task.description}</p>
            
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-xs text-muted-foreground">Przypisani</span>
                    <div className="flex -space-x-3 mt-1">
                        <TooltipProvider>
                        {assignedUsers.map((user) => (
                            <Tooltip key={user.id}>
                                <TooltipTrigger>
                                    <Avatar className="h-9 w-9 border-2 border-background/50">
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>{user.name}</TooltipContent>
                            </Tooltip>
                        ))}
                        </TooltipProvider>
                    </div>
                </div>
                <div className="text-right">
                     <span className="text-xs text-muted-foreground">Postęp</span>
                     <p className="font-mono text-2xl font-bold text-foreground mt-1">{progress}%</p>
                </div>
            </div>

            <Progress
                value={progress}
                className="w-full h-3"
                indicatorStyle={{ background: progressGradient }}
            />
        </div>
    </div>
  );
}
