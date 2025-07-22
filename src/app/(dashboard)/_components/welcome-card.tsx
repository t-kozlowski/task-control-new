'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectIcon } from "@/components/icons";
import { Lightbulb } from "lucide-react";

export function WelcomeCard() {
    return (
        <Card className="w-full bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <ProjectIcon className="h-10 w-10 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Witaj w Kontroli Tasków LSP!</CardTitle>
                        <CardDescription>Oto przewodnik po kluczowych funkcjach, które pomogą Ci w pracy.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Pulpit Główny</h3>
                    <p className="text-muted-foreground">Twoje centrum dowodzenia. Znajdziesz tu strategiczne podpowiedzi AI, kluczowe metryki, wykres spalania oraz listę zadań wymagających pilnej pomocy.</p>
                </div>
                <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Moje Zadania i Mój Dzień</h3>
                    <p className="text-muted-foreground">Osobiste widoki pokazujące wszystkie zadania przypisane do Ciebie oraz te, których termin upływa dzisiaj. Idealne do organizacji codziennej pracy.</p>
                </div>
                 <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Backlog</h3>
                    <p className="text-muted-foreground">Szczegółowa tabela wszystkich zadań w projekcie. Tutaj możesz dodawać, edytować i filtrować zadania, a także korzystać z AI do sugerowania opisów.</p>
                </div>
                 <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Spotkania</h3>
                    <p className="text-muted-foreground">Zarządzaj spotkaniami, twórz notatki i punkty akcji. AI pomoże Ci przygotować się do spotkania i zredagować profesjonalne podsumowanie.</p>
                </div>
                 <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Dyrektywy AI</h3>
                    <p className="text-muted-foreground">"Programuj" zachowanie AI, ustalając globalne wytyczne, które wpłyną na jej analizy, sugestie i rekomendacje w całej aplikacji.</p>
                </div>
                <div className="space-y-1 p-4 rounded-lg bg-secondary/30">
                    <h3 className="font-semibold text-primary flex items-center gap-2"><Lightbulb className="size-4" />Panel Managera</h3>
                    <p className="text-muted-foreground">Chroniona sekcja dla Project Managera, umożliwiająca zarządzanie wizją projektu, danymi do wykresów oraz zaawansowanymi metrykami.</p>
                </div>
            </CardContent>
        </Card>
    );
}
