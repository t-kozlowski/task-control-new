'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Priority, Task } from '@/types';
import React, { useMemo } from 'react';
import TaskListItem from './task-list-item';
import Autoplay from "embla-carousel-autoplay"

export default function TaskSpotlight({ tasks }: { tasks: Task[] }) {
  const spotlightTasks = useMemo(() => {
    return tasks.filter(
      task => (task.priority === 'Critical' || task.priority === 'High') && task.status !== 'Done'
    );
  }, [tasks]);

  if (spotlightTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Spotlight</CardTitle>
          <CardDescription>No critical or high priority tasks are active.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-full min-h-[200px]">
          <p className="text-muted-foreground">All clear!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Spotlight</CardTitle>
        <CardDescription>Auto-rotating critical & high priority tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel 
            opts={{ loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
        >
          <CarouselContent>
            {spotlightTasks.map(task => (
              <CarouselItem key={task.id}>
                <TaskListItem task={task} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
