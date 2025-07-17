import { NextResponse } from 'next/server';
import { getTasks, saveTasks } from '@/lib/data-service';
import { Task } from '@/types';

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading tasks data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newTask: Task = await request.json();
    const tasks = await getTasks();
    
    if (newTask.status === 'Done') {
        newTask.date = new Date().toISOString();
    }
    
    tasks.push(newTask);
    await saveTasks(tasks);
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving task' }, { status: 500 });
  }
}
