
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { BurndownDataPoint } from '@/types';
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Icons } from '@/components/icons';

interface LiveStatsProps {
  initialData: BurndownDataPoint[];
}

export default function LiveStats({ initialData }: LiveStatsProps) {
  const { chartData, hasData } = useMemo(() => {
    if (!initialData || initialData.length === 0) {
      return { chartData: [], hasData: false };
    }
    
    // Sort data by date
    const sortedData = [...initialData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return { 
      chartData: sortedData,
      hasData: true,
    };
  }, [initialData]);

  const chartConfig = {
    ideal: { label: 'Idealna ścieżka', color: 'hsl(var(--muted-foreground)/0.5)' },
    actual: { label: 'Rzeczywisty postęp', color: 'hsl(var(--primary))' },
  };

  return (
    <Card className="w-full lg:col-span-3">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
                <CardTitle>Wykres Spalania (Burndown Chart)</CardTitle>
                <CardDescription>Wizualizacja postępu projektu w czasie. Dane zarządzane przez Project Managera.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
          {hasData ? (
            <>
                <div className="h-[350px] w-full">
                <ChartContainer config={chartConfig}>
                    <AreaChart accessibilityLayer data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} name="Dzień" />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 2']} label={{ value: "Pozostałe zadania", angle: -90, position: 'insideLeft', offset: 10 }} />
                    <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                    <defs>
                        <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                    <Area dataKey="ideal" type="monotone" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} name="Idealnie" />
                    <Area dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} fill="url(#fillActual)" fillOpacity={0.4} dot={false} name="Rzeczywiście" />
                    </AreaChart>
                </ChartContainer>
                </div>
            </>
          ) : (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
                <Icons.folderOpen className="h-12 w-12" />
                <h3 className="text-lg font-semibold">Brak danych do wygenerowania wykresu</h3>
                <p>Project Manager musi skonfigurować dane dla wykresu spalania.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
