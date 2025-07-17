'use client'

import LoginClient from './_components/login-client';
import { useEffect, useState } from 'react';
import { User } from '@/types';

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]); // Set to empty array on error
      }
    }
    fetchUsers();
  }, [])
  
  return <LoginClient users={users} />;
}
