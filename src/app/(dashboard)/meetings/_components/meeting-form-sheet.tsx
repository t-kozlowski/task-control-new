'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Meeting, User, ActionItem, Status } from '@/types';
import { useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Sparkles } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const actionItemSchema = z.object({
  id: z.string(),
  description: z.string().min(1, 'Opis jest wymagany.'),
  owner: z.string().email('Wybierz właściciela.'),
  status: z.enum(['Todo', 'In Progress', 'Done', 'Backlog']),
});

const meetingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Tytuł jest wymagany.'),
  date: z.date({ required_error: 'Data jest wymagana.' }),
  summary: z.string(), 
  rawNotes: z.string().optional(),
  attendees: z.array(z.string().email()).min(1, 'Musi być co najmniej jeden uczestnik.'),
  actionItems: z.array(actionItemSchema),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting: Meeting | null;
  onMeetingSaved: () => void;
  users: User[];
}

export function MeetingFormSheet({ open, onOpenChange, meeting, onMeetingSaved, users }: MeetingFormSheetProps) {
  const { toast } = useToast();
  const [isRedacting, setIsRedacting] = useState(false);
  const { register, handleSubmit, control, reset, getValues, setValue, watch, formState: { errors, isSubmitting } } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      summary: '',
      rawNotes: '',
      actionItems: [],
    }
  });

  const actionItems = watch('actionItems');

  useEffect(() => {
    if (open) {
      if (meeting) {
        reset({
          ...meeting,
          date: new Date(meeting.date),
        });
      } else {
        reset({
          id: `MEETING-${Date.now()}`,
          title: '',
          date: new Date(),
          summary: '',
          rawNotes: '',
          attendees: [],
          actionItems: [],
        });
      }
    }
  }, [meeting, open, reset]);

  const handleRedact = async () => {
    const rawNotes = getValues('rawNotes');
    if (!rawNotes || rawNotes.trim().length === 0) {
      toast({
        title: 'Brak notatek',
        description: 'Wpisz najpierw swoje notatki, aby AI mogło je zredagować.',
        variant: 'destructive'
      });
      return;
    }
    setIsRedacting(true);
    try {
      const response = await fetch('/api/ai/redact-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rawNotes })
      });
      if (!response.ok) throw new Error('Nie udało się zredagować notatek.');
      const data = await response.json();
      setValue('summary', data.redactedSummary, { shouldValidate: true });
      toast({
        title: 'Sukces!',
        description: 'Podsumowanie zostało wygenerowane przez AI.'
      });
    } catch (error) {
      toast({ title: 'Błąd', description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.', variant: 'destructive' });
    } finally {
      setIsRedacting(false);
    }
  };


  const onSubmit = async (data: MeetingFormData) => {
    const payload = { ...data, date: format(data.date, 'yyyy-MM-dd') };
    const url = meeting ? `/api/meetings/${meeting.id}` : '/api/meetings';
    const method = meeting ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Nie udało się zapisać spotkania.');
        }
        toast({ title: 'Sukces!', description: 'Spotkanie zostało pomyślnie zapisane.' });
        onMeetingSaved();
    } catch (error) {
        toast({ title: 'Błąd', description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.', variant: 'destructive' });
    }
  };

  const addActionItem = () => {
    setValue('actionItems', [
        ...actionItems,
        { id: `AI-${Date.now()}`, description: '', owner: '', status: 'Todo' }
    ]);
  };
  
  const removeActionItem = (index: number) => {
      const newItems = [...actionItems];
      newItems.splice(index, 1);
      setValue('actionItems', newItems);
  };

  const statuses: Status[] = ['Backlog', 'Todo', 'In Progress', 'Done'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl w-[90vw] flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{meeting ? 'Edytuj Spotkanie' : 'Dodaj Nowe Spotkanie'}</SheetTitle>
            <SheetDescription>
              {meeting ? 'Zaktualizuj szczegóły istniejącego spotkania.' : 'Wypełnij szczegóły nowego spotkania.'}
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="py-6 space-y-4">
            <div>
              <Label htmlFor="title">Tytuł Spotkania</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-destructive text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="date">Data</Label>
               <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && <p className="text-destructive text-sm mt-1">{errors.date.message}</p>}
            </div>

            <div>
              <Label htmlFor="attendees">Uczestnicy</Label>
               <Controller
                  name="attendees"
                  control={control}
                  render={({ field }) => (
                    <div className="p-3 border rounded-md space-y-2 max-h-40 overflow-y-auto">
                        {users.map((user) => (
                            <div key={user.id} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`user-${user.id}`}
                                    checked={field.value?.includes(user.email)}
                                    onCheckedChange={(checked) => {
                                        return checked
                                        ? field.onChange([...(field.value || []), user.email])
                                        : field.onChange(field.value?.filter((email) => email !== user.email));
                                    }}
                                />
                                <label htmlFor={`user-${user.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {user.name} ({user.email})
                                </label>
                            </div>
                        ))}
                    </div>
                  )}
                />
              {errors.attendees && <p className="text-destructive text-sm mt-1">{errors.attendees.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rawNotes">Szybkie Notatki</Label>
              <Textarea id="rawNotes" {...register('rawNotes')} rows={5} placeholder="Wpisz luźne notatki, punkty, pomysły... AI je uporządkuje." />
              <Button type="button" variant="outline" size="sm" onClick={handleRedact} disabled={isRedacting}>
                {isRedacting ? <Icons.spinner className="mr-2 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Redaguj z AI
              </Button>
            </div>

            <div>
              <Label htmlFor="summary">Oficjalne Podsumowanie</Label>
              <Textarea id="summary" {...register('summary')} rows={8} readOnly className="bg-secondary/50" placeholder="Zostanie wygenerowane przez AI po kliknięciu 'Redaguj z AI'." />
              {errors.summary && <p className="text-destructive text-sm mt-1">{errors.summary.message}</p>}
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <Label>Punkty Akcji</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addActionItem}>
                        <Icons.plus className="mr-2 h-4 w-4" />Dodaj
                    </Button>
                </div>
                <div className="space-y-3 p-3 border rounded-md">
                    {actionItems.length === 0 && <p className="text-sm text-muted-foreground text-center">Brak punktów akcji.</p>}
                    {actionItems.map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-md space-y-2 relative">
                            <Button type="button" variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => removeActionItem(index)}>
                                <Icons.delete className="h-4 w-4" />
                            </Button>
                            <div>
                                <Label htmlFor={`actionItems.${index}.description`}>Opis</Label>
                                <Input {...register(`actionItems.${index}.description`)} />
                                {errors.actionItems?.[index]?.description && <p className="text-destructive text-sm mt-1">{errors.actionItems[index]?.description?.message}</p>}
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor={`actionItems.${index}.owner`}>Właściciel</Label>
                                     <Controller
                                        name={`actionItems.${index}.owner`}
                                        control={control}
                                        render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                                            <SelectContent>
                                                {users.map(u => <SelectItem key={u.id} value={u.email}>{u.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        )}
                                    />
                                     {errors.actionItems?.[index]?.owner && <p className="text-destructive text-sm mt-1">{errors.actionItems[index]?.owner?.message}</p>}
                                </div>
                                <div>
                                     <Label htmlFor={`actionItems.${index}.status`}>Status</Label>
                                     <Controller
                                        name={`actionItems.${index}.status`}
                                        control={control}
                                        render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        )}
                                    />
                                </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          </ScrollArea>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Anuluj</Button>
            </SheetClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Zapisywanie...' : 'Zapisz Spotkanie'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
