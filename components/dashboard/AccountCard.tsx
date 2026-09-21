'use client';
import { useState } from 'react';
import { Eye, EyeOff, Copy, Check, Wifi } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { formatCurrency } from '@/lib/formatters';
import { Avatar } from '@/components/ui/avatar';
import { getCardTheme } from '@/lib/cardThemes';

export function AccountCard() {
  const { activeSubAccount } = useApp();
  if (!activeSubAccount) return null;
  const { user, balance, id } = activeSubAccount;
  const [hidden, setHidden] = useState(true);
  const [copied, setCopied] = useState(false);

  const isIntl = user.bankType === 'international';
  const primaryRef    = isIntl ? (user.iban ?? '') : user.accountNumber;
  const secondaryLabel = isIntl ? 'SWIFT/BIC' : 'Sort Code';
  const secondaryRef  = isIntl ? (user.swiftBic ?? '') : user.sortCode;
  const primaryLabel  = isIntl ? 'IBAN' : 'Account Number';

  const theme = getCardTheme(user.bankId);

  const handleCopy = () => {
    navigator.clipboard.writeText(primaryRef).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden select-none shadow-2xl" style={{ minHeight: 200 }}>
      {/* Base gradient */}
      <div className="absolute inset-0" style={{ background: theme.gradient }} />
      {/* Shimmer overlay */}
      <div className="absolute inset-0" style={{ background: theme.shimmer }} />
      {/* Top highlight edge */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: theme.topHighlight }} />
      {/* Orb top-right */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full opacity-20" style={{ background: theme.orbTopRight }} />
      {/* Orb bottom-left */}
      <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full opacity-20" style={{ background: theme.orbBottomLeft }} />
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.9) 1px,transparent 1px)', backgroundSize: '18px 18px' }} />

      <div className="relative z-10 px-5 pt-5 pb-4 text-white">

        {/* Top row: avatar + name + bank + wifi */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar id={id} name={user.name} photo={user.profilePhoto} size="lg" />
            <div>
              <p className="text-[9px] font-semibold tracking-[0.18em] uppercase mb-0.5"
                style={{ color: 'rgba(255,255,255,0.45)' }}>
                {user.bankFlag} {user.bankName}
              </p>
              <p className="font-semibold text-sm leading-tight"
                style={{ color: 'rgba(255,255,255,0.92)' }}>{user.name}</p>
              {/* Bank type pill */}
              {user.bankType !== 'halifax' && (
                <span className="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)', letterSpacing: '0.06em' }}>
                  {user.bankType === 'international' ? 'INTERNATIONAL' : 'UK BANK'}
                </span>
              )}
            </div>
          </div>
          <Wifi size={14} className="rotate-90 mt-0.5 flex-shrink-0"
            style={{ color: 'rgba(255,255,255,0.30)' }} />
        </div>

        {/* Balance */}
        <div className="mb-4">
          <p className="text-[9px] tracking-[0.15em] uppercase mb-1.5"
            style={{ color: 'rgba(255,255,255,0.35)' }}>Available Balance</p>
          <div className="flex items-center gap-3">
            <p className="text-3xl font-light tracking-tight"
              style={{ color: 'rgba(255,255,255,0.95)' }}>
              {hidden ? '£ ••••••' : formatCurrency(balance)}
            </p>
            <button onClick={() => setHidden(!hidden)}
              className="p-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.10)' }}>
              {hidden
                ? <Eye size={13} style={{ color: 'rgba(255,255,255,0.50)' }} />
                : <EyeOff size={13} style={{ color: 'rgba(255,255,255,0.50)' }} />}
            </button>
          </div>
        </div>

        {/* Bottom row: account ref + sort code + circles */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[9px] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.30)' }}>{primaryLabel}</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs font-semibold tracking-wider truncate"
                style={{ color: theme.accentColor }}>{primaryRef}</p>
              <button onClick={handleCopy} className="p-0.5 rounded flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.10)' }}>
                {copied
                  ? <Check size={10} className="text-emerald-400" />
                  : <Copy size={10} style={{ color: 'rgba(255,255,255,0.40)' }} />}
              </button>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[9px] tracking-[0.15em] uppercase mb-1"
              style={{ color: 'rgba(255,255,255,0.30)' }}>{secondaryLabel}</p>
            <p className="font-mono text-xs font-medium tracking-wider"
              style={{ color: 'rgba(255,255,255,0.72)' }}>{secondaryRef}</p>
          </div>
          <div className="flex -space-x-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-full border border-white/15"
              style={{ background: 'rgba(201,168,76,0.75)' }} />
            <div className="w-7 h-7 rounded-full border border-white/15"
              style={{ background: 'rgba(239,68,68,0.70)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
