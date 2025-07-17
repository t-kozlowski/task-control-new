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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User } from '@/types';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nazwa użytkownika jest wymagana.'),
  email: z.string().email('Nieprawidłowy format adresu email.'),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserSaved: () => void;
}

export function UserFormSheet({ open, onOpenChange, user, onUserSaved }: UserFormSheetProps) {
    const { toast } = useToast();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
    });

    useEffect(() => {
        if (open) {
            if (user) {
                reset(user);
            } else {
                reset({
                    id: `${Date.now()}`,
                    name: '',
                    email: '',
                });
            }
        }
    }, [user, open, reset]);

    const onSubmit = async (data: UserFormData) => {
        const method = user ? 'PUT' : 'POST';
        const url = user ? `/api/users/${user.id}` : '/api/users';
        
        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Nie udało się zapisać użytkownika.');
            }
            toast({
                title: 'Sukces!',
                description: `Użytkownik ${data.name} został pomyślnie zapisany.`
            });
            onUserSaved();
        } catch (error) {
            toast({
                title: 'Błąd',
                description: error instanceof Error ? error.message : 'Wystąpił nieznany błąd.',
                variant: 'destructive',
            });
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-lg w-[90vw]">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full">
                    <SheetHeader>
                        <SheetTitle>{user ? 'Edytuj Użytkownika' : 'Dodaj Nowego Użytkownika'}</SheetTitle>
                        <SheetDescription>
                            {user ? 'Zaktualizuj dane istniejącego użytkownika.' : 'Wprowadź dane nowego członka zespołu.'}
                        </SheetDescription>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto py-6 px-1 space-y-4">
                        <div>
                            <Label htmlFor="name">Imię i Nazwisko</Label>
                            <Input id="name" {...register('name')} />
                            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                        </div>
                        <div>
                            <Label htmlFor="email">Adres Email</Label>
                            <Input id="email" type="email" {...register('email')} />
                            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
                        </div>
                    </div>
                    <SheetFooter>
                        <SheetClose asChild>
                            <Button type="button" variant="outline">Anuluj</Button>
                        </SheetClose>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
