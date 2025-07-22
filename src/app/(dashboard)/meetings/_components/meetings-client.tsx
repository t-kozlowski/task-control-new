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
import { Mic, MicOff, Copy, Highlighter, MessagesSquare, Sparkles, AlertTriangle, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { TranscribeOutput } from '@/ai/flows/transcribe-audio';


function TranscriptionView({ meeting, onSummaryGenerated }: { meeting: Meeting; onSummaryGenerated: (summary: string) => void; }) {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [transcriptData, setTranscriptData] = useState<TranscribeOutput | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const startTimer = () => {
        timerIntervalRef.current = setInterval(() => {
            setRecordingTime(prevTime => prevTime + 1);
        }, 1000);
    };

    const stopTimer = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        setRecordingTime(0);
    };

    const handleStartRecording = async () => {
        if (isRecording) return;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                handleTranscription(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setTranscriptData(null);
            setError(null);
            startTimer();
        } catch (err) {
            console.error(err);
            toast({ title: "Błąd", description: "Nie można uzyskać dostępu do mikrofonu.", variant: "destructive" });
        }
    };
    
    const handleStopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      stopTimer();
    }
    
    const handleTranscription = async (audioBlob: Blob) => {
        if (audioChunksRef.current.length === 0) return;
        setIsProcessing(true);
        setError(null);
        
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const attendeeNames = meeting.attendees.map(email => users.find(u => u.email === email)?.name || 'Unknown');
            
            try {
                const response = await fetch('/api/ai/transcribe-audio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ audioDataUri: base64Audio, attendees: attendeeNames }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Błąd transkrypcji na serwerze.');
                }

                const result: TranscribeOutput = await response.json();
                setTranscriptData(result);
                toast({ title: "Sukces", description: "Transkrypcja została pomyślnie przetworzona." });
            } catch (error) {
                setError(error instanceof Error ? error.message : 'Nieznany błąd');
                toast({ title: "Błąd transkrypcji", description: error instanceof Error ? error.message : 'Nieznany błąd', variant: "destructive" });
            } finally {
                setIsProcessing(false);
            }
        };
    };

    const handleGenerateSummary = async () => {
        if (!transcriptData) return;
        setIsProcessing(true);
        try {
            const response = await fetch('/api/ai/redact-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: transcriptData.rawTranscript }), // Send the raw transcript for redaction
            });
             if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || 'Błąd generowania podsumowania.');
            }
            const result = await response.json();
            onSummaryGenerated(result.redactedSummary);
            toast({ title: "Sukces!", description: "Nowe podsumowanie zostało wygenerowane i wstawione." });
        } catch (error) {
            toast({ title: "Błąd", description: error instanceof Error ? error.message : 'Nieznany błąd', variant: "destructive" });
        } finally {
            setIsProcessing(false);
        }
    };

    const { users } = useApp();

    return (
        <div className="p-4 space-y-4">
             <div className="p-4 border rounded-lg bg-secondary/30 flex items-center justify-between">
                <div>
                    <h4 className="font-semibold">Nagrywanie i Transkrypcja AI</h4>
                    <p className="text-sm text-muted-foreground">Nagraj spotkanie, a AI przygotuje transkrypcję z podziałem na osoby.</p>
                </div>
                <div className="flex items-center gap-4">
                    {isRecording && (
                        <div className="flex items-center gap-2 text-sm text-destructive animate-pulse">
                            <div className="size-2 rounded-full bg-destructive" />
                            <span>{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                        </div>
                    )}
                    <Button onClick={isRecording ? handleStopRecording : handleStartRecording} disabled={isProcessing} size="lg">
                        {isProcessing ? <Icons.spinner className="animate-spin mr-2" /> : (isRecording ? <MicOff className="mr-2" /> : <Mic className="mr-2" />)}
                        {isProcessing ? "Przetwarzanie..." : (isRecording ? "Zatrzymaj" : "Rozpocznij Nagrywanie")}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="p-4 border rounded-lg bg-destructive/10 text-destructive flex items-center gap-3">
                    <AlertTriangle className="size-5" />
                    <div>
                        <h5 className="font-semibold">Wystąpił błąd</h5>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {transcriptData && (
                <Card>
                    <CardHeader>
                        <CardTitle className='text-lg'>Wyniki Analizy AI</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Highlights */}
                        <div>
                           <h3 className="font-semibold flex items-center gap-2 mb-2"><Highlighter className="size-5 text-primary" /> Kluczowe Punkty</h3>
                           <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                             {transcriptData.highlights.map((h, i) => <li key={i}>{h}</li>)}
                           </ul>
                        </div>
                        
                         {/* Initial Summary */}
                        <div>
                           <h3 className="font-semibold flex items-center gap-2 mb-2"><FileText className="size-5 text-primary" /> Wstępne Podsumowanie</h3>
                           <p className="text-sm text-muted-foreground p-3 bg-secondary/40 rounded-md">{transcriptData.initialSummary}</p>
                        </div>

                        {/* Speakers */}
                        <div>
                           <h3 className="font-semibold flex items-center gap-2 mb-2"><MessagesSquare className="size-5 text-primary" /> Dialog</h3>
                           <div className="space-y-4 max-h-60 overflow-y-auto p-3 bg-secondary/40 rounded-md">
                               {transcriptData.speakers.map((s, i) => (
                                   <div key={i}>
                                     <p className="font-semibold text-sm mb-1">{s.name}</p>
                                     <div className="pl-4 border-l-2 border-primary/50 space-y-1 text-sm text-muted-foreground">
                                         {s.lines.map((l, j) => <p key={j}>"{l}"</p>)}
                                     </div>
                                   </div>
                               ))}
                           </div>
                        </div>
                        
                        <div className="flex justify-end">
                            <Button onClick={handleGenerateSummary} disabled={isProcessing}>
                                {isProcessing ? <Icons.spinner className="animate-spin mr-2"/> : <Sparkles className="mr-2 size-4" />}
                                Wygeneruj finalne podsumowanie
                            </Button>
                        </div>
                    </CardContent>
                </Card>
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
    
    const handleSummaryGenerated = (summary: string) => {
      if (selectedMeeting) {
        const updatedMeeting = { ...selectedMeeting, summary };
        setSelectedMeeting(updatedMeeting);
        
        // Also update it in the main list
        setMeetings(prevMeetings => prevMeetings.map(m => m.id === selectedMeeting.id ? updatedMeeting : m));

        // You might want to persist this change to the backend automatically
        fetch(`/api/meetings/${selectedMeeting.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedMeeting)
        });
      }
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
                                    <TranscriptionView meeting={selectedMeeting} onSummaryGenerated={handleSummaryGenerated} />
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
