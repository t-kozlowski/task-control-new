
import { getTasks, getUsers } from '@/lib/data-service';
import ProjectStats from '../_components/project-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ListChecks, CheckCircle, Package } from 'lucide-react';
import ProtectedRoute from './_components/protected-route';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';


const KpiCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="flex items-start gap-4 rounded-lg bg-secondary/50 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
           <Icon className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);


export const dynamic = 'force-dynamic';

export default async function ProjectManagerPage() {
  const tasks = await getTasks();
  const users = await getUsers();

  const mainTasks = tasks.filter(t => !t.parentId);
  const completedMainTasks = mainTasks.filter(t => t.status === 'Done').length;
  const totalMainTasks = mainTasks.length;
  const remainingMainTasks = totalMainTasks - completedMainTasks;
  const overallProgress = totalMainTasks > 0 ? Math.round((completedMainTasks / totalMainTasks) * 100) : 0;
  const teamSize = users.length;

  return (
    <ProtectedRoute>
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Panel Project Managera</h1>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Kluczowe Wskaźniki Projektu</CardTitle>
                    <CardDescription>Szybki przegląd najważniejszych metryk.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between items-baseline">
                             <Label className="text-muted-foreground">Całkowity Postęp Projektu</Label>
                             <span className="font-bold text-xl">{overallProgress}%</span>
                        </div>
                        <Progress value={overallProgress} className="h-3" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <KpiCard title="Zadania Główne" value={totalMainTasks} icon={Package} />
                        <KpiCard title="Ukończone" value={completedMainTasks} icon={CheckCircle} />
                        <KpiCard title="Pozostałe" value={remainingMainTasks} icon={ListChecks} />
                        <KpiCard title="Wielkość Zespołu" value={teamSize} icon={Users} />
                    </div>
                </CardContent>
             </Card>

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
