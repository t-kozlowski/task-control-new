import { NextResponse } from 'next/server';
import { getDirectives, saveDirectives } from '@/lib/data-service';
import { AiDirective } from '@/types';

export async function GET() {
  try {
    const directives = await getDirectives();
    return NextResponse.json(directives);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading directives data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newDirectives: AiDirective[] = await request.json();
    await saveDirectives(newDirectives);
    return NextResponse.json(newDirectives, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error saving directives' }, { status: 500 });
  }
}
