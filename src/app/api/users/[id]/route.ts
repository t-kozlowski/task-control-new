import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/data-service';
import { User } from '@/types';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const updatedUser: User = await request.json();
    let users = await getUsers();
    const userIndex = users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    users[userIndex] = updatedUser;
    await saveUsers(users);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Error updating user' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    let users = await getUsers();
    const filteredUsers = users.filter(u => u.id !== id);

    if (users.length === filteredUsers.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    await saveUsers(filteredUsers);
    return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Error deleting user' }, { status: 500 });
  }
}
