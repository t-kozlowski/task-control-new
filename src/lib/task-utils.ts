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
    return task.status === 'In Progress' ? 1 : 0;
  }

  const totalWeight = task.subTasks.reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);
  const completedWeight = task.subTasks
    .filter(subTask => subTask.status === 'Done')
    .reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);

  if (totalWeight === 0) return 0;

  return Math.round((completedWeight / totalWeight) * 100);
};

export const getProgressGradient = (progress: number): string => {
  if (progress <= 0) {
    return 'hsl(var(--secondary))';
  }
  // Hue from red (0) to green (120)
  const hue = (progress / 100) * 120;
  const startColor = `hsl(${hue}, 70%, 50%)`;
  const endColor = `hsl(${hue + 20}, 70%, 60%)`;
  return `linear-gradient(to right, ${startColor}, ${endColor})`;
};
