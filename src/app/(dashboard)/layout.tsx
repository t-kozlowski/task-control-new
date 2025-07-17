import { AppHeader } from '@/components/layout/app-header';
import { getUsers } from '@/lib/data-service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader users={users} />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
