import { getTasks, getUsers } from '@/lib/data-service';
import ProjectStats from '../_components/project-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import ProtectedRoute from './_components/protected-route';

export const dynamic = 'force-dynamic';

export default async function ProjectManagerPage() {
  const tasks = await getTasks();

  return (
    <ProtectedRoute>
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Panel Project Managera</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Statystyki Projektu</CardTitle>
                    <CardDescription>
                        Szczegółowy wgląd w podział i status zadań.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ProjectStats tasks={tasks} />
                </CardContent>
            </Card>
        </div>
    </ProtectedRoute>
  );
}
