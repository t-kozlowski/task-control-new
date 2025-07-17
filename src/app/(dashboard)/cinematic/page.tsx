'use client'
import { useEffect, useState } from 'react';
import { Task, AiDirective, User } from '@/types';
import ProjectStats from '../_components/project-stats';
import TaskSpotlight from '../_components/task-spotlight';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { AiNotificationOutput } from '@/ai/flows/ai-notifications';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import LiveStats from './_components/live-stats';

export default function CinematicPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [notification, setNotification] = useState<AiNotificationOutput | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [tasksData, usersData, notificationRes, summaryRes] = await Promise.all([
          fetch('/api/tasks').then(res => res.json()),
          fetch('/api/users').then(res => res.json()),
          fetch('/api/ai/notification'),
          fetch('/api/ai/summary').then(res => res.json())
        ]);

        setTasks(tasksData);
        setUsers(usersData);
        setSummary(summaryRes.summary);

        if(notificationRes.ok) {
            const newNotification: AiNotificationOutput = await notificationRes.json();
            setNotification(newNotification);
        }

      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      }
      setIsLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 20000); // Odświeżaj co 20 sekund

    return () => clearInterval(interval);
  }, []);

  const getBadgeVariant = (type: AiNotificationOutput['type'] | undefined) => {
    if(!type) return 'outline';
    switch(type) {
      case 'risk': return 'destructive';
      case 'positive': return 'default';
      case 'suggestion': return 'secondary';
      default: return 'outline';
    }
  }
  
  const getBadgeColor = (type: AiNotificationOutput['type'] | undefined) => {
    if (type === 'positive') return 'bg-accent text-accent-foreground';
    return '';
  }

  const getBadgeText = (type: AiNotificationOutput['type'] | undefined) => {
    if(!type) return '';
    switch(type) {
      case 'risk': return 'Ryzyko';
      case 'positive': return 'Pozytywne';
      case 'suggestion': return 'Sugestia';
      default: return type;
    }
  }


  if (isLoading && tasks.length === 0) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse">
            <div className="lg:col-span-2 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full lg:col-span-2" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">Widok Kinowy</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                           <Icons.bot /> Podsumowanie AI "Big Picture"
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="prose prose-invert text-foreground max-w-none">
                        {summary ? summary.split('\n').map((p, i) => <p key={i}>{p}</p>) : <p>Generowanie podsumowania...</p>}
                    </CardContent>
                </Card>
            </div>

            <ProjectStats tasks={tasks} />
            
            <LiveStats tasks={tasks} users={users} />

            <div className="lg:col-span-2">
                <Card>
                     <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Icons.bell /> Ostatnie Powiadomienie AI
                        </CardTitle>
                        <CardDescription>Najnowszy alert lub sugestia od asystenta AI.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {notification ? (
                             <div className="flex gap-3 items-start">
                                <Icons.bot className="flex-shrink-0 mt-1 text-primary" />
                                <div>
                                    <Badge variant={getBadgeVariant(notification.type)} className={getBadgeColor(notification.type)}>{getBadgeText(notification.type)}</Badge>
                                    <p className="text-md text-muted-foreground mt-2">{notification.notification}</p>
                                </div>
                            </div>
                        ): (
                            <p className="text-center text-muted-foreground p-8">Brak powiadomień.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
             <div className="lg:col-span-2">
                <TaskSpotlight tasks={tasks} />
            </div>
        </div>
    </div>
  );
}
