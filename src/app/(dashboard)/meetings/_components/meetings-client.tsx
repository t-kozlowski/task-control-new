'use client';
import { useState, useEffect } from 'react';
import type { Meeting } from '@/types';
import type { MeetingPrepOutput } from '@/ai/flows/meeting-prep';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MeetingFormSheet } from './meeting-form-sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/context/app-context';

function AiPrepSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-8 w-1/2 mt-4" />
                <Skeleton className="h-16 w-full" />
            </div>
        </div>
    )
}


export default function MeetingsClient({ initialMeetings }: { initialMeetings: Meeting[] }) {
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(initialMeetings[0]?.id || null);
    const [prepData, setPrepData] = useState<MeetingPrepOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const { toast } = useToast();
    const { users } = useApp();

    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

    const refreshMeetings = async () => {
        const res = await fetch('/api/meetings');
        const data = await res.json();
        setMeetings(data);
    };

    useEffect(() => {
        setMeetings(initialMeetings);
        if (!selectedMeetingId && initialMeetings.length > 0) {
            setSelectedMeetingId(initialMeetings[0].id);
        }
    }, [initialMeetings, selectedMeetingId]);

    useEffect(() => {
        if (selectedMeetingId) {
            const fetchPrepData = async () => {
                setIsLoading(true);
                setError(null);
                setPrepData(null);
                try {
                    const response = await fetch('/api/ai/meeting-prep', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ meetingId: selectedMeetingId })
                    });
                    if (!response.ok) {
                        throw new Error('Nie udało się pobrać sugestii AI.');
                    }
                    const data = await response.json();
                    setPrepData(data);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPrepData();
        }
    }, [selectedMeetingId]);
    
    const handleAddMeeting = () => {
        setEditingMeeting(null);
        setIsSheetOpen(true);
    };

    const handleEditMeeting = (meeting: Meeting) => {
        setEditingMeeting(meeting);
        setIsSheetOpen(true);
    };

    const handleDeleteMeeting = async (meetingId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;
        try {
            const res = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Nie udało się usunąć spotkania');

            toast({ title: 'Sukces', description: 'Spotkanie usunięte.' });
            await refreshMeetings();

            if (selectedMeetingId === meetingId) {
                const updatedMeetings = await fetch('/api/meetings').then(res => res.json());
                setSelectedMeetingId(updatedMeetings[0]?.id || null);
            }

        } catch (error) {
            toast({ title: 'Błąd', description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.', variant: 'destructive' });
        }
    };

    const onMeetingSaved = async () => {
        await refreshMeetings();
        setIsSheetOpen(false);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Spotkania z Zarządem</h1>
                <div className="flex gap-2 items-center">
                    <div className="w-full sm:w-72">
                        <Select onValueChange={setSelectedMeetingId} value={selectedMeetingId || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Wybierz spotkanie..." />
                            </SelectTrigger>
                            <SelectContent>
                                {meetings.map(meeting => (
                                    <SelectItem key={meeting.id} value={meeting.id}>
                                        {new Date(meeting.date).toLocaleDateString('pl-PL')} - {meeting.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <Button onClick={handleAddMeeting}><Icons.plus className="mr-2" />Dodaj</Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Icons.bot className="text-primary" />
                                Przygotowanie do spotkania
                            </CardTitle>
                            <CardDescription>
                                Strategiczne sugestie od AI na podstawie aktualnych zadań i poprzednich ustaleń.
                            </CardDescription>
                        </div>
                        {selectedMeeting && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Icons.more />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onSelect={() => handleEditMeeting(selectedMeeting)}>
                                        <Icons.edit className="mr-2" /> Edytuj
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleDeleteMeeting(selectedMeeting.id)} className="text-destructive">
                                        <Icons.delete className="mr-2" /> Usuń
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading && <AiPrepSkeleton />}
                    {error && !isLoading && (
                        <Alert variant="destructive">
                            <AlertTitle>Błąd</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {!selectedMeeting && !isLoading && (
                         <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                            <Icons.meetings className="h-12 w-12" />
                            <h3 className="text-lg font-semibold">Brak spotkań</h3>
                            <p>Dodaj nowe spotkanie, aby rozpocząć pracę.</p>
                        </div>
                    )}
                    {prepData && selectedMeeting && !isLoading && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Left Column */}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Sugerowane punkty do omówienia</h3>
                                    <div className="space-y-4">
                                        {prepData.talkingPoints.map((point, index) => (
                                            <div key={index} className="p-3 rounded-lg border bg-secondary/50">
                                                <p className="font-semibold">{point.topic}</p>
                                                <p className="text-sm text-muted-foreground">{point.reasoning}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                 <div>
                                    <h3 className="text-lg font-semibold mb-3">Sugerowane pytania do Prezesa</h3>
                                    <div className="space-y-3">
                                        {prepData.questionsToAsk.map((question, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <span className="text-primary font-bold mt-1">?</span>
                                                <p className="flex-1">{question}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-6">
                               <div>
                                    <h3 className="text-lg font-semibold mb-3">Status spraw z poprzedniego spotkania</h3>
                                     {prepData.actionItemUpdates.length > 0 ? (
                                        <div className="space-y-4">
                                            {prepData.actionItemUpdates.map((item, index) => (
                                                <div key={index} className="p-3 rounded-lg border">
                                                    <div className="flex justify-between items-start">
                                                        <p className="flex-1 pr-4">{item.description}</p>
                                                        <Badge variant={item.status === 'Done' ? 'default' : 'secondary'} className={item.status === 'Done' ? 'bg-green-500 text-black' : 'bg-amber-500 text-black'}>{item.status}</Badge>
                                                    </div>
                                                    <p className="text-sm text-accent mt-2">
                                                        <span className="font-semibold">Rekomendacja:</span> {item.recommendation}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground text-sm">Brak punktów akcji z poprzedniego spotkania lub pierwsze spotkanie w serii.</p>
                                    )}
                               </div>
                                {selectedMeeting && (
                                     <div>
                                        <Separator className="my-6" />
                                        <h3 className="text-lg font-semibold mb-3">Szczegóły wybranego spotkania</h3>
                                        <div className="text-sm space-y-2">
                                            <p><strong className="font-semibold">Data:</strong> {new Date(selectedMeeting.date).toLocaleDateString('pl-PL')}</p>
                                            <p><strong className="font-semibold">Tytuł:</strong> {selectedMeeting.title}</p>
                                            <div className="flex items-start gap-2">
                                                <strong className="font-semibold pt-0.5">Uczestnicy:</strong>
                                                <div className="flex flex-wrap gap-1">
                                                    {selectedMeeting.attendees.map(email => <Badge key={email} variant="outline">{users.find(u=>u.email === email)?.name || email}</Badge>)}
                                                </div>
                                            </div>
                                            <p><strong className="font-semibold">Podsumowanie:</strong> {selectedMeeting.summary}</p>
                                        </div>
                                     </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

             <MeetingFormSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                meeting={editingMeeting}
                onMeetingSaved={onMeetingSaved}
                users={users}
            />
        </div>
    );
}
