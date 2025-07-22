import { getTasks } from '@/lib/data-service';
import ScheduleClient from './_components/schedule-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card>
            <CardHeader>
                <CardTitle>Kalendarz Zadań</CardTitle>
                <CardDescription>
                    Wizualizacja terminów (dueDate) dla wszystkich zadań głównych w projekcie. Najedź na datę, aby zobaczyć szczegóły.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <ScheduleClient initialTasks={tasks} />
            </CardContent>
        </Card>
    </div>
  );
}
