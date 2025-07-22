// WAŻNE: Wszystkie funkcje AI w tej aplikacji są obsługiwane przez zewnętrzny serwer w Pythonie,
// który korzysta z API OpenAI. Poniższa funkcja 'handleSuggestValues' wysyła zapytanie
// do odpowiedniego endpointu w Pythonie przez proxy.

'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, Target, Save, Trash2, PlusCircle, LineChart, Sparkles, CalendarClock } from 'lucide-react';
import ProtectedRoute from './_components/protected-route';
import { Task, User, BurndownDataPoint } from '@/types';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
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
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import AdvancedMetrics from './_components/advanced-metrics';
import { useSettings } from '@/context/settings-context';

export default function ProjectManagerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visionText, setVisionText] = useState('');
  const [isSavingVision, setIsSavingVision] = useState(false);
  const [burndownData, setBurndownData] = useState<BurndownDataPoint[]>([]);
  const [isSavingBurndown, setIsSavingBurndown] = useState(false);
  const [newPoint, setNewPoint] = useState<BurndownDataPoint>({
    date: new Date().toISOString().split('T')[0],
    ideal: 0,
    actual: 0
  });
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [deadline, setDeadline] = useState('');
  const { apiKey } = useSettings();

  useEffect(() => {
    const storedDeadline = localStorage.getItem('projectDeadline');
    if (storedDeadline) {
      setDeadline(storedDeadline);
    }
  }, []);

  const { toast } = useToast();

  const fetchAllData = async () => {
      setIsLoading(true);
      const [tasksData, usersData, visionData, burndownData] = await Promise.all([
        fetch('/api/tasks').then(res => res.json()),
        fetch('/api/users').then(res => res.json()),
        fetch('/api/vision').then(res => res.json()),
        fetch('/api/burndown').then(res => res.json()),
      ]);
      
      setTasks(tasksData);
      setUsers(usersData);
      setVisionText(visionData.text || '');
      setBurndownData(burndownData.sort((a: BurndownDataPoint, b: BurndownDataPoint) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setIsLoading(false);
  }

  useEffect(() => {
    fetchAllData();
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

  const handleBurndownChange = (index: number, field: keyof Omit<BurndownDataPoint, 'date'>, value: string) => {
    const newData = [...burndownData];
    newData[index] = { ...newData[index], [field]: parseInt(value, 10) || 0 };
    setBurndownData(newData);
  };

  const handleDateChange = (index: number, value: string) => {
    const newData = [...burndownData];
    newData[index] = { ...newData[index], date: value };
    setBurndownData(newData);
  };

  const addBurndownPoint = () => {
    const updatedData = [...burndownData, newPoint].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setBurndownData(updatedData);
    setNewPoint({ date: new Date().toISOString().split('T')[0], ideal: 0, actual: 0 }); // Reset for next entry
  };
  
  const removeBurndownPoint = (index: number) => {
    const newData = burndownData.filter((_, i) => i !== index);
    setBurndownData(newData);
  }

  const saveBurndownData = async () => {
    setIsSavingBurndown(true);
    try {
        const response = await fetch('/api/burndown', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(burndownData)
        });
        if (!response.ok) throw new Error('Nie udało się zapisać danych wykresu.');
        toast({
            title: 'Zapisano!',
            description: 'Dane dla wykresu spalania zostały zaktualizowane.'
        })
        fetchAllData();
    } catch(error) {
        toast({
            title: 'Błąd',
            description: error instanceof Error ? error.message : 'Wystąpił błąd.',
            variant: 'destructive',
        })
    } finally {
        setIsSavingBurndown(false);
    }
  }

  const handleSuggestValues = async () => {
    setIsSuggesting(true);
    try {
        const response = await fetch('/api/proxy/suggest_burndown_values', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ allTasks: tasks }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Nie udało się pobrać sugestii AI.');
        }
        const data = await response.json();
        setNewPoint(prev => ({
            ...prev,
            actual: data.suggestedActual,
            ideal: data.suggestedIdeal
        }));
        toast({
            title: 'Sugestie AI',
            description: data.reasoning,
        });
    } catch(e) {
        toast({
            title: 'Błąd AI',
            description: e instanceof Error ? e.message : 'Wystąpił nieznany błąd.',
            variant: 'destructive',
        });
    } finally {
        setIsSuggesting(false);
    }
  };

  const handleSaveDeadline = () => {
    if (deadline) {
        localStorage.setItem('projectDeadline', deadline);
        // Dispatch a storage event to notify other components/tabs
        window.dispatchEvent(new Event('storage'));
        toast({
            title: 'Zapisano!',
            description: 'Globalny termin projektu został zaktualizowany.'
        });
    }
  };


  if (isLoading) {
    return <ProtectedRoute><div>Ładowanie...</div></ProtectedRoute>;
  }
  
  return (
    <ProtectedRoute>
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
                <Briefcase className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Panel Project Managera</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
               <AdvancedMetrics tasks={tasks} users={users} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="h-5 w-5"/> Zarządzaj Danymi Wykresu Spalania</CardTitle>
                <CardDescription>Manualnie wprowadzaj punkty danych dla wykresu "Burndown Chart" widocznego na pulpicie.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="max-h-60 overflow-y-auto pr-2">
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Data</TableHead>
                              <TableHead>Idealnie</TableHead>
                              <TableHead>Rzeczywiście</TableHead>
                              <TableHead></TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {burndownData.map((point, index) => (
                              <TableRow key={index}>
                                  <TableCell>
                                      <Input type="date" value={point.date} onChange={(e) => handleDateChange(index, e.target.value)} />
                                  </TableCell>
                                  <TableCell>
                                      <Input type="number" value={point.ideal} onChange={(e) => handleBurndownChange(index, 'ideal', e.target.value)} />
                                  </TableCell>
                                  <TableCell>
                                      <Input type="number" value={point.actual} onChange={(e) => handleBurndownChange(index, 'actual', e.target.value)} />
                                  </TableCell>
                                    <TableCell>
                                      <Button variant="ghost" size="icon" onClick={() => removeBurndownPoint(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline"><PlusCircle className="h-4 w-4 mr-2" />Dodaj punkt</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Dodaj nowy punkt danych</AlertDialogTitle>
                              <AlertDialogDescription>
                                Wprowadź dane dla nowego punktu na wykresie spalania. Możesz też poprosić AI o sugestie.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-date" className="text-right">Data</Label>
                                <Input id="new-date" type="date" value={newPoint.date} onChange={(e) => setNewPoint({...newPoint, date: e.target.value})} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-ideal" className="text-right">Idealnie</Label>
                                <Input id="new-ideal" type="number" value={newPoint.ideal} onChange={(e) => setNewPoint({...newPoint, ideal: parseInt(e.target.value) || 0})} className="col-span-3" />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="new-actual" className="text-right">Rzeczywiście</Label>
                                <Input id="new-actual" type="number" value={newPoint.actual} onChange={(e) => setNewPoint({...newPoint, actual: parseInt(e.target.value) || 0})} className="col-span-3" />
                              </div>
                               <Button variant="outline" onClick={handleSuggestValues} disabled={isSuggesting || !apiKey}>
                                  {isSuggesting ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                  Zasugeruj z AI
                                </Button>
                            </div>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Anuluj</AlertDialogCancel>
                              <AlertDialogAction onClick={addBurndownPoint}>Dodaj</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                      <Button onClick={saveBurndownData} disabled={isSavingBurndown}><Save className="h-4 w-4 mr-2"/> Zapisz i Synchronizuj</Button>
                  </div>
              </CardContent>
            </Card>

             <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5"/> Ustaw Globalny Termin Projektu</CardTitle>
                  <CardDescription>Ta data będzie używana do generowania linii predykcji na wykresie spalania.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Input 
                      type="date" 
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button onClick={handleSaveDeadline}>Zapisz deadline</Button>
                </CardContent>
              </Card>
        </div>
    </ProtectedRoute>
  );
}
