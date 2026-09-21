'use client';

import { useState } from 'react';
import { Bell, ShieldCheck, ArrowUpRight, CreditCard, Info, CheckCheck, type LucideIcon } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NotificationsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnreadChange?: (count: number) => void;
}

interface Notification {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    icon: ArrowUpRight,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    title: 'Transfer Successful',
    body: 'Your transfer of £250.00 to Sarah Johnson was completed.',
    time: '2 min ago',
    read: false,
  },
  {
    id: '2',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Login Alert',
    body: 'New sign-in to your account from Chrome on Mac.',
    time: '1 hour ago',
    read: false,
  },
  {
    id: '3',
    icon: CreditCard,
    iconBg: 'bg-slate-50',
    iconColor: 'text-slate-500',
    title: 'Monthly Statement Ready',
    body: 'Your statement for this month is now available to view.',
    time: '2 days ago',
    read: true,
  },
  {
    id: '4',
    icon: Info,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    title: 'Scheduled Maintenance',
    body: 'Brief downtime on Sunday 22 Apr between 02:00–04:00.',
    time: '3 days ago',
    read: true,
  },
  {
    id: '5',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'Security Check Passed',
    body: 'Your account passed our routine security verification.',
    time: '5 days ago',
    read: true,
  },
];

export function NotificationsPanel({ open, onOpenChange, onUnreadChange }: NotificationsPanelProps) {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    onUnreadChange?.(0);
  };

  const markRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => n.id === id ? { ...n, read: true } : n);
      onUnreadChange?.(next.filter((n) => !n.read).length);
      return next;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-sm p-0 flex flex-col">
        <div className="bg-gradient-to-r from-blue-800 to-blue-600 p-5 text-white flex-shrink-0">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-white text-xl font-bold">Notifications</SheetTitle>
                <p className="text-blue-200 text-sm mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-xl px-3 py-1.5"
                >
                  <CheckCheck size={13} />
                  Mark all read
                </button>
              )}
            </div>
          </SheetHeader>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-50">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 gap-3 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <Bell size={22} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium">No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = n.icon;
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3.5 px-5 py-4 text-left hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-2xl ${n.iconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Icon size={18} className={n.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-800 truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{n.body}</p>
                    <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
