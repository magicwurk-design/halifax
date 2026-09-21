import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Halifax Private Banking',
  description: 'Private banking. Elevated.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Halifax' },
};

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1,
  userScalable: false, themeColor: '#0a0f1e', viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-navy`}>
        <Providers>
          <ServiceWorkerRegistration />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
