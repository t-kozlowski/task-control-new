import { getTasks } from '@/lib/data-service';
import GanttChart from './_components/schedule-client';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const tasks = await getTasks();
  
  return (
    <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Harmonogram Projektu</h1>
        </div>
        <p className="text-muted-foreground">
            Wizualizacja osi czasu dla zadań głównych. Paski reprezentują czas od utworzenia zadania do jego terminu końcowego.
        </p>
        <div className="w-full overflow-x-auto">
            <div className="min-w-[800px]">
                 <GanttChart tasks={tasks} />
            </div>
        </div>
    </div>
  );
}
