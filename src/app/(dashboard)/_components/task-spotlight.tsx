'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types';
import React, { useMemo, useState, useEffect } from 'react';
import { TaskSpotlightItem } from './task-spotlight-item';
import { AnimatePresence, motion } from 'framer-motion';

const MAX_VISIBLE_TASKS = 5;

export default function TaskSpotlight({ tasks }: { tasks: Task[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const spotlightTasks = useMemo(() => {
    // Spotlight main tasks that are critical or high priority and not done, sorted by priority
    const priorityOrder: Task['priority'][] = ['Critical', 'High', 'Medium', 'Low'];
    return tasks
      .filter(task => !task.parentId && task.status !== 'Done')
      .sort((a, b) => priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority));
  }, [tasks]);

  useEffect(() => {
    if (spotlightTasks.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % spotlightTasks.length);
    }, 4000); // Change task every 4 seconds

    return () => clearInterval(interval);
  }, [spotlightTasks.length]);

  if (spotlightTasks.length === 0) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Zadania w Centrum Uwagi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                    <p>Brak zadań o wysokim priorytecie.</p>
                </div>
            </CardContent>
        </Card>
    );
  }

  const getVisibleTasks = () => {
    const reorderedTasks = [...spotlightTasks.slice(currentIndex), ...spotlightTasks.slice(0, currentIndex)];
    return reorderedTasks.slice(0, MAX_VISIBLE_TASKS);
  };
  
  const visibleTasks = getVisibleTasks();

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Zadania w Centrum Uwagi</CardTitle>
        <CardDescription>Zadania o najwyższym priorytecie.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-[420px] w-full">
            <AnimatePresence>
                {visibleTasks.map((task, index) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{
                            opacity: 1,
                            y: index * 90, // 84px height + 6px gap
                            zIndex: MAX_VISIBLE_TASKS - index,
                            scale: 1 - index * 0.05,
                        }}
                        exit={{ opacity: 0, y: -20, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                        className="absolute w-full"
                    >
                        <TaskSpotlightItem task={task} allTasks={tasks} />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
