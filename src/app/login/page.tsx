import { getUsers } from '@/lib/data-service';
import LoginClient from './_components/login-client';

export default async function LoginPage() {
  const users = await getUsers();
  
  return <LoginClient users={users} />;
}
