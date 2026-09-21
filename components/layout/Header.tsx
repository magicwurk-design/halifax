'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Settings, Headphones, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel';
import { SettingsModal } from '@/components/dashboard/SettingsModal';
import { SupportModal } from '@/components/dashboard/SupportModal';

const INITIAL_UNREAD = 2;

export function Header({ onBackToAdmin, isClient = false }: { onBackToAdmin?: () => void; isClient?: boolean }) {
  const { activeSubAccount, logoutAdmin, clientLogout } = useApp();
  const router = useRouter();
  const [notifOpen, setNotifOpen]     = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [supportOpen, setSupportOpen]   = useState(false);
  const [unread, setUnread]             = useState(INITIAL_UNREAD);

  React.useEffect(() => { setUnread(INITIAL_UNREAD); }, [activeSubAccount?.user.email]);

  const initials = activeSubAccount?.user.avatarInitials ?? 'U';

  return (
    <>
      {/* Admin impersonation banner — gold accent (admin only) */}
      {onBackToAdmin && !isClient && (
        <div className="px-4 py-2 flex items-center justify-between"
          style={{ background:'rgba(201,168,76,0.07)', borderBottom:'1px solid rgba(201,168,76,0.15)' }}>
          <div className="flex items-center gap-2 text-xs font-medium"
            style={{ color:'rgba(201,168,76,0.80)' }}>
            <ShieldCheck size={11}/>
            <span>Admin view — {activeSubAccount?.user.name}</span>
          </div>
          <button onClick={onBackToAdmin}
            className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
            style={{ color:'rgba(201,168,76,0.60)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color='#c9a84c'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color='rgba(201,168,76,0.60)'}>
            <ArrowLeft size={11}/> Back to Admin
          </button>
        </div>
      )}

      <header className="sticky top-0 z-50"
        style={{ background:'rgba(5,13,31,0.88)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Image src="/logo.svg" alt="Halifax" width={80} height={32}
            className="h-8 w-auto object-contain opacity-85" />

          <div className="flex items-center gap-1">
            {[
              { Icon: Headphones, onClick: () => setSupportOpen(true), label:'Support' },
            ].map(({ Icon, onClick, label }) => (
              <button key={label} onClick={onClick}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all"
                style={{ color:'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)'; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background='transparent'; }}>
                <Icon size={17}/>
              </button>
            ))}

            {/* Notification bell */}
            <button onClick={() => setNotifOpen(true)}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{ color:'rgba(255,255,255,0.3)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.7)'; (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color='rgba(255,255,255,0.3)'; (e.currentTarget as HTMLElement).style.background='transparent'; }}>
              <Bell size={17}/>
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[14px] h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold text-white px-0.5"
                  style={{ background:'linear-gradient(135deg,#2979ff,#1558d6)' }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-2xl ml-1 transition-all"
                  style={{ border:'1px solid transparent' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background='transparent'}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                    style={{ background:'linear-gradient(135deg,#2979ff 0%,#1558d6 100%)' }}>
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold leading-tight" style={{ color:'rgba(255,255,255,0.80)' }}>
                      {activeSubAccount?.user.name ?? 'Account'}
                    </p>
                    <p className="text-[10px] leading-tight" style={{ color:'rgba(255,255,255,0.28)' }}>{isClient ? 'My Account' : 'Admin View'}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5">
                <div className="px-3 py-2.5 mb-1">
                  <p className="text-sm font-semibold" style={{ color:'rgba(255,255,255,0.82)' }}>{activeSubAccount?.user.name}</p>
                  <p className="text-xs" style={{ color:'rgba(255,255,255,0.32)' }}>{activeSubAccount?.user.email}</p>
                </div>
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => setSettingsOpen(true)} className="gap-2.5 rounded-xl"><Settings size={14}/> Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSupportOpen(true)} className="gap-2.5 rounded-xl"><Headphones size={14}/> Support</DropdownMenuItem>
                {onBackToAdmin && !isClient && (
                  <>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={onBackToAdmin} className="gap-2.5 rounded-xl" style={{ color:'rgba(201,168,76,0.75)' }}>
                      <ArrowLeft size={14}/> Back to Admin
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator/>
                <DropdownMenuItem onClick={() => { if (isClient) { clientLogout(); router.push('/login'); } else { logoutAdmin(); router.push('/admin/login'); } }}
                  className="gap-2.5 rounded-xl text-red-400/80"><LogOut size={14}/> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <NotificationsPanel open={notifOpen} onOpenChange={setNotifOpen} onUnreadChange={setUnread}/>
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen}/>
      <SupportModal open={supportOpen} onOpenChange={setSupportOpen}/>
    </>
  );
}
