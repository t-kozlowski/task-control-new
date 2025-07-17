import type { Metadata } from 'next';
import './globals.css';
import { Inter as FontSans } from "next/font/google"
import { cn } from '@/lib/utils';
import { AppProvider } from '@/context/app-context';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: 'Project Sentinel',
  description: 'Zaawansowany pulpit do zarządzania projektami w czasie rzeczywistym i strategicznej analizy AI.',
};

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="dark">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
