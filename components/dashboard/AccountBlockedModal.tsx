'use client';

import { useMemo } from 'react';
import { ShieldX, Mail, MessageSquare, X } from 'lucide-react';

interface AccountBlockedModalProps {
  open: boolean;
  onClose: () => void;
  /** 'blocked' = account is restricted. 'transaction' = transfer is blocked by admin status. */
  reason?: 'blocked' | 'transaction';
}

export function AccountBlockedModal({ open, onClose, reason = 'blocked' }: AccountBlockedModalProps) {
  // Generate reference once per mount so it doesn't flicker on re-renders
  const ref = useMemo(() => 'HC-' + Math.random().toString(36).slice(2, 8).toUpperCase(), []);
  if (!open) return null;

  const isBlocked = reason === 'blocked';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy/85 backdrop-blur-md" onClick={onClose} />

      {/* Card */}
      <div
        className="relative w-full max-w-xs mx-4 rounded-3xl overflow-hidden shadow-2xl"
        style={{
          background: 'rgba(17,24,39,0.98)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(239,68,68,0.25)',
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-8 pb-6 text-center relative"
          style={{ background: 'linear-gradient(135deg,#1a0000 0%,#3b0a0a 50%,#7f1d1d 100%)' }}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle,white 1px,transparent 1px)', backgroundSize: '20px 20px' }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-red-300 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <ShieldX size={32} className="text-red-400" />
          </div>

          <h2 className="text-white font-bold text-lg tracking-tight">
            {isBlocked ? 'Account Restricted' : 'Transaction Unavailable'}
          </h2>
          <p className="text-red-300 text-xs mt-1">
            {isBlocked
              ? 'Your account access has been suspended'
              : 'Transactions on your account are currently restricted'}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-white/60 text-sm leading-relaxed text-center">
            {isBlocked
              ? 'Your account has been temporarily restricted by Halifax. Please contact our support team to resolve this and regain access.'
              : 'Your account has a temporary restriction on transactions. Our support team can assist you in resolving this.'}
          </p>

          {/* Support options */}
          <div className="space-y-2">
            <a
              href="mailto:halifaxapp1@gmail.com"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all w-full text-left"
              style={{ background: 'rgba(29,110,245,0.10)', border: '1px solid rgba(29,110,245,0.20)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29,110,245,0.18)' }}>
                <Mail size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white/85 text-sm font-semibold">Email Support</p>
              </div>
            </a>

            <a
              href="https://wa.me/447877698035"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all w-full text-left"
              style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.20)' }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(37,211,102,0.15)' }}>
                <MessageSquare size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white/85 text-sm font-semibold">WhatsApp Support</p>
              </div>
            </a>
          </div>

          <p className="text-white/20 text-[10px] text-center leading-relaxed">
            Reference: {ref} · Halifax Private Banking
          </p>
        </div>
      </div>
    </div>
  );
}
