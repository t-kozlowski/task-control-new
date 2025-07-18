
'use client'

import { getTasks, getUsers } from '@/lib/data-service';
import ProjectStats from '../_components/project-stats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Users, ListChecks, CheckCircle, Package, Calendar as CalendarIcon, Save, Target } from 'lucide-react';
import ProtectedRoute from './_components/protected-route';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Task, User } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { useApp } from '@/context/app-context';


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


export default function ProjectManagerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visionText, setVisionText] = useState('');
  const [isSavingVision, setIsSavingVision] = useState(false);
  const [projectDeadline, setProjectDeadline] = useState<Date | undefined>();
  const { toast } = useToast();
  const { loggedInUser } = useApp();

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        const [tasksData, usersData, visionData] = await Promise.all([
          fetch('/api/tasks').then(res => res.json()),
          fetch('/api/users').then(res => res.json()),
          fetch('/api/vision').then(res => res.json()),
        ]);
        
        setTasks(tasksData);
        setUsers(usersData);
        setVisionText(visionData.text || '');

        const storedDeadline = localStorage.getItem('projectDeadline');
        if (storedDeadline) {
          setProjectDeadline(parseISO(storedDeadline));
        }
        setIsLoading(false);
    }
    fetchData();
  }, []);
  
  const handleSaveVision = async () => {
    setIsSavingVision(true);
    try {
        const response = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: visionText })
        });
        if (!response.ok) throw new Error('Nie udało się zapisać wizji.');
        toast({
            title: 'Zapisano!',
            description: 'Główna wizja projektu została zaktualizowana.'
        })
    } catch(error) {
        toast({
            title: 'Błąd',
            description: error instanceof Error ? error.message : 'Wystąpił błąd.',
            variant: 'destructive',
        })
    } finally {
        setIsSavingVision(false);
    }
  };

   const handleSaveDeadline = () => {
    if (projectDeadline) {
        localStorage.setItem('projectDeadline', projectDeadline.toISOString());
        toast({
            title: 'Zapisano!',
            description: 'Nowy termin końcowy projektu został zapisany i zostanie zsynchronizowany na wykresie.'
        })
        // Force a re-render of components that use this localStorage item
        window.dispatchEvent(new Event('storage'));
    }
  };

  if (isLoading) {
    return <ProtectedRoute><div>Ładowanie...</div></ProtectedRoute>;
  }

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
             
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Ustawienia Wykresu Prędkości</CardTitle>
                        <CardDescription>Ustal parametry dla wykresu "Prędkość vs. Cel", który jest widoczny na głównym pulpicie.</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="deadline">Globalny Termin Końcowy Projektu</Label>
                            <div className="flex gap-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    id="deadline"
                                    variant={"outline"}
                                    className={cn("w-[240px] justify-start text-left font-normal", !projectDeadline && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {projectDeadline ? format(projectDeadline, "PPP") : <span>Wybierz datę</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={projectDeadline}
                                    onSelect={setProjectDeadline}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <Button onClick={handleSaveDeadline}><Save className="h-4 w-4 mr-2" /> Synchronizuj</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/> Główna Wizja Projektu</CardTitle>
                  <CardDescription>Ustal główny cel, który będzie widoczny dla całego zespołu na tablicy ogłoszeń.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Textarea 
                      value={visionText}
                      onChange={(e) => setVisionText(e.target.value)}
                      placeholder="Np. 'Stworzyć najbardziej intuicyjną platformę analityczną na rynku...'"
                      rows={4}
                    />
                    <Button onClick={handleSaveVision} disabled={isSavingVision} className="self-end">
                      {isSavingVision ? "Zapisywanie..." : "Zapisz wizję"}
                    </Button>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
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
        </div>
    </ProtectedRoute>
  );
}
