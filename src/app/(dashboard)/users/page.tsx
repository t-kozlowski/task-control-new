import { getUsers } from '@/lib/data-service';
import UsersClient from './_components/users-client';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <div className="flex flex-col gap-6">
      <UsersClient initialUsers={users} />
    </div>
  );
}
