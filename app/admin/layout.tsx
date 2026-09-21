'use client';
import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/store/AppContext';
import { LogOut, ShieldCheck } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isHydrated, logoutAdmin } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAdmin) router.replace('/admin/login');
  }, [isHydrated, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;
    const iv = setInterval(() => {
      import('@/lib/auth').then(({ loadAdminSession }) => {
        if (!loadAdminSession()) { logoutAdmin(); router.replace('/admin/login'); }
      });
    }, 60_000);
    return () => clearInterval(iv);
  }, [isAdmin, logoutAdmin, router]);

  // Don't block login page — render children directly when not authenticated
  if (!isHydrated || !isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-[0.06]"
          style={{ background:'radial-gradient(ellipse,#2979ff 0%,transparent 70%)', filter:'blur(40px)' }} />
      </div>

      <header className="sticky top-0 z-50"
        style={{ background:'rgba(5,13,31,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image src="/logo.svg" alt="Halifax" width={80} height={32}
              className="h-8 w-auto object-contain opacity-85" />
            <div className="h-4 w-px" style={{ background:'rgba(255,255,255,0.1)' }} />
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={11} style={{ color:'rgba(100,160,255,0.7)' }} />
              <span className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color:'rgba(100,160,255,0.7)' }}>Admin Portal</span>
            </div>
          </div>
          <button onClick={() => { logoutAdmin(); router.push('/admin/login'); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ color:'rgba(255,255,255,0.3)', border:'1px solid transparent' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='#fca5a5'; (e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.08)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(239,68,68,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background='transparent'; (e.currentTarget as HTMLElement).style.borderColor='transparent'; }}>
            <LogOut size={13}/> Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  );
}
