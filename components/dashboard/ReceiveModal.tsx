'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReceiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiveModal({ open, onOpenChange }: ReceiveModalProps) {
  const { activeSubAccount } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    const doFallback = () => {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      } catch { /* silent — nothing useful to show */ }
    };

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      }).catch(doFallback);
    } else {
      doFallback();
    }
  };

  const user = activeSubAccount?.user;
  const name = user?.name ?? 'Account Holder';
  const bankName = user?.bankName ?? 'Halifax Digital Bank';
  const isInternational = user?.bankType === 'international';

  // International accounts use IBAN + SWIFT/BIC; all others use account number + sort code
  const iban = user?.iban ?? '';
  const swiftBic = user?.swiftBic ?? '';
  const accountNumber = user?.accountNumber ?? '';
  const sortCode = user?.sortCode ?? '';

  const shareText = isInternational
    ? `Bank: ${bankName}\nIBAN: ${iban}\nSWIFT/BIC: ${swiftBic}\nName: ${name}`
    : `Bank: ${bankName}\nAccount: ${accountNumber}\nSort Code: ${sortCode}\nName: ${name}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full border-slate-100 shadow-2xl p-0 overflow-hidden">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>
        <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">Receive Money</DialogTitle>
            <p className="text-emerald-100 text-sm mt-0.5">Share your account details</p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-center space-y-1">
            <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Account Holder</p>
            <p className="text-lg font-bold text-slate-800">{name}</p>
          </div>

          <div className="space-y-2.5">
            {isInternational ? (
              <>
                <DetailRow
                  label="IBAN"
                  value={iban || '—'}
                  onCopy={() => copyToClipboard(iban, 'iban')}
                  copied={copiedField === 'iban'}
                />
                <DetailRow
                  label="SWIFT / BIC"
                  value={swiftBic || '—'}
                  onCopy={() => copyToClipboard(swiftBic, 'swift')}
                  copied={copiedField === 'swift'}
                />
              </>
            ) : (
              <>
                <DetailRow
                  label="Account Number"
                  value={accountNumber || '—'}
                  onCopy={() => copyToClipboard(accountNumber, 'account')}
                  copied={copiedField === 'account'}
                />
                <DetailRow
                  label="Sort Code"
                  value={sortCode || '—'}
                  onCopy={() => copyToClipboard(sortCode, 'sort')}
                  copied={copiedField === 'sort'}
                />
              </>
            )}
            <DetailRow
              label="Bank"
              value={bankName}
              onCopy={() => copyToClipboard(bankName, 'bank')}
              copied={copiedField === 'bank'}
            />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">
              Share these details with anyone who wants to send you money via bank transfer.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full rounded-xl h-11 border-slate-200 gap-2"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Bank Details', text: shareText });
              } else {
                copyToClipboard(shareText, 'all');
              }
            }}
          >
            <Share2 size={15} />
            Share Details
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 font-mono">{value}</p>
      </div>
      <button
        onClick={onCopy}
        className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600"
      >
        {copied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
      </button>
    </div>
  );
}
