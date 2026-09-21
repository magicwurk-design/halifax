'use client';

import { ThemeProvider } from 'next-themes';
import { AppProvider } from '@/store/AppContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  );
}
