
// src/app/api/burndown/route.ts
import { NextResponse } from 'next/server';
import { getBurndownData, saveBurndownData } from '@/lib/data-service';
import { BurndownDataPoint } from '@/types';

export async function GET() {
  try {
    const data = await getBurndownData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading burndown data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newData: BurndownDataPoint[] = await request.json();
    await saveBurndownData(newData);
    return NextResponse.json(newData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving burndown data' }, { status: 500 });
  }
}
