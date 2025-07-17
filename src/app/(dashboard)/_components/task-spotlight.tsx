'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Task } from '@/types';
import React, { useMemo } from 'react';
import TaskListItem from './task-list-item';
import Autoplay from "embla-carousel-autoplay"

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
    <Card>
      <CardHeader>
        <CardTitle>Wyróżnione Zadania</CardTitle>
        <CardDescription>Automatyczna rotacja zadań głównych o wysokim i krytycznym priorytecie.</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel 
            opts={{ loop: true, align: "start" }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
        >
          <CarouselContent>
            {spotlightTasks.map(task => (
              <CarouselItem key={task.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                    <TaskListItem task={task} allTasks={tasks} />
                </div>
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
