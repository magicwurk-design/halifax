'use client';

import { ArrowUpRight, ArrowDownLeft, X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { Sheet, SheetContent } from '@/components/ui/sheet';

interface TransactionDetailProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  salary: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  entertainment: 'bg-violet-50 text-violet-700 border-violet-100',
  food: 'bg-orange-50 text-orange-700 border-orange-100',
  transport: 'bg-sky-50 text-sky-700 border-sky-100',
  transfer: 'bg-blue-50 text-blue-700 border-blue-100',
  utilities: 'bg-amber-50 text-amber-700 border-amber-100',
  shopping: 'bg-pink-50 text-pink-700 border-pink-100',
  other: 'bg-slate-50 text-slate-700 border-slate-100',
};

const CATEGORY_EMOJI: Record<string, string> = {
  salary: '💼',
  entertainment: '🎬',
  food: '🍔',
  transport: '🚗',
  transfer: '↗',
  utilities: '⚡',
  shopping: '🛍️',
  other: '📦',
};

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
};

export function TransactionDetail({ transaction: tx, open, onOpenChange }: TransactionDetailProps) {
  const [copied, setCopied] = useState(false);

  const isCredit = tx?.type === 'credit';
  const emoji = CATEGORY_EMOJI[tx?.category ?? 'other'] ?? '📦';
  const catColor = CATEGORY_COLORS[tx?.category ?? 'other'] ?? CATEGORY_COLORS.other;
  const status = tx ? STATUS_CONFIG[tx.status] : STATUS_CONFIG.completed;

  if (!tx) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(tx.reference).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0 max-h-[85vh] flex flex-col border-0">
        <div className={`p-5 flex-shrink-0 ${isCredit ? 'bg-gradient-to-r from-emerald-700 to-teal-500' : 'bg-gradient-to-r from-blue-800 to-blue-600'}`}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">Transaction Details</p>
            <button
              onClick={() => onOpenChange(false)}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={14} className="text-white" />
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
              {emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg leading-tight truncate">{tx.description}</p>
              <p className="text-white/70 text-sm mt-0.5 truncate">{tx.recipient}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-2xl font-bold ${isCredit ? 'text-emerald-200' : 'text-white'}`}>
                {isCredit ? '+' : '−'}{formatCurrency(tx.amount)}
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                {isCredit ? <ArrowDownLeft size={12} className="text-white/60" /> : <ArrowUpRight size={12} className="text-white/60" />}
                <p className="text-white/60 text-xs capitalize">{tx.type}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0 p-5 space-y-4">
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
            <DetailRow label={isCredit ? 'Sender' : 'Recipient'} value={tx.recipient || 'Halifax Private Banking'} />
            <DetailRow label="Bank" value={tx.isInternalTransfer ? 'Halifax Private Banking' : 'External Transfer'} />
            <DetailRow label="Date" value={formatDate(tx.timestamp)} />
            <DetailRow label="Time" value={formatTime(tx.timestamp)} />
            <DetailRow label="Status">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${status.bg} ${status.border} ${status.color}`}>
                {status.label}
              </span>
            </DetailRow>
            <DetailRow label="Category">
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md border ${catColor}`}>{tx.category}</span>
            </DetailRow>
            <DetailRow label="Reference">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-slate-800">{tx.reference}</span>
                <button
                  onClick={handleCopyRef}
                  className="p-1 rounded-md hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
                >
                  {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            </DetailRow>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${isCredit ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50 border-blue-100'}`}>
            <p className={`text-xs font-medium ${isCredit ? 'text-emerald-700' : 'text-blue-700'}`}>
              {isCredit
                ? 'This payment was received into your account.'
                : tx.status === 'failed'
                ? 'This transaction was declined. No funds were deducted.'
                : 'This payment was sent from your account.'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 gap-3">
      <span className="text-sm text-slate-500 flex-shrink-0">{label}</span>
      {children ?? <span className="text-sm font-semibold text-slate-800 text-right">{value}</span>}
    </div>
  );
}
