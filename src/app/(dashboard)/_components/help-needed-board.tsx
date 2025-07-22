
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Task, User } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hand, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/context/app-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PriorityIcons } from '@/components/icons';

const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('') || '?';

export default function HelpNeededBoard({ initialTasks }: { initialTasks: Task[] }) {
    const [tasks, setTasks] = useState(initialTasks);
    const { users, loggedInUser } = useApp();
    const { toast } = useToast();

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const helpNeededTasks = useMemo(() => {
        return tasks.filter(task => task.needsHelp && task.status !== 'Done');
    }, [tasks]);

    const handleOfferHelp = async (task: Task) => {
        if (!loggedInUser) return;
        if (task.assignees.includes(loggedInUser.email)) {
            toast({
                title: 'Jesteś już przypisany!',
                description: 'Już pracujesz nad tym zadaniem.',
                variant: 'default',
            });
            return;
        }

        const newAssignees = [...task.assignees, loggedInUser.email];
        try {
            const response = await fetch(`/api/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignees: newAssignees, needsHelp: false }), // Also turn off the help flag
            });
            if (!response.ok) throw new Error('Nie udało się dołączyć do zadania.');
            const updatedTask = await response.json();
            setTasks(currentTasks =>
                currentTasks.map(t => (t.id === updatedTask.id ? updatedTask : t))
            );
            toast({
                title: 'Dziękujemy za pomoc!',
                description: `Zostałeś przypisany do zadania: ${task.name}.`,
            });
        } catch (error) {
            toast({
                title: 'Błąd',
                description: 'Nie można było dołączyć do zadania.',
                variant: 'destructive',
            });
        }
    };

    if (helpNeededTasks.length === 0) {
        return (
            <Card className="bg-gradient-to-br from-green-500/10 to-background">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                         <Lightbulb className="text-green-400" />
                        <span>Wszystko pod kontrolą!</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Obecnie nikt w zespole nie potrzebuje pomocy. Dobra robota!</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="bg-gradient-to-br from-yellow-500/20 via-yellow-500/10 to-background border-yellow-500/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <Hand className="animate-pulse text-yellow-400" />
                    <span>Ktoś potrzebuje pomocy!</span>
                </CardTitle>
                <CardDescription>
                    Poniższe zadania zostały oflagowane przez członków zespołu jako wymagające wsparcia. Możesz pomóc?
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {helpNeededTasks.map(task => {
                    const assignedUsers = task.assignees.map(email => users.find(u => u.email === email)).filter(Boolean) as User[];
                    return (
                        <div key={task.id} className="p-3 bg-background/50 rounded-lg border flex items-center justify-between gap-4">
                             <div className="flex items-center gap-3 flex-1">
                                {React.createElement(PriorityIcons[task.priority], { className: "size-5 text-primary" })}
                                <div>
                                    <p className="font-semibold">{task.name}</p>
                                    <p className="text-xs text-muted-foreground">{task.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="flex -space-x-2">
                                <TooltipProvider>
                                    {assignedUsers.map((user) => (
                                        <Tooltip key={user.id}>
                                            <TooltipTrigger>
                                                <Avatar className="h-7 w-7 border-2 border-background">
                                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                </Avatar>
                                            </TooltipTrigger>
                                            <TooltipContent>{user.name}</TooltipContent>
                                        </Tooltip>
                                    ))}
                                </TooltipProvider>
                                </div>
                                <Button size="sm" onClick={() => handleOfferHelp(task)}>Pomogę!</Button>
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
}
