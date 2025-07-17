import LoginClient from './_components/login-client';
import { useApp } from '@/context/app-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ProjectIcon } from '@/components/icons';

export default function LoginPage() {
  const { users, isLoading } = useApp();

  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
             <Card className="w-full max-w-sm mx-auto">
                <CardHeader className="text-center">
                    <div className="flex items-center gap-2 justify-center mb-4">
                        <ProjectIcon className="size-8 text-primary" />
                        <h1 className="text-2xl font-semibold text-foreground">Project Sentinel</h1>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        </div>
      )
  }
  
  return <LoginClient users={users} />;
}
