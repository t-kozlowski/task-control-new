import { Task, SubTask, Priority } from '@/types';

export const priorityWeights: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const calculateWeightedProgress = (task: Task): number => {
  if (task.status === 'Done') return 100;
  if (!task.subTasks || task.subTasks.length === 0) {
    return 0;
  }

  const totalWeight = task.subTasks.reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);
  const completedWeight = task.subTasks
    .filter(subTask => subTask.status === 'Done')
    .reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);

  if (totalWeight === 0) return 0;

  return Math.round((completedWeight / totalWeight) * 100);
};

export const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-accent';
  if (progress > 75) return 'bg-primary';
  if (progress > 50) return 'bg-progress-yellow';
  if (progress > 25) return 'bg-progress-orange';
  if (progress > 0) return 'bg-destructive/70';
  return 'bg-secondary';
};
