'use client';

import { MessageSquare, Mail, X } from 'lucide-react';
import { useMemo } from 'react';

export type SupportReason = 'blocked' | 'external-transfer' | 'transfer-restricted' | 'topup' | 'not-admin-client';

interface ContactSupportModalProps {
  open: boolean;
  reason: SupportReason;
  onClose: () => void;
}

export function ContactSupportModal({ open, reason, onClose }: ContactSupportModalProps) {
  const ref = useMemo(() => 'HC-' + Math.random().toString(36).slice(2, 8).toUpperCase(), [open]);

  if (!open) return null;

  const content: Record<SupportReason, { title: string; subtitle: string; message: string }> = {
    blocked: {
      title: 'Account Restricted',
      subtitle: 'Your account access has been suspended',
      message: 'Your account has been temporarily restricted by Halifax. Please contact our support team to resolve this and regain access.',
    },
    'external-transfer': {
      title: 'Transfer Not Permitted',
      subtitle: 'External transfers are not available',
      message: 'You can only transfer to accounts on this platform. External bank transfers are not permitted. Please contact support for assistance.',
    },
    'transfer-restricted': {
      title: 'Transfer Unavailable',
      subtitle: 'This transaction cannot be completed',
      message: 'Your account currently has transfer restrictions in place. Please contact our support team for assistance.',
    },
    topup: {
      title: 'Action Not Permitted',
      subtitle: 'You cannot add money to your account',
      message: 'Your account funding feature is currently under maintenance. We apologise for the inconvenience. Please contact our support team for assistance.',
    },
    'not-admin-client': {
      title: 'Recipient Not Found',
      subtitle: 'No matching platform account',
      message: 'The details you entered do not match any account on this platform. Only transfers to Halifax platform accounts are permitted. Please contact support for assistance.',
    },
  };

  const { title, subtitle, message } = content[reason];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div
        className="relative w-full max-w-xs rounded-3xl overflow-hidden shadow-2xl"
        style={{ background: 'rgba(17,24,39,0.98)', border: '1px solid rgba(239,68,68,0.25)' }}
      >
        {/* Header */}
        <div
          className="px-6 pt-8 pb-6 text-center relative"
          style={{ background: 'linear-gradient(135deg,#1a0000 0%,#3b0a0a 50%,#7f1d1d 100%)' }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-red-300 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.20)', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            <MessageSquare size={32} className="text-red-400" />
          </div>
          <h2 className="text-white font-bold text-lg tracking-tight">{title}</h2>
          <p className="text-red-300 text-xs mt-1">{subtitle}</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-white/60 text-sm leading-relaxed text-center">{message}</p>

          <div className="space-y-2">
            {/* WhatsApp */}
            <a
              href="https://wa.me/447877698035"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
              style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.20)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,211,102,0.15)' }}
              >
                <MessageSquare size={16} className="text-green-400" />
              </div>
              <div>
                <p className="text-white/85 text-sm font-semibold">WhatsApp Support</p>
              </div>
            </a>

            {/* Email */}
            <a
              href="mailto:halifaxapp1@gmail.com"
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl w-full"
              style={{ background: 'rgba(29,110,245,0.08)', border: '1px solid rgba(29,110,245,0.20)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(29,110,245,0.15)' }}
              >
                <Mail size={16} className="text-blue-400" />
              </div>
              <div>
                <p className="text-white/85 text-sm font-semibold">Email Support</p>
              </div>
            </a>

            <button
              onClick={onClose}
              className="w-full h-11 rounded-2xl text-sm font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.50)' }}
            >
              Close
            </button>
          </div>

          <p className="text-white/20 text-[10px] text-center">Reference: {ref} · Halifax Private Banking</p>
        </div>
      </div>
    </div>
  );
}
