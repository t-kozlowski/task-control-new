'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Task } from '@/types';
import React, { useMemo } from 'react';
import Autoplay from "embla-carousel-autoplay"
import { TaskSpotlightItem } from './task-spotlight-item';

export default function TaskSpotlight({ tasks }: { tasks: Task[] }) {
  const spotlightTasks = useMemo(() => {
    // Spotlight main tasks that are critical or high priority and not done
    return tasks.filter(
      task => !task.parentId && (task.priority === 'Critical' || task.priority === 'High') && task.status !== 'Done'
    );
  }, [tasks]);

  if (spotlightTasks.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Zadania w Centrum Uwagi</CardTitle>
        <CardDescription>Automatyczna rotacja zadań o najwyższym priorytecie.</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel 
            opts={{ loop: true, align: "start" }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
        >
          <CarouselContent className="-ml-4">
            {spotlightTasks.map(task => (
              <CarouselItem key={task.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <TaskSpotlightItem task={task} allTasks={tasks} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </CardContent>
    </Card>
  );
}
