'use client';
import { useState } from 'react';
import { LayoutDashboard, ArrowLeftRight, ShieldAlert } from 'lucide-react';
import { AccountCard } from '@/components/dashboard/AccountCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { TransferModal } from '@/components/dashboard/TransferModal';
import { ReceiveModal } from '@/components/dashboard/ReceiveModal';
import { TopUpModal } from '@/components/dashboard/TopUpModal';
import { SpendingStats } from '@/components/dashboard/SpendingStats';
import { useApp } from '@/store/AppContext';

type Tab = 'overview' | 'transactions';
const TABS = [
  { key: 'overview' as Tab, label: 'Overview', icon: LayoutDashboard },
  { key: 'transactions' as Tab, label: 'Transactions', icon: ArrowLeftRight },
];

export default function DashboardPage() {
  const { activeSubAccount } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [transferOpen, setTransferOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);

  if (!activeSubAccount) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = activeSubAccount.user.name.split(' ')[0];

  return (
    <>
      <div className="h-full flex flex-col max-w-lg mx-auto w-full px-4 pt-4 pb-2">
        {/* Greeting */}
        <div className="flex items-center justify-between mb-3 flex-shrink-0">
          <div>
            <p className="text-white/30 text-xs tracking-wide">{greeting},</p>
            <h1 className="text-lg font-semibold text-white/90 leading-tight">{firstName}</h1>
          </div>
          <div className="px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider" style={{ background: 'rgba(29,110,245,0.10)', border: '1px solid rgba(29,110,245,0.22)', color: 'rgba(100,160,255,0.82)' }}>
            CLIENT
          </div>
        </div>

        {/* Card */}
        <div className="flex-shrink-0 mb-3"><AccountCard /></div>

        {/* Lien banner — shown when account is blocked */}
        {activeSubAccount.isBlocked && (
          <div className="flex-shrink-0 mb-3 rounded-2xl overflow-hidden animate-fade-in"
            style={{ border: '1px solid rgba(239,68,68,0.40)', background: 'linear-gradient(135deg,rgba(127,0,0,0.60) 0%,rgba(60,0,0,0.80) 100%)' }}>
            <div className="px-4 py-4 flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.40)' }}>
                <ShieldAlert size={22} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold tracking-widest uppercase" style={{ color: '#f87171', letterSpacing: '0.15em' }}>Lien</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  A lien has been placed on this account. Transfers are suspended. Contact support to resolve.
                </p>
              </div>
            </div>
            <div className="px-4 pb-3">
              <a href="tel:08000729779"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.30)', color: '#fca5a5' }}>
                📞 Contact Support
              </a>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex rounded-2xl p-1 gap-1 mb-3 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.08)' }}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 ${tab === key ? 'text-white shadow-sm' : 'text-white/30 hover:text-white/60'}`}
              style={tab === key ? { background: 'linear-gradient(135deg,#2979ff,#1558d6)' } : {}}>
              <Icon size={13} />{label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {tab === 'overview' && (
            <div className="space-y-4 pb-6">
              <QuickActions
                onSend={() => setTransferOpen(true)}
                onReceive={() => setReceiveOpen(true)}
                onTransactions={() => setTab('transactions')}
                onTopUp={() => setTopUpOpen(true)}
              />
              <SpendingStats />
              <TransactionList limit={5} />
            </div>
          )}
          {tab === 'transactions' && (
            <div className="pb-6"><TransactionList /></div>
          )}

        </div>
      </div>

      <TransferModal open={transferOpen} onOpenChange={setTransferOpen} />
      <ReceiveModal open={receiveOpen} onOpenChange={setReceiveOpen} />
      <TopUpModal open={topUpOpen} onOpenChange={setTopUpOpen} />
    </>
  );
}
