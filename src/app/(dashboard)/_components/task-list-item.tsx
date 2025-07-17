'use client';
import { useState, useRef, type MouseEvent } from 'react';
import type { Task } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Icons, PriorityIcons } from '@/components/icons';
import { calculateWeightedProgress, getProgressGradient } from '@/lib/task-utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';

export default function TaskListItem({ task, allTasks = [] }: { task: Task, allTasks?: Task[] }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const subTasks = allTasks.filter(t => t.parentId === task.id);
  const progress = calculateWeightedProgress(task, allTasks);
  const progressGradient = getProgressGradient(progress);
  const PriorityIcon = PriorityIcons[task.priority];
  const isInProgress = progress > 0 && progress < 100;

  return (
    <div
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative rounded-lg border bg-card p-0.5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
    >
      <div
        className="pointer-events-none absolute -inset-px rounded-lg transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.1), transparent 40%)`,
        }}
      />
      <Accordion type="single" collapsible disabled={subTasks.length === 0}>
        <AccordionItem value={task.id} className="border-none">
          <AccordionTrigger className="p-4 hover:no-underline flex-1 text-left" disabled={subTasks.length === 0}>
            <div className='w-full'>
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <PriorityIcon className="size-5 text-primary" />
                        <h3 className="font-semibold text-lg">{task.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <Image
                        src={`https://placehold.co/40x40.png`}
                        alt={task.assignee}
                        width={24}
                        height={24}
                        className="rounded-full"
                        data-ai-hint="people avatar"
                        />
                        <span className="text-sm text-muted-foreground">{task.assignee}</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 pl-8 text-left">{task.description}</p>

                <div className="flex items-center gap-4 pl-8">
                <Progress
                    value={progress}
                    className="w-full h-2"
                    indicatorStyle={{ background: progressGradient }}
                    indicatorClassName={`${isInProgress ? 'animate-subtle-pulse' : ''}`}
                />
                <span className="font-mono text-sm font-semibold">{progress}%</span>
                </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 pb-4 pl-12 space-y-2">
              <h4 className="text-sm font-semibold mb-2">Podzadania:</h4>
              {subTasks.length > 0 ? (
                subTasks.map(sub => (
                   <div key={sub.id} className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <PriorityIcons[sub.priority] className={`size-4 ${sub.status === 'Done' ? 'text-muted-foreground' : 'text-primary'}`} />
                        <span className={`text-sm ${sub.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{sub.name}</span>
                      </div>
                      <Badge variant={sub.status === 'Done' ? 'outline' : 'default'} className={sub.status === 'Done' ? '' : 'bg-primary/20 text-primary'}>
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
