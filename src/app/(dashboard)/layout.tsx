import { AppHeader } from '@/components/layout/app-header';
import { ZenModeToggle } from '@/components/layout/zen-mode-toggle';
import { getTasks, getUsers } from '@/lib/data-service';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();
  const tasks = await getTasks();
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 animate-fade-in">
        {children}
      </main>
      <ZenModeToggle />
    </div>
  );
}
