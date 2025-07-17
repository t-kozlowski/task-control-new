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
import { Meeting, User } from '@/types';
import { useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const meetingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Tytuł jest wymagany.'),
  date: z.date({ required_error: 'Data jest wymagana.' }),
  summary: z.string().min(1, 'Podsumowanie jest wymagane.'),
  attendees: z.array(z.string().email()).min(1, 'Musi być co najmniej jeden uczestnik.'),
  actionItems: z.array(z.any()).optional(), // Simplified for now
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
  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
  });

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
          attendees: [],
          actionItems: [],
        });
      }
    }
  }, [meeting, open, reset]);

  const onSubmit = async (data: MeetingFormData) => {
    const payload = {
        ...data,
        date: format(data.date, 'yyyy-MM-dd'),
        actionItems: meeting?.actionItems || [] // Preserve existing action items
    };

    const url = meeting ? `/api/meetings/${meeting.id}` : '/api/meetings';
    const method = meeting ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
          <SheetHeader>
            <SheetTitle>{meeting ? 'Edytuj Spotkanie' : 'Dodaj Nowe Spotkanie'}</SheetTitle>
            <SheetDescription>
              {meeting ? 'Zaktualizuj szczegóły istniejącego spotkania.' : 'Wypełnij szczegóły nowego spotkania.'}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto py-6 px-1 space-y-4">
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
                      <Button
                        variant={"outline"}
                        className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Wybierz datę</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
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
                    <div className="p-3 border rounded-md space-y-2">
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

            <div>
              <Label htmlFor="summary">Podsumowanie</Label>
              <Textarea id="summary" {...register('summary')} rows={5} />
              {errors.summary && <p className="text-destructive text-sm mt-1">{errors.summary.message}</p>}
            </div>
          </div>
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
