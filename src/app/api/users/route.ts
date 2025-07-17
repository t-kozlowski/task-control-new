import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/data-service';
import { User } from '@/types';

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: 'Error reading users data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const newUser: User = await request.json();
        const users = await getUsers();
        
        if (users.some(u => u.email === newUser.email)) {
            return NextResponse.json({ message: 'Użytkownik z tym adresem email już istnieje.' }, { status: 409 });
        }
        
        if (users.some(u => u.id === newUser.id)) {
            return NextResponse.json({ message: 'Użytkownik z tym ID już istnieje.' }, { status: 409 });
        }

        users.push(newUser);
        await saveUsers(users);
        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error('Error saving user:', error);
        return NextResponse.json({ message: 'Error saving user' }, { status: 500 });
    }
}
