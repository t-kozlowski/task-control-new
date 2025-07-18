
// src/app/api/vision/route.ts
import { NextResponse } from 'next/server';
import { getVision, saveVision } from '@/lib/data-service';

export async function GET() {
  try {
    const vision = await getVision();
    return NextResponse.json(vision);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading vision data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newVision: { text: string } = await request.json();
    await saveVision(newVision);
    return NextResponse.json(newVision, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving vision' }, { status: 500 });
  }
}
