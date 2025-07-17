import { Task, Priority } from '@/types';

export const priorityWeights: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

// Updated to calculate progress based on sub-tasks (if any) or status
export const calculateWeightedProgress = (task: Task, allTasks: Task[]): number => {
  if (task.status === 'Done') return 100;
  
  const subTasks = allTasks.filter(t => t.parentId === task.id);

  if (subTasks.length === 0) {
    // If no subtasks, progress is based on its own status
    switch (task.status) {
        case 'Done': return 100;
        case 'In Progress': return 50; // Or some other value
        case 'Todo': return 0;
        case 'Backlog': return 0;
        default: return 0;
    }
  }

  const totalWeight = subTasks.reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);
  
  if (totalWeight === 0) return 0;

  const completedWeight = subTasks
    .filter(subTask => subTask.status === 'Done')
    .reduce((acc, subTask) => acc + priorityWeights[subTask.priority], 0);

  return Math.round((completedWeight / totalWeight) * 100);
};


export const getProgressGradient = (progress: number): string => {
  if (progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  // Hue from red (0) to green (120)
  const hue = progress * 1.2;
  // Use more subtle colors
  const startColor = `hsl(${hue}, 60%, 55%)`;
  const endColor = `hsl(${hue + 20}, 60%, 65%)`;
  return `linear-gradient(to right, ${startColor}, ${endColor})`;
};
