// src/app/(dashboard)/settings/page.tsx
import { Settings } from 'lucide-react';
import SettingsClient from './_components/settings-client';

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Konfiguracja</h1>
      </div>
      <SettingsClient />
    </div>
  );
}
