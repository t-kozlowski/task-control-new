import { getUsers } from '@/lib/data-service';
import UsersClient from './_components/users-client';
import ProtectedRoute from '../project-manager/_components/protected-route';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const users = await getUsers();
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6">
        <UsersClient initialUsers={users} />
      </div>
    </ProtectedRoute>
  );
}
