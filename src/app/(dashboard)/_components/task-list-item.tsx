'use client';
import { useState, useRef, MouseEvent } from 'react';
import { Task } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PriorityIcons } from '@/components/icons';
import { calculateWeightedProgress, getProgressColor } from '@/lib/task-utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

const SubTaskItem = ({ subTask }: { subTask: { name: string; status: string; priority: any } }) => {
  const PriorityIcon = PriorityIcons[subTask.priority as keyof typeof PriorityIcons];
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50">
      <div className="flex items-center gap-2">
        <PriorityIcon className={`size-4 ${subTask.status === 'Done' ? 'text-muted-foreground' : 'text-primary'}`} />
        <span className={`text-sm ${subTask.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>{subTask.name}</span>
      </div>
      <Badge variant={subTask.status === 'Done' ? 'outline' : 'default'} className={subTask.status === 'Done' ? '' : 'bg-primary/20 text-primary'}>
        {subTask.status}
      </Badge>
    </div>
  );
};

export default function TaskListItem({ task }: { task: Task }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const progress = calculateWeightedProgress(task);
  const progressColor = getProgressColor(progress);
  const PriorityIcon = PriorityIcons[task.priority];
  const isInProgress = progress > 0 && progress < 100;

  return (
    <div 
      ref={itemRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="group relative rounded-lg border p-0.5 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 bg-card"
    >
      <div 
        className="pointer-events-none absolute -inset-px rounded-lg transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.1), transparent 40%)`,
        }}
      />
      <Accordion type="single" collapsible>
        <AccordionItem value={task.id} className="border-none">
          <div className="p-4 relative">
            <div className="flex items-center justify-between mb-2">
              <AccordionTrigger className="p-0 hover:no-underline flex-1">
                <div className="flex items-center gap-3">
                  <PriorityIcon className="size-5 text-primary" />
                  <h3 className="font-semibold text-lg">{task.name}</h3>
                </div>
              </AccordionTrigger>
              <div className="flex items-center gap-2 ml-4">
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
            <p className="text-sm text-muted-foreground mb-4 pl-8">{task.description}</p>
            <div className="flex items-center gap-4 pl-8">
              <Progress 
                value={progress} 
                className="w-full h-2" 
                indicatorClassName={`${progressColor} ${isInProgress ? 'animate-subtle-pulse' : ''}`}
              />
              <span className="font-mono text-sm font-semibold">{progress}%</span>
            </div>
          </div>
          <AccordionContent>
            <div className="px-4 pb-4 pl-12 space-y-2">
              {task.subTasks.length > 0 ? (
                task.subTasks.map(sub => <SubTaskItem key={sub.id} subTask={sub} />)
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
