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
    
    const selectedMeeting = meetings.find(m => m.id === selectedMeetingId);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold tracking-tight">Spotkania z Zarządem</h1>
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
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Icons.bot className="text-primary" />
                        Przygotowanie do spotkania
                    </CardTitle>
                    <CardDescription>
                        Strategiczne sugestie od AI na podstawie aktualnych zadań i poprzednich ustaleń.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading && <AiPrepSkeleton />}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTitle>Błąd</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                    {prepData && (
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
                                                        <Badge variant={item.status === 'Done' ? 'default' : 'secondary'} className={item.status === 'Done' ? 'bg-accent text-accent-foreground' : ''}>{item.status}</Badge>
                                                    </div>
                                                    <p className="text-sm text-amber-400 mt-2">
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
                                                    {selectedMeeting.attendees.map(email => <Badge key={email} variant="outline">{email}</Badge>)}
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
        </div>
    );
}
