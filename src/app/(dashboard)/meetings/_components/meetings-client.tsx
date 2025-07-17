// src/app/(dashboard)/meetings/_components/meetings-client.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import type { Meeting, ActionItem, User } from '@/types';
import type { MeetingPrepOutput } from '@/ai/flows/meeting-prep';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MeetingFormSheet } from './meeting-form-sheet';
import { useApp } from '@/context/app-context';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format, isFuture, isPast } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AiPrepView({ prepData, isLoading, error }: { prepData: MeetingPrepOutput | null, isLoading: boolean, error: string | null }) {
    if (isLoading) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    if (error) {
        return <Alert variant="destructive"><AlertTitle>Błąd</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
    }
    if (!prepData) return <p className="text-muted-foreground p-4">Brak danych do przygotowania.</p>;

    const sentimentColors = {
        positive: 'border-green-500/50 bg-green-500/10 text-green-300',
        neutral: 'border-blue-500/50 bg-blue-500/10 text-blue-300',
        negative: 'border-red-500/50 bg-red-500/10 text-red-300',
    };
    const sentimentText = {
        positive: 'Pozytywny',
        neutral: 'Neutralny',
        negative: 'Negatywny',
    }

    return (
        <div className="p-4 space-y-6">
             <div className={cn('p-3 rounded-lg border', sentimentColors[prepData.overallSentiment])}>
                <p className="text-sm font-semibold">Ogólny sentyment projektu: <span className="font-bold">{sentimentText[prepData.overallSentiment]}</span></p>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Sugerowane punkty do omówienia</h4>
                <div className="space-y-2">
                    {prepData.talkingPoints.map((point, index) => (
                        <div key={index} className="p-3 rounded-lg border bg-secondary/50 text-sm">
                            <p className="font-semibold">{point.topic}</p>
                            <p className="text-xs text-muted-foreground">{point.reasoning}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Sugerowane pytania do Prezesa</h4>
                <div className="space-y-2">
                    {prepData.questionsToAsk.map((question, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-secondary/50 text-sm">
                            <span className="text-primary font-bold mt-0.5">?</span>
                            <p className="flex-1">{question}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


function ActionItemsView({ items, users }: { items: ActionItem[], users: User[] }) {
    const getAssigneeName = (email: string) => users.find(u => u.email === email)?.name || email;
    if (items.length === 0) {
        return <p className="text-muted-foreground p-4">Brak punktów akcji dla tego spotkania.</p>;
    }
    return (
        <div className="p-4 space-y-3">
            {items.map(item => (
                <div key={item.id} className="p-3 rounded-lg border">
                    <div className="flex justify-between items-start gap-2">
                        <p className="text-sm flex-grow">{item.description}</p>
                        <Badge variant={item.status === 'Done' ? 'default' : 'secondary'} className={cn(
                          item.status === 'Done' && 'bg-green-500/80',
                          item.status === 'In Progress' && 'bg-yellow-500/80',
                          'text-black'
                        )}>{item.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Właściciel: <span className="font-semibold">{getAssigneeName(item.owner)}</span></p>
                </div>
            ))}
        </div>
    );
}

export default function MeetingsClient({ initialMeetings }: { initialMeetings: Meeting[] }) {
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [prepData, setPrepData] = useState<MeetingPrepOutput | null>(null);
    const [isLoadingPrep, setIsLoadingPrep] = useState(false);
    const [prepError, setPrepError] = useState<string | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

    const { toast } = useToast();
    const { users } = useApp();
    
    const sortedMeetings = useMemo(() => meetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [meetings]);
    
    const refreshMeetings = async () => {
        const res = await fetch('/api/meetings');
        const data = await res.json();
        const sorted = data.sort((a: Meeting, b: Meeting) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMeetings(sorted);
        return sorted;
    };

    useEffect(() => {
        const sorted = initialMeetings.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setMeetings(sorted);
        if (!selectedMeeting && sorted.length > 0) {
            const upcomingOrMostRecent = sorted.find(m => isFuture(new Date(m.date))) || sorted[sorted.length - 1];
            setSelectedMeeting(upcomingOrMostRecent);
        }
    }, [initialMeetings]);

    useEffect(() => {
        if (selectedMeeting) {
            const fetchPrepData = async () => {
                setIsLoadingPrep(true);
                setPrepError(null);
                setPrepData(null);
                try {
                    const response = await fetch('/api/ai/meeting-prep', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ meetingId: selectedMeeting.id })
                    });
                    if (!response.ok) throw new Error('Nie udało się pobrać sugestii AI.');
                    const data = await response.json();
                    setPrepData(data);
                } catch (err) {
                    setPrepError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.');
                } finally {
                    setIsLoadingPrep(false);
                }
            };
            fetchPrepData();
        }
    }, [selectedMeeting]);
    
    const handleAddMeeting = () => {
        setEditingMeeting(null);
        setIsSheetOpen(true);
    };

    const handleEditMeeting = () => {
        if (!selectedMeeting) return;
        setEditingMeeting(selectedMeeting);
        setIsSheetOpen(true);
    };

    const handleDeleteMeeting = async () => {
        if (!selectedMeeting) return;
        if (!confirm('Czy na pewno chcesz usunąć to spotkanie?')) return;
        try {
            const res = await fetch(`/api/meetings/${selectedMeeting.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Nie udało się usunąć spotkania');
            toast({ title: 'Sukces', description: 'Spotkanie usunięte.' });
            const updatedMeetings = await refreshMeetings();
            setSelectedMeeting(updatedMeetings[0] || null);
        } catch (error) {
            toast({ title: 'Błąd', description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.', variant: 'destructive' });
        }
    };

    const onMeetingSaved = async () => {
        const updatedMeetings = await refreshMeetings();
        const newOrEditedMeeting = updatedMeetings.find(m => m.id === (editingMeeting?.id || getValues().id));
        if (newOrEditedMeeting) {
            setSelectedMeeting(newOrEditedMeeting);
        }
        setIsSheetOpen(false);
    };
    
    const getAssigneeName = (email: string) => users.find(u => u.email === email)?.name || email;

    return (
        <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
            <Card className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 overflow-hidden">
                <div className="lg:col-span-1 lg:border-r flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div>
                            <h2 className="font-semibold">Oś Czasu Spotkań</h2>
                            <p className="text-sm text-muted-foreground">Wybierz spotkanie, aby zobaczyć szczegóły.</p>
                        </div>
                         <Button onClick={handleAddMeeting} size="sm"><Icons.plus className="mr-2 h-4 w-4" />Dodaj</Button>
                    </div>
                    <ScrollArea className="flex-1">
                       <div className="relative p-6">
                           <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-border -z-10" />
                            <div className="space-y-8">
                            {sortedMeetings.map(meeting => {
                                const meetingDate = new Date(meeting.date);
                                const isSelected = selectedMeeting?.id === meeting.id;
                                return (
                                <div key={meeting.id} className="flex items-start gap-4">
                                    <div className={cn(
                                        "flex-shrink-0 size-4 rounded-full mt-1.5 border-2",
                                        isSelected ? "bg-primary border-primary-foreground" : "bg-muted border-border",
                                        isPast(meetingDate) && !isSelected && "bg-muted-foreground/50"
                                    )} />
                                    <button onClick={() => setSelectedMeeting(meeting)} className="text-left flex-1">
                                        <p className="text-sm font-semibold">{meeting.title}</p>
                                        <p className="text-xs text-muted-foreground">{format(meetingDate, "d MMMM yyyy", { locale: pl })}</p>
                                    </button>
                                </div>
                                )
                            })}
                           </div>
                       </div>
                    </ScrollArea>
                </div>
                <div className="lg:col-span-2 flex flex-col">
                     {selectedMeeting ? (
                        <Tabs defaultValue="summary" className="h-full flex flex-col">
                            <div className="p-4 border-b flex justify-between items-center">
                                <TabsList>
                                    <TabsTrigger value="summary">Podsumowanie</TabsTrigger>
                                    <TabsTrigger value="actions">Punkty Akcji</TabsTrigger>
                                    <TabsTrigger value="prep">Przygotowanie AI</TabsTrigger>
                                    <TabsTrigger value="notes">Notatki</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm" onClick={handleEditMeeting}>Edytuj</Button>
                                     <Button variant="destructive" size="sm" onClick={handleDeleteMeeting}>Usuń</Button>
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                <TabsContent value="summary" className="p-4 m-0">
                                    <h3 className="text-lg font-bold mb-2">{selectedMeeting.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {format(new Date(selectedMeeting.date), "d MMMM yyyy", { locale: pl })}
                                    </p>
                                    <p className="text-sm whitespace-pre-wrap font-mono bg-secondary/30 p-4 rounded-md">{selectedMeeting.summary}</p>

                                    <h4 className="font-semibold mt-6 mb-2">Uczestnicy</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedMeeting.attendees.map(email => (
                                            <Badge key={email} variant="outline">{getAssigneeName(email)}</Badge>
                                        ))}
                                    </div>
                                </TabsContent>
                                <TabsContent value="actions" className="m-0">
                                     <ActionItemsView items={selectedMeeting.actionItems} users={users} />
                                </TabsContent>
                                <TabsContent value="prep" className="m-0">
                                     <AiPrepView prepData={prepData} isLoading={isLoadingPrep} error={prepError} />
                                </TabsContent>
                                 <TabsContent value="notes" className="p-4 m-0">
                                      <h4 className="font-semibold mb-2">Surowe notatki</h4>
                                      <p className="text-sm whitespace-pre-wrap font-mono bg-secondary/30 p-4 rounded-md">
                                        {selectedMeeting.rawNotes || "Brak surowych notatek dla tego spotkania."}
                                      </p>
                                </TabsContent>
                            </ScrollArea>
                        </Tabs>
                     ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <p>Wybierz spotkanie z osi czasu, aby zobaczyć szczegóły.</p>
                        </div>
                     )}
                </div>
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
