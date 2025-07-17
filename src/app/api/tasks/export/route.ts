import { NextResponse } from 'next/server';
import { getTasks } from '@/lib/data-service';

export async function GET() {
  try {
    const tasks = await getTasks();
    const json = JSON.stringify(tasks, null, 2);
    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="tasks.json"',
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Error exporting tasks data' }, { status: 500 });
  }
}
