import { AppSidebar } from '@/components/layout/sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <AppSidebar />
        <main className="flex flex-col flex-1 sm:pl-14">
          <AppHeader />
          <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
          </div>
        </main>
      </div>
      <Toaster />
    </AppProvider>
  );
}
