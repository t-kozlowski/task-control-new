
'use client';
import React from 'react';
import type { Task, User, Priority } from '@/types';
import { Progress } from '@/components/ui/progress';
import { PriorityIcons } from '@/components/icons';
import { calculateWeightedProgress, getProgressGradient } from '@/lib/task-utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/context/app-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('') || '?';

export function TaskSpotlightItem({ task, allTasks = [] }: { task: Task, allTasks?: Task[] }) {
  const { users } = useApp();

  const assignedUsers = task.assignees.map(email => users.find(u => u.email === email)).filter(Boolean) as User[];

  const progress = calculateWeightedProgress(task, allTasks);
  const progressGradient = getProgressGradient(progress);

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-border/50">
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {React.createElement(PriorityIcons[task.priority], { className: "size-5 text-primary" })}
                    <h3 className="font-semibold text-md text-foreground">{task.name}</h3>
                </div>
                <div className="flex -space-x-2">
                    <TooltipProvider>
                    {assignedUsers.map((user) => (
                        <Tooltip key={user.id}>
                            <TooltipTrigger>
                                <Avatar className="h-7 w-7 border-2 border-background/50">
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent><p>{user.name}</p></TooltipContent>
                        </Tooltip>
                    ))}
                    </TooltipProvider>
                </div>
            </div>
            
            <p className="text-xs text-muted-foreground/80 mb-4 flex-grow line-clamp-2">{task.description}</p>
            
            <div className="flex justify-between items-center">
                 <p className="font-mono text-xl font-bold text-foreground">{progress}%</p>
            </div>
            <Progress
                value={progress}
                className="w-full h-1.5 mt-1"
                indicatorStyle={{ background: progressGradient }}
            />
        </div>
    </Card>
  );
}
