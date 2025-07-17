import { NextResponse } from 'next/server';
import { getUsers } from '@/lib/data-service';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading users data' }, { status: 500 });
  }
}
