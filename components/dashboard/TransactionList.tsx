'use client';
import { useState } from 'react';
import { Search, ArrowUpRight, ArrowDownLeft, Landmark } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/formatters';
import { Transaction } from '@/lib/types';
import { TransactionDetail } from './TransactionDetail';

const CAT_EMOJI: Record<string, string> = {
  salary: '💼', entertainment: '🎬', food: '🍔', transport: '🚗',
  transfer: '↗', utilities: '⚡', shopping: '🛍️', other: '📦',
};

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce<Record<string, Transaction[]>>((acc, tx) => {
    const k = formatDate(tx.timestamp);
    if (!acc[k]) acc[k] = [];
    acc[k].push(tx);
    return acc;
  }, {});
}

function TxRow({ tx, onClick }: { tx: Transaction; onClick: () => void }) {
  const isCredit = tx.type === 'credit';
  const isInternal = tx.isInternalTransfer;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 transition-colors text-left active:scale-[0.99]"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(79,142,247,0.05)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: isCredit ? 'rgba(34,197,94,0.12)' : 'rgba(79,142,247,0.12)' }}>
        {isInternal
          ? <Landmark size={16} style={{ color: isCredit ? '#4ade80' : '#93c5fd' }} />
          : <span className="text-base">{CAT_EMOJI[tx.category] ?? '📦'}</span>}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        {/* Description */}
        <p className="text-sm font-semibold truncate" style={{ color: 'rgba(255,255,255,0.82)' }}>
          {tx.description}
        </p>
        {/* Sender/Receiver + Bank */}
        <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
          {isCredit ? '↙ From: ' : '↗ To: '}
          <span style={{ color: 'rgba(255,255,255,0.55)' }}>{tx.recipient || 'Halifax'}</span>
          {isInternal && (
            <span style={{ color: 'rgba(79,142,247,0.70)' }}> · Halifax</span>
          )}
        </p>
        {/* Time */}
        <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.22)' }}>
          {formatDateTime(tx.timestamp)}
          {tx.status !== 'completed' && (
            <span className={`ml-2 font-semibold ${tx.status === 'pending' ? 'text-amber-400' : 'text-red-400'}`}>
              · {tx.status}
            </span>
          )}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 ml-2">
        <div className="flex items-center justify-end gap-1 mb-0.5">
          {isCredit
            ? <ArrowDownLeft size={11} className="text-emerald-400" />
            : <ArrowUpRight size={11} style={{ color: 'rgba(255,255,255,0.40)' }} />}
          <p className={`text-sm font-bold ${isCredit ? 'text-emerald-400' : ''}`}
            style={!isCredit ? { color: 'rgba(255,255,255,0.80)' } : {}}>
            {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
          </p>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md"
          style={{ color: 'rgba(255,255,255,0.30)', background: 'rgba(255,255,255,0.06)' }}>
          {tx.category}
        </span>
      </div>
    </button>
  );
}

export function TransactionList({ limit, showSearch = true }: { limit?: number; showSearch?: boolean }) {
  const { activeSubAccount } = useApp();
  const txs = activeSubAccount?.transactions ?? [];
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [selTx, setSelTx] = useState<Transaction | null>(null);
  const [detailOpen, setDetail] = useState(false);

  const filtered = txs.filter(tx => {
    const ms = tx.description.toLowerCase().includes(search.toLowerCase()) ||
      (tx.recipient ?? '').toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'all' || tx.type === filter;
    return ms && mf;
  });
  const displayed = limit ? filtered.slice(0, limit) : filtered;
  const grouped = groupByDate(displayed);

  return (
    <>
      <div className="space-y-3">
        {showSearch && (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(255,255,255,0.22)' }} />
              <input placeholder="Search transactions..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="glass-input w-full h-10 pl-10 pr-4 rounded-xl text-sm" />
            </div>
            <div className="flex rounded-xl p-0.5 gap-0.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}>
              {(['all', 'credit', 'debit'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-3 h-8 text-[10px] font-semibold rounded-lg capitalize transition-all"
                  style={filter === f
                    ? { background: 'linear-gradient(135deg,#4f8ef7,#3b7de8)', color: '#fff' }
                    : { color: 'rgba(255,255,255,0.30)' }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayed.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <Search size={18} style={{ color: 'rgba(255,255,255,0.18)' }} />
            </div>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.22)' }}>No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.keys(grouped).map(dateLabel => (
              <div key={dateLabel}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2 px-1"
                  style={{ color: 'rgba(255,255,255,0.28)' }}>{dateLabel}</p>
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {grouped[dateLabel].map(tx => (
                    <TxRow key={tx.id} tx={tx} onClick={() => { setSelTx(tx); setDetail(true); }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <TransactionDetail transaction={selTx} open={detailOpen} onOpenChange={setDetail} />
    </>
  );
}
