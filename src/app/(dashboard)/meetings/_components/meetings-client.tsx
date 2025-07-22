// src/app/(dashboard)/meetings/_components/meetings-client.tsx
'use client';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Meeting, ActionItem, User, Task } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Mic, MicOff, Copy } from 'lucide-react';

function TranscriptionView({ meeting }: { meeting: Meeting }) {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState<{ raw: string, processed: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };
            mediaRecorderRef.current.onstop = handleStopRecording;
            mediaRecorderRef.current.start();
            setIsRecording(true);
            setTranscript(null);
        } catch (err) {
            toast({ title: "Błąd", description: "Nie można uzyskać dostępu do mikrofonu.", variant: "destructive" });
        }
    };

    const handleStopRecording = async () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            // Get stream tracks and stop them to turn off the mic indicator
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
        setIsRecording(false);
        setIsLoading(true);

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        audioChunksRef.current = [];

        try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;

                const response = await fetch('/api/ai/transcribe-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audioDataUri: base64Audio, attendees: meeting.attendees.length }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Błąd transkrypcji');
                }

                const result = await response.json();
                setTranscript({ raw: result.rawTranscript, processed: result.processedTranscript });
                toast({ title: "Sukces", description: "Transkrypcja została wygenerowana." });
            };
        } catch (error) {
            toast({ title: "Błąd", description: error instanceof Error ? error.message : 'Nieznany błąd', variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Skopiowano!' });
    }

    // This will toggle recording state
    const toggleRecording = () => {
        if (isRecording) {
            handleStopRecording();
        } else {
            handleStartRecording();
        }
    };

    return (
        <div className="p-4 space-y-4">
             <div className="p-4 border rounded-lg bg-secondary/30 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">Nagrywanie spotkania</h4>
                    <p className="text-sm text-muted-foreground">Nagraj spotkanie, a AI stworzy z niego notatki.</p>
                </div>
                <Button onClick={toggleRecording} disabled={isLoading} size="lg">
                    {isLoading ? <Icons.spinner className="animate-spin mr-2" /> : (isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />)}
                    {isLoading ? "Przetwarzanie..." : (isRecording ? "Zatrzymaj" : "Rozpocznij Nagrywanie")}
                </Button>
            </div>

            {transcript && (
                <div className="space-y-4">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Surowa Transkrypcja</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => handleCopy(transcript.raw)}><Copy className="size-4"/></Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap font-mono bg-background p-4 rounded-md h-48 overflow-y-auto">{transcript.raw}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                           <CardTitle>Zredagowane Notatki AI</CardTitle>
                           <Button variant="ghost" size="icon" onClick={() => handleCopy(transcript.processed)}><Copy className="size-4"/></Button>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap font-mono bg-background p-4 rounded-md">{transcript.processed}</p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}


function AiPrepView({ meeting, users, tasks }: { meeting: Meeting; users: User[]; tasks: Task[] }) {
    const [prepData, setPrepData] = useState<{message: string} | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getPrepData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/proxy/ai_help', {
                method: 'GET',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Wystąpił błąd podczas generowania podpowiedzi.');
            }
            const data = await response.json();
            setPrepData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd.');
        } finally {
            setIsLoading(false);
        }
    }, [meeting]);

    useEffect(() => {
        getPrepData();
    }, [getPrepData]);

    const ParsedContent = ({ content }: { content: string }) => {
        const lines = content.split('\\n');
        return (
            <div className="space-y-2">
                {lines.map((line, index) => {
                    if (line.startsWith('####')) {
                        return <h5 key={index} className="text-md font-semibold mt-4 mb-2">{line.replace('####', '').trim()}</h5>;
                    }
                    
                    const parts = line.split(/(\*\*.*?\*\*)/g);

                    return (
                        <p key={index} className="text-sm text-muted-foreground">
                            {parts.map((part, i) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
                                }
                                return part;
                            })}
                        </p>
                    );
                })}
            </div>
        );
    };

    if (isLoading) {
        return <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground"><Icons.spinner className="animate-spin" /> Ładowanie sugestii AI...</div>;
    }

    if (error) {
        return <div className="p-6 text-destructive">{error}</div>;
    }
    
    if (!prepData || !prepData.message) {
        return <div className="p-6 text-muted-foreground">Brak danych do wyświetlenia.</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <div className="p-4 rounded-lg border bg-secondary/50">
                 <h4 className="font-semibold mb-2 text-primary">Podpowiedzi AI</h4>
                 <ParsedContent content={prepData.message} />
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

export default function MeetingsClient({ initialMeetings, initialTasks }: { initialMeetings: Meeting[], initialTasks: Task[] }) {
    const [meetings, setMeetings] = useState<Meeting[]>(initialMeetings);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

    const { toast } = useToast();
    const { users } = useApp();
    
    const sortedMeetings = useMemo(() => meetings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [meetings]);
    
    const refreshMeetings = async () => {
        const res = await fetch('/api/meetings');
        const data = await res.json();
        const sorted = data.sort((a: Meeting, b: Meeting) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setMeetings(sorted);
        return sorted;
    };

    useEffect(() => {
        if (!selectedMeeting && sortedMeetings.length > 0) {
            const upcomingOrMostRecent = sortedMeetings.find(m => isFuture(new Date(m.date))) || sortedMeetings[0];
            setSelectedMeeting(upcomingOrMostRecent);
        } else if (selectedMeeting && !sortedMeetings.find(m => m.id === selectedMeeting.id)) {
            // if selected meeting was deleted, select the first one
            setSelectedMeeting(sortedMeetings[0] || null);
        }
    }, [sortedMeetings, selectedMeeting]);

    
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
        try {
            const res = await fetch(`/api/meetings/${selectedMeeting.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Nie udało się usunąć spotkania');
            toast({ title: 'Sukces', description: 'Spotkanie usunięte.' });
            await refreshMeetings();
        } catch (error) {
            toast({ title: 'Błąd', description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.', variant: 'destructive' });
        }
    };

    const onMeetingSaved = async () => {
        const updatedMeetings = await refreshMeetings();
        const newOrEditedId = editingMeeting?.id || `MEETING-${Date.now()}`;
        const reselectedMeeting = updatedMeetings.find(m => m.id === editingMeeting?.id);
        
        if (reselectedMeeting) {
            setSelectedMeeting(reselectedMeeting);
        } else if (updatedMeetings.length > 0) {
            // Find the newly added meeting
            const newMeeting = updatedMeetings.find(m => m.id !== meetings.find(old => old.id === m.id));
            setSelectedMeeting(newMeeting || updatedMeetings[0]);
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
                            <p className="text-sm text-muted-foreground">Wybierz spotkanie.</p>
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
                                    <TabsTrigger value="transcription">Transkrypcja</TabsTrigger>
                                </TabsList>
                                <div className="flex gap-2">
                                     <Button variant="outline" size="sm" onClick={handleEditMeeting}>Edytuj</Button>
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive hover:border-destructive/50">Usuń</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Czy na pewno chcesz usunąć to spotkanie?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Ta akcja jest nieodwracalna. Spowoduje to trwałe usunięcie spotkania z bazy danych.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Anuluj</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteMeeting} className="bg-destructive hover:bg-destructive/90">Kontynuuj</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
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
                                     <AiPrepView meeting={selectedMeeting} users={users} tasks={initialTasks} />
                                </TabsContent>
                                 <TabsContent value="notes" className="p-4 m-0">
                                      <h4 className="font-semibold mb-2">Surowe notatki</h4>
                                      <p className="text-sm whitespace-pre-wrap font-mono bg-secondary/30 p-4 rounded-md">
                                        {selectedMeeting.rawNotes || "Brak surowych notatek dla tego spotkania."}
                                      </p>
                                </TabsContent>
                                 <TabsContent value="transcription" className="m-0">
                                    <TranscriptionView meeting={selectedMeeting} />
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
