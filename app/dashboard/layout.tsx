'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/AppContext';
import { Header } from '@/components/layout/Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isClientLoggedIn, isHydrated, activeSubAccount, deselectSubAccount, clientLogout } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    // Neither admin nor logged-in client → send to client login
    if (!isAdmin && !isClientLoggedIn) { router.replace('/login'); return; }
    // Logged in but no active account selected yet (client session restores it)
    if (!activeSubAccount) {
      if (isAdmin) router.replace('/admin/dashboard');
      else router.replace('/login');
    }
  }, [isHydrated, isAdmin, isClientLoggedIn, activeSubAccount, router]);

  if (!isHydrated || (!isAdmin && !isClientLoggedIn) || !activeSubAccount) {
    return (
      <div className="h-screen flex items-center justify-center bg-navy">
        <div className="flex flex-col items-center gap-6">
          <Image src="/logo.svg" alt="Halifax" width={120} height={48} className="h-12 w-auto object-contain opacity-80" />
          <p className="text-white/30 text-sm tracking-wider">Loading account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-navy overflow-hidden">
      <Header onBackToAdmin={isAdmin ? () => { deselectSubAccount(); router.push('/admin/dashboard'); } : () => { clientLogout(); router.push('/login'); }} isClient={!isAdmin} />
      <main className="flex-1 overflow-hidden relative z-10">{children}</main>
    </div>
  );
}
