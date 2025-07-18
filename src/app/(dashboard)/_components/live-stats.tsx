
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { BurndownDataPoint } from '@/types';
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Line } from 'recharts';
import { Icons } from '@/components/icons';
import { differenceInDays, addDays, format } from 'date-fns';

interface LiveStatsProps {
  initialData: BurndownDataPoint[];
}

export default function LiveStats({ initialData }: LiveStatsProps) {
  const [projectDeadline, setProjectDeadline] = useState<string | null>(null);

  useEffect(() => {
    const storedDeadline = localStorage.getItem('projectDeadline');
    if (storedDeadline) {
      setProjectDeadline(storedDeadline);
    }
    const handleStorageChange = () => {
        const storedDeadline = localStorage.getItem('projectDeadline');
        setProjectDeadline(storedDeadline);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  const { chartData, hasData } = useMemo(() => {
    if (!initialData || initialData.length === 0) {
      return { chartData: [], hasData: false };
    }
    
    const sortedData = [...initialData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const today = new Date().toISOString().split('T')[0];
    const lastKnownPointIndex = sortedData.findLastIndex(p => p.date <= today && p.actual !== null && p.actual !== undefined);
    const lastKnownPoint = lastKnownPointIndex !== -1 ? sortedData[lastKnownPointIndex] : null;

    let processedData = sortedData.map((d, index) => ({
        ...d,
        actual: index > lastKnownPointIndex ? null : d.actual,
    }));
    
    if (projectDeadline && lastKnownPoint) {
      const remainingDays = differenceInDays(new Date(projectDeadline), new Date(lastKnownPoint.date));
      if (remainingDays > 0) {
          const dailyReduction = lastKnownPoint.actual / remainingDays;
          
          let predictionData = [];
          for (let i = 1; i <= remainingDays; i++) {
              const predictionDate = format(addDays(new Date(lastKnownPoint.date), i), 'yyyy-MM-dd');
              const predictedValue = Math.max(0, lastKnownPoint.actual - (dailyReduction * i));
              
              const existingPointIndex = processedData.findIndex(p => p.date === predictionDate);
              if (existingPointIndex !== -1) {
                  processedData[existingPointIndex].prediction = predictedValue;
              } else {
                   predictionData.push({
                      date: predictionDate,
                      ideal: null,
                      actual: null,
                      prediction: predictedValue,
                  });
              }
          }
          const lastKnownPointInData = processedData.find(p => p.date === lastKnownPoint.date);
          if (lastKnownPointInData) {
            lastKnownPointInData.prediction = lastKnownPoint.actual;
          }
          
          processedData = [...processedData, ...predictionData].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      }
    }

    return { 
      chartData: processedData,
      hasData: true,
    };
  }, [initialData, projectDeadline]);

  const chartConfig = {
    ideal: { label: 'Idealna ścieżka', color: 'hsl(var(--muted-foreground)/0.5)' },
    actual: { label: 'Rzeczywisty postęp', color: 'hsl(var(--primary))' },
    prediction: { label: 'Predykcja do celu', color: 'hsl(30 90% 60%)' },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wykres Spalania</CardTitle>
        <CardDescription>Postęp projektu z predykcją.</CardDescription>
      </CardHeader>
      <CardContent>
          {hasData ? (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart accessibilityLayer data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} name="Dzień" fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} domain={[0, 'dataMax + 5']} label={{ value: "Pozostałe zadania", angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle' } }} fontSize={12} />
                  <ChartTooltip cursor={true} content={<ChartTooltipContent indicator="dot" />} />
                  <defs>
                      <linearGradient id="fillActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-actual)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--color-actual)" stopOpacity={0.1} />
                      </linearGradient>
                  </defs>
                  <Area dataKey="ideal" type="monotone" stroke="var(--color-ideal)" strokeWidth={2} strokeDasharray="5 5" fillOpacity={0} dot={false} name="Idealnie" connectNulls />
                  <Area dataKey="actual" type="monotone" stroke="var(--color-actual)" strokeWidth={2} fill="url(#fillActual)" fillOpacity={0.4} dot={false} name="Rzeczywiście" connectNulls={false} />
                  <Line dataKey="prediction" type="monotone" stroke="var(--color-prediction)" strokeWidth={2} strokeDasharray="3 7" dot={false} name="Predykcja" connectNulls />
                </AreaChart>
              </ChartContainer>
          ) : (
            <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4 h-[300px] justify-center">
                <Icons.folderOpen className="h-12 w-12" />
                <h3 className="text-lg font-semibold">Brak danych do wykresu</h3>
                <p className="text-sm">Skonfiguruj dane w panelu managera.</p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
