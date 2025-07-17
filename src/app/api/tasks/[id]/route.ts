import { NextResponse } from 'next/server';
import { getTasks, saveTasks } from '@/lib/data-service';
import { Task } from '@/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const updatedTask: Task = await request.json();
    let tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.id === id);

    if (taskIndex === -1) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    tasks[taskIndex] = updatedTask;
    await saveTasks(tasks);
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    let tasks = await getTasks();
    
    // Find all descendant tasks to delete
    const tasksToDelete = new Set<string>([id]);
    let queue = [id];

    while(queue.length > 0) {
      const currentId = queue.shift();
      const children = tasks.filter(t => t.parentId === currentId);
      for (const child of children) {
        tasksToDelete.add(child.id);
        queue.push(child.id);
      }
    }

    const filteredTasks = tasks.filter(t => !tasksToDelete.has(t.id));

    if (tasks.length === filteredTasks.length) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    await saveTasks(filteredTasks);
    return NextResponse.json({ message: `Task and ${tasksToDelete.size - 1} subtasks deleted` }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
