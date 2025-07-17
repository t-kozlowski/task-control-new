'use client';
import React, { useState, useRef, type MouseEvent } from 'react';
import type { Task, User } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Icons, PriorityIcons } from '@/components/icons';
import { calculateWeightedProgress, getProgressGradient } from '@/lib/task-utils';
import { Badge } from '@/components/ui/badge';
import { ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/context/app-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('') || '?';

export default function TaskListItem({ task, allTasks = [] }: { task: Task, allTasks?: Task[] }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const { users } = useApp();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };
  
  const assignedUsers = task.assignees.map(email => users.find(u => u.email === email)).filter(Boolean) as User[];

  const subTasks = allTasks.filter(t => t.parentId === task.id);
  const progress = calculateWeightedProgress(task, allTasks);
  const progressGradient = getProgressGradient(progress);
  const isInProgress = progress > 0 && progress < 100;

  return (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "group relative rounded-lg border bg-card p-0.5 overflow-hidden transition-all duration-300",
         task.status === 'Done' ? 'border-transparent bg-card/50' : 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10'
      )}
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-lg transition-opacity duration-300"
        style={{
          opacity: isHovering && task.status !== 'Done' ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.1), transparent 40%)`,
        }}
      />
      <Accordion type="single" collapsible disabled={subTasks.length === 0}>
        <AccordionItem value={task.id} className="border-none">
          <div className='p-4'>
            <div className='w-full flex items-center justify-between'>
                <div className='flex-1'>
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            {task.status === 'Done' ? <Icons.checkCircle className="size-5 text-green-500" /> : React.createElement(PriorityIcons[task.priority], { className: "size-5 text-primary" })}
                            <h3 className={cn("font-semibold text-lg", task.status === 'Done' && 'line-through text-muted-foreground')}>{task.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                            <div className="flex -space-x-2">
                                <TooltipProvider>
                                {assignedUsers.map((user) => (
                                    <Tooltip key={user.id}>
                                        <TooltipTrigger>
                                            <Avatar className="h-6 w-6 border-2 border-background">
                                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>{user.name}</TooltipContent>
                                    </Tooltip>
                                ))}
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>

                    <p className={cn("text-sm text-muted-foreground mb-4 pl-8 text-left", task.status === 'Done' && 'line-through')}>{task.description}</p>

                    <div className="flex items-center gap-4 pl-8">
                        <Progress
                            value={progress}
                            className="w-full h-1.5"
                            indicatorStyle={{ background: progressGradient }}
                            indicatorClassName={isInProgress && task.status !== 'Done' ? 'animate-subtle-pulse' : ''}
                        />
                        <span className="font-mono text-sm font-semibold">{progress}%</span>
                    </div>
                </div>
                {subTasks.length > 0 && (
                    <AccordionTrigger asChild>
                         <Button variant="ghost" size="icon" className="ml-4 flex-shrink-0 [&[data-state=open]>svg]:rotate-180">
                             <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                        </Button>
                    </AccordionTrigger>
                )}
            </div>
          </div>
          <AccordionContent>
            <div className="px-4 pb-4 pl-12 space-y-2">
              <h4 className="text-sm font-semibold mb-2">Podzadania:</h4>
              {subTasks.length > 0 ? (
                subTasks.map(sub => (
                   <div key={sub.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        {React.createElement(PriorityIcons[sub.priority], { className: `size-4 ${sub.status === 'Done' ? 'text-muted-foreground' : 'text-primary'}` })}
                        <span className={`text-sm ${sub.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{sub.name}</span>
                      </div>
                      <Badge variant={sub.status === 'Done' ? 'outline' : 'secondary'} className={sub.status === 'Done' ? '' : 'text-primary-foreground'}>
                        {sub.status}
                      </Badge>
                    </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">Brak podzadań.</p>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
