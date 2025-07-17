import { NextResponse } from 'next/server';
import { saveTasks } from '@/lib/data-service';
import { Task } from '@/types';

export async function POST(request: Request) {
  try {
    const newTasks: Task[] = await request.json();
    
    // Optional: Add more robust validation here if needed
    if (!Array.isArray(newTasks)) {
        return NextResponse.json({ message: 'Invalid data format. Expected an array of tasks.' }, { status: 400 });
    }

    await saveTasks(newTasks);
    return NextResponse.json({ message: 'Tasks imported successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error importing tasks:', error);
    return NextResponse.json({ message: 'Error importing tasks' }, { status: 500 });
  }
}
