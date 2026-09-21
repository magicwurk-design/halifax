'use client';

import { Receipt } from '@/lib/types';
import { formatCurrency, formatFullDate } from '@/lib/formatters';
import { CircleCheck as CheckCircle2, Clock, Circle as XCircle, Printer, Download, ArrowLeft, Building2, Hash, User, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionReceiptProps {
  receipt: Receipt;
  onBack: () => void;
  onClose: () => void;
}

const STATUS_CONFIG = {
  completed: {
    icon: CheckCircle2,
    label: 'Payment Successful',
    sublabel: 'Your transfer has been processed',
    iconClass: 'text-emerald-500',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-200',
    badgeText: 'text-emerald-700',
    badgeLabel: 'COMPLETED',
    ringClass: 'ring-emerald-100',
    headerGradient: 'from-emerald-600 to-teal-500',
    barColor: 'bg-emerald-500',
  },
  pending: {
    icon: Clock,
    label: 'Transfer Pending',
    sublabel: 'Processing — usually within 2 hours',
    iconClass: 'text-amber-500',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-200',
    badgeText: 'text-amber-700',
    badgeLabel: 'PENDING',
    ringClass: 'ring-amber-100',
    headerGradient: 'from-amber-500 to-orange-400',
    barColor: 'bg-amber-500',
  },
  failed: {
    icon: XCircle,
    label: 'Transfer Failed',
    sublabel: 'This transaction was not processed',
    iconClass: 'text-red-500',
    badgeBg: 'bg-red-50',
    badgeBorder: 'border-red-200',
    badgeText: 'text-red-700',
    badgeLabel: 'FAILED',
    ringClass: 'ring-red-100',
    headerGradient: 'from-red-600 to-rose-500',
    barColor: 'bg-red-500',
  },
};

export function TransactionReceipt({ receipt, onBack, onClose }: TransactionReceiptProps) {
  const cfg = STATUS_CONFIG[receipt.status];
  const Icon = cfg.icon;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const lines = [
      '='.repeat(44),
      '      HALIFAX DIGITAL BANK',
      '      Transaction Receipt',
      '='.repeat(44),
      '',
      `Status:        ${cfg.badgeLabel}`,
      `Receipt ID:    ${receipt.id}`,
      `Reference:     ${receipt.reference}`,
      `Date & Time:   ${formatFullDate(receipt.timestamp)}`,
      '',
      '-'.repeat(44),
      'SENDER',
      '-'.repeat(44),
      `Name:          ${receipt.senderName}`,
      `Account:       ${receipt.senderAccount}`,
      `Sort Code:     ${receipt.senderSortCode}`,
      `Bank:          Halifax Digital Bank`,
      '',
      '-'.repeat(44),
      'RECIPIENT',
      '-'.repeat(44),
      `Name:          ${receipt.recipientName}`,
      `Bank:          ${receipt.bankFlag} ${receipt.bankName}`,
      receipt.note ? `Reference:     ${receipt.note}` : '',
      '',
      '-'.repeat(44),
      'TRANSACTION',
      '-'.repeat(44),
      `Amount:        ${formatCurrency(receipt.amount)}`,
      `Fee:           Free`,
      receipt.status !== 'failed' ? `Balance After: ${formatCurrency(receipt.newBalance)}` : `Balance:       Unchanged`,
      receipt.failureReason ? `Failure:       ${receipt.failureReason}` : '',
      '',
      '='.repeat(44),
      'Halifax Digital Bank',
      'Official Transaction Receipt',
      '='.repeat(44),
    ].filter(Boolean).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `halifax-receipt-${receipt.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col">
      <div className={`bg-gradient-to-r ${cfg.headerGradient} px-5 pt-4 pb-6 text-white`}>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <ArrowLeft size={15} className="text-white" />
          </button>
          <div>
            <h2 className="text-lg font-bold leading-none">Receipt</h2>
            <p className="text-white/70 text-xs mt-0.5">Transaction record</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          <div className={`w-16 h-16 rounded-full bg-white/20 ring-4 ${cfg.ringClass} flex items-center justify-center`}>
            <Icon size={32} className="text-white" />
          </div>
          <div className="text-center">
            <p className="text-2xl font-extrabold tracking-tight">{formatCurrency(receipt.amount)}</p>
            <p className="text-white/80 text-sm font-medium mt-0.5">{cfg.label}</p>
          </div>
          <span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold border ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder}`}>
            {cfg.badgeLabel}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -top-3 left-0 right-0 flex justify-between px-4">
          <div className="w-6 h-6 rounded-full bg-slate-100" />
          <div className="w-6 h-6 rounded-full bg-slate-100" />
        </div>
        <div className="absolute -top-px left-8 right-8 border-t-2 border-dashed border-slate-200" />
      </div>

      <div className="px-5 py-5 space-y-4 overflow-y-auto">
        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
          <SectionHeader icon={<User size={13} />} label="Sender" />
          <div className="px-4 pb-3 space-y-2.5">
            <Row label="Name" value={receipt.senderName} />
            <Row label="Account" value={receipt.senderAccount} mono />
            <Row label="Sort Code" value={receipt.senderSortCode} mono />
            <Row label="Bank" value="Halifax Digital Bank" />
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
          <SectionHeader icon={<Building2 size={13} />} label="Recipient" />
          <div className="px-4 pb-3 space-y-2.5">
            <Row label="Name" value={receipt.recipientName} />
            <Row label="Bank" value={`${receipt.bankFlag} ${receipt.bankName}`} />
            {receipt.note && <Row label="Reference" value={receipt.note} />}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
          <SectionHeader icon={<CreditCard size={13} />} label="Transaction Details" />
          <div className="px-4 pb-3 space-y-2.5">
            <Row label="Amount" value={formatCurrency(receipt.amount)} highlight />
            <Row label="Transfer Fee" value="Free" success />
            {receipt.status !== 'failed' ? (
              <Row label="Balance After" value={formatCurrency(receipt.newBalance)} />
            ) : (
              <Row label="Balance" value="Unchanged" />
            )}
            {receipt.failureReason && (
              <div className="pt-1">
                <p className="text-xs text-slate-400 mb-1">Failure Reason</p>
                <p className="text-xs text-red-600 font-medium leading-relaxed">{receipt.failureReason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
          <SectionHeader icon={<Hash size={13} />} label="Reference" />
          <div className="px-4 pb-3 space-y-2.5">
            <Row label="Receipt ID" value={receipt.id} mono />
            <Row label="Reference" value={receipt.reference} mono />
            <Row label="Date & Time" value={formatFullDate(receipt.timestamp)} />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-2">
          <div className="flex gap-0.5">
            {Array.from({ length: 28 }, (_, i) => (
              <div
                key={i}
                className={`w-1 rounded-sm ${cfg.barColor}`}
                style={{ height: `${12 + Math.abs(Math.sin(i * 0.9) * 20)}px` }}
              />
            ))}
          </div>
        </div>

        <div className="text-center space-y-0.5 pb-1">
          <p className="text-xs font-bold text-slate-500">Halifax Digital Bank</p>
          <p className="text-xs text-slate-300">Official transaction record</p>
        </div>

        <div className="flex gap-3 pb-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex-1 rounded-xl h-11 border-slate-200 gap-2 text-sm font-semibold"
          >
            <Download size={15} />
            Download
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 rounded-xl h-11 bg-blue-600 hover:bg-blue-700 gap-2 text-sm font-semibold"
          >
            <Printer size={15} />
            Print
          </Button>
        </div>
        <Button onClick={onClose} variant="ghost" className="w-full rounded-xl h-10 text-sm text-slate-500">
          Close
        </Button>
      </div>
    </div>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-white">
      <span className="text-slate-400">{icon}</span>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  highlight,
  success,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
  success?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate-400 flex-shrink-0 pt-0.5">{label}</span>
      <span
        className={`text-xs text-right font-semibold break-all ${
          highlight ? 'text-blue-700 text-sm' : success ? 'text-emerald-600' : 'text-slate-700'
        } ${mono ? 'font-mono tracking-wider' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}
